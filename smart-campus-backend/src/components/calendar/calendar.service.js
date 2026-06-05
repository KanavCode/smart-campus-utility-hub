const { google } = require('googleapis');
const { query } = require('../../config/db');
const { logger } = require('../../config/db');

// ─── Period → wall-clock time mapping ────────────────────────────────────────
// Adjust these to match your institution's actual schedule.
const PERIOD_TIMES = {
  1: { start: '08:00', end: '08:55' },
  2: { start: '09:00', end: '09:55' },
  3: { start: '10:00', end: '10:55' },
  4: { start: '11:00', end: '11:55' }, // lunch break handled in timetable
  5: { start: '12:00', end: '12:55' },
  6: { start: '13:00', end: '13:55' },
  7: { start: '14:00', end: '14:55' },
  8: { start: '15:00', end: '15:55' },
};

// Maps day name → RFC 5545 BYDAY value used by Google Calendar recurring rules
const DAY_TO_RRULE = {
  Monday: 'MO',
  Tuesday: 'TU',
  Wednesday: 'WE',
  Thursday: 'TH',
  Friday: 'FR',
  Saturday: 'SA',
  Sunday: 'SU',
};

// Maps day name → ISO weekday number (0 = Sunday … 6 = Saturday)
const DAY_TO_ISO_WEEKDAY = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Build an OAuth2 client using the credentials from .env
 */
const buildOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

/**
 * Generate the Google OAuth consent URL.
 * State encodes everything needed to resume after the redirect.
 */
const getAuthUrl = ({ userId, groupId, academicYear, semesterType }) => {
  const oauth2Client = buildOAuthClient();

  const state = Buffer.from(
    JSON.stringify({ userId, groupId, academicYear, semesterType })
  ).toString('base64url');

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',   // ← essential to get a refresh_token
    prompt: 'consent',        // ← force consent so refresh_token is always returned
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'email',   // ← needed to call oauth2.userinfo.get() in the callback
    ],
    state,
  });
};

/**
 * Exchange the authorization code for tokens and persist them.
 * Returns the resolved state payload (userId, groupId, etc.)
 */
const handleOAuthCallback = async (code, stateB64) => {
  const oauth2Client = buildOAuthClient();

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Decode state
  const state = JSON.parse(Buffer.from(stateB64, 'base64url').toString('utf8'));

  // Fetch the user's Google email for display in the UI
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data: googleUser } = await oauth2.userinfo.get();

  // Persist tokens in the users table (upsert via UPDATE — no schema change needed,
  // we store as JSONB in a dedicated column we add via migration)
  await query(
    `UPDATE users
        SET google_calendar_token = $1,
            google_email          = $2,
            google_token_updated  = NOW()
      WHERE id = $3`,
    [JSON.stringify(tokens), googleUser.email, state.userId]
  );

  logger.info(`Google Calendar connected for user ${state.userId} (${googleUser.email})`);
  return state;
};

/**
 * Load a user's stored Google tokens from the DB and return a live OAuth2 client.
 * Returns null if the user has never connected.
 */
const getAuthorizedClient = async (userId) => {
  const result = await query(
    'SELECT google_calendar_token, google_email FROM users WHERE id = $1',
    [userId]
  );

  const row = result.rows[0];
  if (!row?.google_calendar_token) return null;

  const oauth2Client = buildOAuthClient();

  // pg returns JSONB columns as JS objects already — guard against double-parse
  const rawToken = row.google_calendar_token;
  const tokenObj = typeof rawToken === 'string' ? JSON.parse(rawToken) : rawToken;
  oauth2Client.setCredentials(tokenObj);

  // Auto-refresh: persist refreshed tokens back to DB
  oauth2Client.on('tokens', async (newTokens) => {
    const merged = { ...tokenObj, ...newTokens };
    await query(
      'UPDATE users SET google_calendar_token = $1, google_token_updated = NOW() WHERE id = $2',
      [JSON.stringify(merged), userId]
    );
    logger.debug(`Refreshed Google tokens for user ${userId}`);
  });

  return oauth2Client;
};

/**
 * Fetch the timetable slots for a group from the DB.
 */
const fetchTimetableSlots = async (groupId, academicYear, semesterType) => {
  const result = await query(
    `SELECT
        ts.day_of_week,
        ts.period_number,
        s.subject_name,
        s.subject_code,
        s.course_type,
        t.full_name  AS teacher_name,
        r.room_name,
        r.room_code,
        sg.group_name,
        ts.academic_year,
        ts.semester_type
      FROM timetable_slots ts
      JOIN subjects       s  ON ts.subject_id = s.id
      JOIN teachers       t  ON ts.teacher_id = t.id
      JOIN rooms          r  ON ts.room_id    = r.id
      JOIN student_groups sg ON ts.group_id   = sg.id
     WHERE ts.group_id      = $1
       AND ts.academic_year  = $2
       AND ts.semester_type  = $3
       AND ts.is_active       = true`,
    [groupId, academicYear, semesterType]
  );
  return result.rows;
};

/**
 * Given a day name and a wall-clock time string ("HH:MM"),
 * find the next upcoming occurrence of that weekday and return an ISO 8601 datetime.
 *
 * Google Calendar requires the first occurrence's datetime as the event start.
 */
const nextWeekdayDatetime = (dayName, timeStr) => {
  const now = new Date();
  const targetDay = DAY_TO_ISO_WEEKDAY[dayName];
  const diff = (targetDay - now.getDay() + 7) % 7 || 7; // at least 1 day ahead
  const date = new Date(now);
  date.setDate(now.getDate() + diff);

  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

/**
 * Translate a single timetable slot into a Google Calendar Event object.
 */
const slotToCalendarEvent = (slot) => {
  const times = PERIOD_TIMES[slot.period_number];
  if (!times) return null; // unknown period — skip

  const isLab = slot.course_type === 'Lab' || slot.course_type === 'Practical';
  const emoji = isLab ? '🧪' : '📚';

  const startDatetime = nextWeekdayDatetime(slot.day_of_week, times.start);
  const endDatetime   = nextWeekdayDatetime(slot.day_of_week, times.end);

  const rruleDay = DAY_TO_RRULE[slot.day_of_week];

  return {
    summary: `${emoji} ${slot.subject_code} — ${slot.subject_name}`,
    description: [
      `Subject: ${slot.subject_name} (${slot.subject_code})`,
      `Type: ${slot.course_type}`,
      `Teacher: ${slot.teacher_name}`,
      `Room: ${slot.room_name} (${slot.room_code})`,
      `Group: ${slot.group_name}`,
      `Period: ${slot.period_number}`,
      `Semester: ${slot.academic_year} — ${slot.semester_type}`,
      '',
      'Synced via Smart Campus Portal 🎓',
    ].join('\n'),
    location: slot.room_name,
    start: { dateTime: startDatetime, timeZone: 'Asia/Kolkata' },
    end:   { dateTime: endDatetime,   timeZone: 'Asia/Kolkata' },
    // Weekly recurring rule — ends after the academic semester (approx 20 weeks)
    recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${rruleDay};COUNT=20`],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
      ],
    },
    colorId: isLab ? '2' : '1', // sage (lab) vs. lavender (theory)
  };
};

/**
 * Push all timetable slots for a group to the user's Google Calendar.
 * Returns { eventsCreated, eventsSkipped }
 */
const syncTimetableToCalendar = async ({ userId, groupId, academicYear, semesterType }) => {
  logger.info(`[CalendarSync] Starting sync: user=${userId}, group=${groupId}, year=${academicYear}, sem=${semesterType}`);

  const authClient = await getAuthorizedClient(userId);
  if (!authClient) {
    throw new Error('Google Calendar not connected. Please authorize first.');
  }
  logger.info('[CalendarSync] Auth client obtained');

  const slots = await fetchTimetableSlots(groupId, academicYear, semesterType);
  logger.info(`[CalendarSync] Fetched ${slots.length} timetable slots`);

  if (slots.length === 0) {
    return { eventsCreated: 0, eventsSkipped: 0, message: 'No timetable slots found for this group.' };
  }

  const calendar = google.calendar({ version: 'v3', auth: authClient });

  let eventsCreated = 0;
  let eventsSkipped = 0;

  for (const slot of slots) {
    const event = slotToCalendarEvent(slot);
    if (!event) { eventsSkipped++; continue; }

    try {
      await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      eventsCreated++;
      logger.info(`[CalendarSync] ✅ Created: ${event.summary}`);
    } catch (err) {
      // GaxiosError nests the real message in err.response.data.error
      const detail = err?.response?.data?.error?.message || err?.message || String(err);
      const code   = err?.response?.status || err?.code || 'unknown';
      logger.warn(`[CalendarSync] ❌ Slot failed (${code}): ${detail} — ${event.summary}`);
      eventsSkipped++;
    }
  }

  // Record last sync time
  await query('UPDATE users SET google_last_synced = NOW() WHERE id = $1', [userId]);

  logger.info(`[CalendarSync] Done — ${eventsCreated} created, ${eventsSkipped} skipped`);
  return { eventsCreated, eventsSkipped };
};

/**
 * Get current Google Calendar connection status for a user.
 */
const getCalendarStatus = async (userId) => {
  const result = await query(
    'SELECT google_email, google_last_synced, google_calendar_token FROM users WHERE id = $1',
    [userId]
  );

  const row = result.rows[0];
  if (!row?.google_calendar_token) {
    return { connected: false };
  }

  return {
    connected: true,
    google_email: row.google_email,
    last_synced_at: row.google_last_synced,
  };
};

/**
 * Revoke Google Calendar access and clear stored tokens.
 */
const disconnectCalendar = async (userId) => {
  const result = await query(
    'SELECT google_calendar_token FROM users WHERE id = $1',
    [userId]
  );

  const row = result.rows[0];
  if (row?.google_calendar_token) {
    try {
      const oauth2Client = buildOAuthClient();
      const tokens = JSON.parse(row.google_calendar_token);
      oauth2Client.setCredentials(tokens);
      await oauth2Client.revokeCredentials();
    } catch (err) {
      logger.warn('Could not revoke Google token (may already be invalid):', err.message);
    }
  }

  await query(
    `UPDATE users
        SET google_calendar_token = NULL,
            google_email          = NULL,
            google_last_synced    = NULL,
            google_token_updated  = NULL
      WHERE id = $1`,
    [userId]
  );

  logger.info(`Google Calendar disconnected for user ${userId}`);
};

module.exports = {
  getAuthUrl,
  handleOAuthCallback,
  getAuthorizedClient,
  syncTimetableToCalendar,
  getCalendarStatus,
  disconnectCalendar,
};

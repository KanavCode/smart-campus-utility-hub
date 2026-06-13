const GOOGLE_CALENDAR_URL = 'https://calendar.google.com/calendar/render';
const TIMETABLE_RECURRENCE_COUNT = 16;

const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '09:00', end: '09:50' },
  2: { start: '10:00', end: '10:50' },
  3: { start: '11:00', end: '11:50' },
  4: { start: '12:00', end: '12:50' },
  5: { start: '14:00', end: '14:50' },
  6: { start: '15:00', end: '15:50' },
  7: { start: '16:00', end: '16:50' },
  8: { start: '17:00', end: '17:50' },
};

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

interface CalendarEventUrlOptions {
  title: string;
  start: Date;
  end: Date;
  details?: string;
  location?: string;
  recurrenceRule?: string;
}

interface TimetableCalendarOptions {
  dayOfWeek: string;
  periodNumber: number;
  subjectCode?: string;
  subjectName?: string;
  teacherName?: string;
  roomCode?: string;
  roomName?: string;
  academicYear?: string;
  semesterType?: string;
}

interface CampusEventCalendarOptions {
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  clubName?: string;
  tags?: string[];
}

const formatGoogleDate = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

const appendIfPresent = (parts: string[], label: string, value?: string): void => {
  if (value?.trim()) {
    parts.push(`${label}: ${value.trim()}`);
  }
};

const getNextDateForDay = (dayOfWeek: string): Date | null => {
  const targetDay = DAY_INDEX[dayOfWeek];
  if (targetDay === undefined) return null;

  const date = new Date();
  const daysToAdd = (targetDay - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysToAdd);
  return date;
};

const setTimeOnDate = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export const buildGoogleCalendarUrl = ({
  title,
  start,
  end,
  details,
  location,
  recurrenceRule,
}: CalendarEventUrlOptions): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Campus Event',
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
  });

  if (details?.trim()) params.set('details', details.trim());
  if (location?.trim()) params.set('location', location.trim());
  if (recurrenceRule?.trim()) params.set('recur', recurrenceRule.trim());

  return `${GOOGLE_CALENDAR_URL}?${params.toString()}`;
};

export const buildTimetableGoogleCalendarUrl = ({
  dayOfWeek,
  periodNumber,
  subjectCode,
  subjectName,
  teacherName,
  roomCode,
  roomName,
  academicYear,
  semesterType,
}: TimetableCalendarOptions): string | null => {
  const period = PERIOD_TIMES[periodNumber];
  const classDate = getNextDateForDay(dayOfWeek);
  if (!period || !classDate) return null;

  const title = [subjectCode, subjectName].filter(Boolean).join(' - ') || 'Class';
  const location = [roomCode, roomName].filter(Boolean).join(' - ');
  const details: string[] = [];
  appendIfPresent(details, 'Teacher', teacherName);
  appendIfPresent(details, 'Room', location);
  appendIfPresent(details, 'Academic Year', academicYear);
  appendIfPresent(details, 'Semester', semesterType);

  return buildGoogleCalendarUrl({
    title,
    start: setTimeOnDate(classDate, period.start),
    end: setTimeOnDate(classDate, period.end),
    details: details.join('\n'),
    location,
    recurrenceRule: `RRULE:FREQ=WEEKLY;COUNT=${TIMETABLE_RECURRENCE_COUNT}`,
  });
};

export const buildCampusEventGoogleCalendarUrl = ({
  title,
  description,
  startTime,
  endTime,
  location,
  clubName,
  tags,
}: CampusEventCalendarOptions): string | null => {
  if (!startTime) return null;

  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return null;

  const parsedEnd = endTime ? new Date(endTime) : null;
  const end =
    parsedEnd && !Number.isNaN(parsedEnd.getTime()) && parsedEnd > start
      ? parsedEnd
      : new Date(start.getTime() + 60 * 60 * 1000);

  const details: string[] = [];
  if (description?.trim()) details.push(description.trim());
  appendIfPresent(details, 'Club', clubName);
  if (tags?.length) {
    appendIfPresent(details, 'Tags', tags.filter(Boolean).join(', '));
  }

  return buildGoogleCalendarUrl({
    title,
    start,
    end,
    details: details.join('\n\n'),
    location,
  });
};

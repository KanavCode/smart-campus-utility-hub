import { api } from '@/lib/axios';
import { getBackendBaseUrl } from '@/lib/apiConfig';

export interface CalendarSyncStatus {
  connected: boolean;
  google_email?: string;
  last_synced_at?: string;
}

export interface CalendarSyncResult {
  success: boolean;
  events_created?: number;
  events_updated?: number;
  message?: string;
  error?: string;
}

export const calendarService = {
  /**
   * Initiates the Google OAuth2 flow.
   * Redirects the user to Google's consent screen.
   * The backend will handle the callback at /api/calendar/callback.
   *
   * @param groupId       - Group UUID to sync timetable for
   * @param academicYear  - e.g. "2024-25"
   * @param semesterType  - "odd" | "even"
   */
  initiateGoogleAuth: (groupId: string, academicYear: string, semesterType: string): void => {
    const backendBase = getBackendBaseUrl();
    const params = new URLSearchParams({
      group_id: groupId,
      academic_year: academicYear,
      semester_type: semesterType,
      // Pass the current frontend origin so the backend can redirect back
      redirect_origin: window.location.origin,
    });

    const authUrl = `${backendBase}/api/calendar/auth?${params.toString()}`;
    // Full-page redirect to Google OAuth — backend will redirect back here afterwards
    window.location.href = authUrl;
  },

  /**
   * Check whether the current user has already connected their Google account.
   * GET /api/calendar/status
   */
  getSyncStatus: async (): Promise<CalendarSyncStatus> => {
    try {
      const { data } = await api.get<{ success: boolean; data: CalendarSyncStatus }>(
        '/calendar/status'
      );
      return data.data;
    } catch {
      // If the endpoint doesn't exist yet (step 2 work), return disconnected gracefully
      return { connected: false };
    }
  },

  /**
   * Trigger a manual re-sync for a group timetable (after first connection).
   * POST /api/calendar/sync
   */
  syncTimetable: async (
    groupId: string,
    academicYear: string,
    semesterType: string
  ): Promise<CalendarSyncResult> => {
    const { data } = await api.post<{ success: boolean; data: CalendarSyncResult }>(
      '/calendar/sync',
      { group_id: groupId, academic_year: academicYear, semester_type: semesterType }
    );
    return data.data;
  },

  /**
   * Disconnect the user's Google Calendar integration.
   * DELETE /api/calendar/disconnect
   */
  disconnect: async (): Promise<void> => {
    await api.delete('/calendar/disconnect');
  },
};

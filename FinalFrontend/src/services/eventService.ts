import { api } from '@/lib/axios';

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  club_id?: number;
  club_name?: string;
  club_description?: string;
  target_department?: string;
  is_featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedEvent extends Event {
  saved_at: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  club_id?: number | null;
  target_department?: string;
  is_featured?: boolean;
  tags?: string[];
}

/**
 * Convert ISO datetime string (2025-11-15T12:30:00.000Z) to datetime-local format (2025-11-15T12:30)
 * Used for datetime-local input type compatibility
 */
function formatDatetimeForInput(isoString: string): string {
  if (!isoString) return '';
  // Remove Z suffix and milliseconds: "2025-11-15T12:30:00.000Z" -> "2025-11-15T12:30:00"
  const cleaned = isoString.replace(/\.\d{3}Z$/, '').replace('Z', '');
  // Take only date and time without seconds: "2025-11-15T12:30:00" -> "2025-11-15T12:30"
  return cleaned.substring(0, 16);
}

/**
 * Convert datetime-local format (2025-11-15T12:30) to ISO string for API
 * If already ISO format, returns as-is
 * Backend expects: ISO 8601 format (yyyy-MM-ddThh:mm:ss.sssZ)
 */
function formatDatetimeForAPI(dateString: string): string {
  if (!dateString) return '';
  // If already ISO format with Z, return as-is
  if (dateString.includes('Z') || dateString.includes('+')) return dateString;
  // Convert datetime-local to ISO: "2025-11-15T12:30" -> "2025-11-15T12:30:00.000Z"
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString();
  } catch {
    // If conversion fails, return as-is and let backend validate
    return dateString;
  }
}

export const eventsService = {
  /**
   * Get all events with optional filters
   * @param filters - Search, tag, club_id, department, is_featured, upcoming
   */
  getAll: async (filters: {
    search?: string;
    tag?: string;
    club_id?: string | number;
    department?: string;
    is_featured?: string;
    upcoming?: string;
  } = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      const query = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(`/events${query}`);
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to load events' };
    }
  },

  /**
   * Get single event by ID with club and events details
   */
  getById: async (eventId: string | number): Promise<{ data: { event: Event } }> => {
    try {
      const { data } = await api.get(`/events/${eventId}`);
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to load event' };
    }
  },

  /**
   * Create a new event (Admin only)
   */
  create: async (eventData: CreateEventData): Promise<{ data: { event: Event } }> => {
    try {
      const payload = {
        ...eventData,
        start_time: formatDatetimeForAPI(eventData.start_time),
        end_time: formatDatetimeForAPI(eventData.end_time),
        tags: Array.isArray(eventData.tags) ? eventData.tags : (eventData.tags ? [eventData.tags] : [])
      };
      const { data } = await api.post('/events', payload);
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to create event' };
    }
  },

  /**
   * Update an existing event (Admin only)
   */
  update: async (
    id: string | number,
    eventData: Partial<CreateEventData>
  ): Promise<{ data: { event: Event } }> => {
    try {
      const payload = {
        ...eventData,
        ...(eventData.start_time && { start_time: formatDatetimeForAPI(eventData.start_time) }),
        ...(eventData.end_time && { end_time: formatDatetimeForAPI(eventData.end_time) }),
        ...(eventData.tags && { tags: Array.isArray(eventData.tags) ? eventData.tags : [eventData.tags] })
      };
      const { data } = await api.put(`/events/${id}`, payload);
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to update event' };
    }
  },

  /**
   * Delete an event (Admin only)
   */
  delete: async (id: string | number): Promise<{ success: boolean }> => {
    try {
      const { data } = await api.delete(`/events/${id}`);
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to delete event' };
    }
  },

  /**
   * Save an event for current user
   */
  save: async (eventId: string | number): Promise<{ success: boolean }> => {
    try {
      const { data } = await api.post(`/events/${eventId}/save`);
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to save event' };
    }
  },

  /**
   * Remove event from saved list
   */
  unsave: async (eventId: string | number): Promise<{ success: boolean }> => {
    try {
      const { data } = await api.delete(`/events/${eventId}/save`);
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to unsave event' };
    }
  },

  /**
   * Get all saved events for current user
   */
  getMySaved: async (): Promise<{ data: { events: SavedEvent[]; count: number } }> => {
    try {
      const { data } = await api.get('/events/saved/my-events');
      return data;
    } catch (error: any) {
      throw error?.response?.data || { message: 'Failed to load saved events' };
    }
  },
};

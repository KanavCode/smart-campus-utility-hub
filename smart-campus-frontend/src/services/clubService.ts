import { api } from '@/lib/axios';
import { asApiData, getPayload, getPayloadArray, withServiceError } from './serviceUtils';

export interface Club {
  id: number;
  name: string;
  description: string;
  contact_email: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ClubWithEvents extends Club {
  events: any[];
}

export const clubService = {
  /**
   * Get all clubs
   * GET /api/clubs
   * Public endpoint
   */
  getAll: async (filters?: { category?: string; search?: string }): Promise<Club[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = asApiData(await api.get(`/clubs${query}`));
      return getPayloadArray<Club>(data, 'clubs');
    } catch (error: any) {
      withServiceError(error, 'Failed to fetch clubs');
    }
  },

  /**
   * Get single club with its events
   * GET /api/clubs/:id
   * Public endpoint
   */
  getById: async (clubId: number): Promise<ClubWithEvents> => {
    try {
      const data = asApiData(await api.get(`/clubs/${clubId}`));
      return {
        ...(getPayload<Club>(data, 'club') as Club),
        events: getPayloadArray<any>(data, 'events')
      };
    } catch (error: any) {
      withServiceError(error, 'Failed to fetch club details');
    }
  },

  /**
   * Create a new club (Admin only)
   * POST /api/clubs
   */
  create: async (clubData: {
    name: string;
    description: string;
    contact_email: string;
    category: string;
  }): Promise<Club> => {
    try {
      const data = asApiData(await api.post('/clubs', clubData));
      return getPayload<Club>(data, 'club') as Club;
    } catch (error: any) {
      withServiceError(error, 'Failed to create club');
    }
  },

  /**
   * Update a club (Admin only)
   * PUT /api/clubs/:id
   */
  update: async (id: number, clubData: Partial<Club>): Promise<Club> => {
    try {
      const data = asApiData(await api.put(`/clubs/${id}`, clubData));
      return getPayload<Club>(data, 'club') as Club;
    } catch (error: any) {
      withServiceError(error, 'Failed to update club');
    }
  },

  /**
   * Delete a club (Admin only)
   * DELETE /api/clubs/:id
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/clubs/${id}`);
    } catch (error: any) {
      withServiceError(error, 'Failed to delete club');
    }
  },
};

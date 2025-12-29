import { api } from '@/lib/axios';

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
      const { data } = await api.get(`/clubs${query}`);
      return data.data.clubs;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch clubs' };
    }
  },

  /**
   * Get single club with its events
   * GET /api/clubs/:id
   * Public endpoint
   */
  getById: async (clubId: number): Promise<ClubWithEvents> => {
    try {
      const { data } = await api.get(`/clubs/${clubId}`);
      return {
        ...data.data.club,
        events: data.data.events
      };
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch club details' };
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
      const { data } = await api.post('/clubs', clubData);
      return data.data.club;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to create club' };
    }
  },

  /**
   * Update a club (Admin only)
   * PUT /api/clubs/:id
   */
  update: async (id: number, clubData: Partial<Club>): Promise<Club> => {
    try {
      const { data } = await api.put(`/clubs/${id}`, clubData);
      return data.data.club;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update club' };
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
      throw error.response?.data || { message: 'Failed to delete club' };
    }
  },
};

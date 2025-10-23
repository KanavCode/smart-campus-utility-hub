import { api } from '@/lib/axios';

export const clubService = {
  getAll: async (filters = {}) => {
    // TODO: Backend integration
    // const params = new URLSearchParams(filters).toString();
    // const query = params ? `?${params}` : '';
    // const { data } = await api.get(`/clubs${query}`);
    // return data;
    console.log('Fetching all clubs');
    return { data: { clubs: [], count: 0 } };
  },

  getById: async (clubId: string) => {
    // TODO: Backend integration
    // const { data } = await api.get(`/clubs/${clubId}`);
    // return data;
    console.log('Fetching club:', clubId);
    return { data: {} };
  },

  create: async (clubData: any) => {
    // TODO: Backend integration
    // const { data } = await api.post('/clubs', clubData);
    // return data;
    console.log('Creating club:', clubData);
  },

  update: async (id: string, clubData: any) => {
    // TODO: Backend integration
    // const { data } = await api.put(`/clubs/${id}`, clubData);
    // return data;
    console.log('Updating club:', id, clubData);
  },

  delete: async (id: string) => {
    // TODO: Backend integration
    // await api.delete(`/clubs/${id}`);
    console.log('Deleting club:', id);
  },
};

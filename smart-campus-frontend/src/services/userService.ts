import { api } from '@/lib/axios';

export const userService = {
  getAll: async () => {
    // TODO: Backend integration
    // const { data } = await api.get('/users');
    // return data;
    console.log('Fetching all users');
    return [];
  },

  create: async (userData: any) => {
    // TODO: Backend integration
    // const { data } = await api.post('/users', userData);
    // return data;
    console.log('Creating user:', userData);
  },

  update: async (id: string, userData: any) => {
    // TODO: Backend integration
    // const { data } = await api.put(`/users/${id}`, userData);
    // return data;
    console.log('Updating user:', id, userData);
  },

  delete: async (id: string) => {
    // TODO: Backend integration
    // await api.delete(`/users/${id}`);
    console.log('Deleting user:', id);
  },
};

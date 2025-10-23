import { api } from '@/lib/axios';

export const roomService = {
  getAll: async () => {
    // TODO: Backend integration
    // const { data } = await api.get('/rooms');
    // return data;
    console.log('Fetching all rooms');
    return [];
  },

  create: async (roomData: any) => {
    // TODO: Backend integration
    // const { data } = await api.post('/rooms', roomData);
    // return data;
    console.log('Creating room:', roomData);
  },

  update: async (id: string, roomData: any) => {
    // TODO: Backend integration
    // const { data } = await api.put(`/rooms/${id}`, roomData);
    // return data;
    console.log('Updating room:', id, roomData);
  },

  delete: async (id: string) => {
    // TODO: Backend integration
    // await api.delete(`/rooms/${id}`);
    console.log('Deleting room:', id);
  },
};

import { api } from '@/lib/axios';

export const teacherService = {
  getAll: async () => {
    // TODO: Backend integration
    // const { data } = await api.get('/teachers');
    // return data;
    console.log('Fetching all teachers');
    return [];
  },

  create: async (teacherData: any) => {
    // TODO: Backend integration
    // const { data } = await api.post('/teachers', teacherData);
    // return data;
    console.log('Creating teacher:', teacherData);
  },

  update: async (id: string, teacherData: any) => {
    // TODO: Backend integration
    // const { data } = await api.put(`/teachers/${id}`, teacherData);
    // return data;
    console.log('Updating teacher:', id, teacherData);
  },

  delete: async (id: string) => {
    // TODO: Backend integration
    // await api.delete(`/teachers/${id}`);
    console.log('Deleting teacher:', id);
  },
};

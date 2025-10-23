import { api } from '@/lib/axios';

export const subjectService = {
  getAll: async () => {
    // TODO: Backend integration
    // const { data } = await api.get('/subjects');
    // return data;
    console.log('Fetching all subjects');
    return [];
  },

  create: async (subjectData: any) => {
    // TODO: Backend integration
    // const { data } = await api.post('/subjects', subjectData);
    // return data;
    console.log('Creating subject:', subjectData);
  },

  update: async (id: string, subjectData: any) => {
    // TODO: Backend integration
    // const { data } = await api.put(`/subjects/${id}`, subjectData);
    // return data;
    console.log('Updating subject:', id, subjectData);
  },

  delete: async (id: string) => {
    // TODO: Backend integration
    // await api.delete(`/subjects/${id}`);
    console.log('Deleting subject:', id);
  },
};

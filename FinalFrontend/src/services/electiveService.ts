import { api } from '@/lib/axios';

export const electiveService = {
  getAll: async () => {
    // TODO: Backend integration
    // const { data } = await api.get('/electives');
    // return data;
    console.log('Fetching all electives');
    return [];
  },

  submitPreferences: async (preferences: any[]) => {
    // TODO: Backend integration
    // const { data } = await api.post('/electives/preferences', { preferences });
    // return data;
    console.log('Submitting preferences:', preferences);
  },

  runAllocation: async () => {
    // TODO: Backend integration
    // const { data } = await api.post('/electives/allocate');
    // return data;
    console.log('Running allocation');
  },

  create: async (electiveData: any) => {
    // TODO: Backend integration
    // const { data } = await api.post('/electives', electiveData);
    // return data;
    console.log('Creating elective:', electiveData);
  },

  update: async (id: string, electiveData: any) => {
    // TODO: Backend integration
    // const { data } = await api.put(`/electives/${id}`, electiveData);
    // return data;
    console.log('Updating elective:', id, electiveData);
  },

  delete: async (id: string) => {
    // TODO: Backend integration
    // await api.delete(`/electives/${id}`);
    console.log('Deleting elective:', id);
  },
};

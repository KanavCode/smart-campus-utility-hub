import { timetableService } from './timetableService';
import { api } from '@/lib/axios';

export const teacherService = {
  getAll: async () => {
    const response = await timetableService.getTeachers();
    return response?.data?.teachers || [];
  },

  create: async (teacherData: any) => {
    const response = await timetableService.createTeacher(teacherData);
    return response?.data?.teacher;
  },

  update: async (id: string, teacherData: any) => {
    const { data } = await api.put(`/timetable/teachers/${id}`, teacherData);
    return data?.data?.teacher;
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/teachers/${id}`);
  },
};

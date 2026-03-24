import { timetableService } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';

export const teacherService = {
  getAll: async () => {
    const response = await timetableService.getTeachers();
    return getPayloadArray<any>(response, 'teachers');
  },

  create: async (teacherData: any) => {
    const response = await timetableService.createTeacher(teacherData);
    return getPayload<any>(response, 'teacher');
  },

  update: async (id: string, teacherData: any) => {
    const { data } = await api.put(`/timetable/teachers/${id}`, teacherData);
    return getPayload<any>(data, 'teacher');
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/teachers/${id}`);
  },
};

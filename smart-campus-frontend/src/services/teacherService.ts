import { timetableService } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';
import { TeacherFormData } from '@/types';

export const teacherService = {
  getAll: async () => {
    const response = await timetableService.getTeachers();
    return getPayloadArray(response, 'teachers');
  },

  create: async (teacherData: TeacherFormData) => {
    const response = await timetableService.createTeacher(teacherData);
    return getPayload(response, 'teacher');
  },

  update: async (id: string, teacherData: TeacherFormData) => {
    const { data } = await api.put(`/timetable/teachers/${id}`, teacherData);
    return getPayload(data, 'teacher');
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/teachers/${id}`);
  },
};

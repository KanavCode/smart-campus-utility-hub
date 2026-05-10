import { timetableService, PaginationSortParams } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';
import { TeacherFormData } from '@/types';

export const teacherService = {
  getAll: async () => {
    const response = await timetableService.getTeachers();
    return getPayloadArray(response, 'teachers');
  },

  list: async (params: PaginationSortParams) => {
    const response = await timetableService.getTeachers('', params);
    return {
      items: getPayloadArray<any>(response, 'teachers'),
      total: (response?.data?.total as number) ?? 0,
      page: (response?.data?.page as number) ?? (params.page ?? 1),
      limit: (response?.data?.limit as number) ?? (params.limit ?? 20),
    };
  },

  create: async (teacherData: any) => {
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

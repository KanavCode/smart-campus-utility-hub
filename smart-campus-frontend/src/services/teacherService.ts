import { timetableService } from './timetableService';

const NOT_SUPPORTED_MESSAGE = 'Teacher update/delete is not available yet in the backend API.';

export const teacherService = {
  getAll: async () => {
    const response = await timetableService.getTeachers();
    return response?.data?.teachers || [];
  },

  create: async (teacherData: any) => {
    const response = await timetableService.createTeacher(teacherData);
    return response?.data?.teacher;
  },

  update: async (_id: string, _teacherData: any) => {
    throw new Error(NOT_SUPPORTED_MESSAGE);
  },

  delete: async (_id: string) => {
    throw new Error(NOT_SUPPORTED_MESSAGE);
  },
};

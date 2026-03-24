import { timetableService } from './timetableService';

const NOT_SUPPORTED_MESSAGE = 'Subject update/delete is not available yet in the backend API.';

export const subjectService = {
  getAll: async () => {
    const response = await timetableService.getSubjects();
    const subjects = response?.data?.subjects || [];
    return subjects.map((subject: any) => ({
      ...subject,
      code: subject.subject_code,
      name: subject.subject_name,
      credits: subject.hours_per_week,
    }));
  },

  create: async (subjectData: any) => {
    const response = await timetableService.createSubject(subjectData);
    return response?.data?.subject;
  },

  update: async (_id: string, _subjectData: any) => {
    throw new Error(NOT_SUPPORTED_MESSAGE);
  },

  delete: async (_id: string) => {
    throw new Error(NOT_SUPPORTED_MESSAGE);
  },
};

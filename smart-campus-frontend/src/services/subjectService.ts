import { timetableService, PaginationSortParams } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';
import { SubjectFormData } from '@/types';

const normalizeSubject = (subject: Partial<SubjectFormData> & Record<string, any>) => ({
  ...subject,
  code: (subject as any).subject_code,
  name: (subject as any).subject_name,
  credits: (subject as any).hours_per_week,
});

export const subjectService = {
  getAll: async () => {
    const response = await timetableService.getSubjects();
    const subjects = getPayloadArray(response, 'subjects');
    return subjects.map(normalizeSubject);
  },

  list: async (params: PaginationSortParams) => {
    const response = await timetableService.getSubjects({}, params);
    const subjects = getPayloadArray<any>(response, 'subjects');
    return {
      items: subjects.map(normalizeSubject),
      total: (response?.data?.total as number) ?? 0,
      page: (response?.data?.page as number) ?? (params.page ?? 1),
      limit: (response?.data?.limit as number) ?? (params.limit ?? 20),
    };
  },

  create: async (subjectData: any) => {
    const response = await timetableService.createSubject(subjectData);
    return getPayload(response, 'subject');
  },

  update: async (id: string, subjectData: any) => {
    const payload = {
      subject_code: subjectData.subject_code || subjectData.code,
      subject_name: subjectData.subject_name || subjectData.name,
      hours_per_week: subjectData.hours_per_week || subjectData.credits,
      course_type: subjectData.course_type,
      department: subjectData.department,
      semester: subjectData.semester,
    };
    const { data } = await api.put(`/timetable/subjects/${id}`, payload);
    return normalizeSubject(getPayload(data, 'subject') || {});
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/subjects/${id}`);
  },
};

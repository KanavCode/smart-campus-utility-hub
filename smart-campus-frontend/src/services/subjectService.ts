import { timetableService } from './timetableService';
import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';

const normalizeSubject = (subject: any) => ({
  ...subject,
  code: subject.subject_code,
  name: subject.subject_name,
  credits: subject.hours_per_week,
});

export const subjectService = {
  getAll: async () => {
    const response = await timetableService.getSubjects();
    const subjects = getPayloadArray<any>(response, 'subjects');
    return subjects.map(normalizeSubject);
  },

  create: async (subjectData: any) => {
    const response = await timetableService.createSubject(subjectData);
    return getPayload<any>(response, 'subject');
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
    return normalizeSubject(getPayload<any>(data, 'subject'));
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/subjects/${id}`);
  },
};

import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';

const normalizeUser = (user: any) => ({
  ...user,
  name: user.full_name,
});

export const userService = {
  getAll: async () => {
    const { data } = await api.get('/users');
    const users = getPayloadArray<any>(data, 'users');
    return users.map(normalizeUser);
  },

  create: async (userData: any) => {
    const payload: any = {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      department: userData.department || undefined,
    };

    if (userData.role === 'student') {
      payload.cgpa = userData.cgpa;
      payload.semester = userData.semester;
    }

    const { data } = await api.post('/auth/register', payload);
    return normalizeUser(getPayload<any>(data, 'user'));
  },

  update: async (id: string, userData: any) => {
    const payload: any = {
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      department: userData.department || null,
      is_active: userData.is_active,
    };

    if (userData.role === 'student') {
      payload.cgpa = userData.cgpa;
      payload.semester = userData.semester;
    } else {
      payload.cgpa = null;
      payload.semester = null;
    }

    const { data } = await api.put(`/users/${id}`, payload);
    return normalizeUser(getPayload<any>(data, 'user'));
  },

  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

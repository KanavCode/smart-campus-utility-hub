import { api } from '@/lib/axios';

const UPDATE_NOT_SUPPORTED_MESSAGE = 'Updating arbitrary users is not supported by the current backend API.';

const normalizeUser = (user: any) => ({
  ...user,
  name: user.full_name,
});

export const userService = {
  getAll: async () => {
    const { data } = await api.get('/users');
    const users = data?.data?.users || [];
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
    return normalizeUser(data?.data?.user);
  },

  update: async (_id: string, _userData: any) => {
    throw new Error(UPDATE_NOT_SUPPORTED_MESSAGE);
  },

  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

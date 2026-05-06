import { api } from '@/lib/axios';
import { getPayload, getPayloadArray } from './serviceUtils';
import { User, ApiResponse, UserFormData } from '@/types';

export interface UserFilterParams {
  role?: string;
  department?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

const normalizeUser = (user: Partial<User>): User & { name: string } => ({
  ...(user as User),
  name: (user as User).full_name,
});

export const userService = {
  getAll: async (): Promise<Array<User & { name: string }>> => {
    const { data } = await api.get<ApiResponse<{ users: User[] }>>('/users');
    const users = getPayloadArray<User>(data.data as any, 'users');
    return users.map(normalizeUser);
  },

  getAllWithFilters: async (filters: UserFilterParams): Promise<Array<User & { name: string }>> => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.department) params.append('department', filters.department);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    const { data } = await api.get<ApiResponse<{ users: User[] }>>(url);
    const users = getPayloadArray<User>(data.data as any, 'users');
    return users.map(normalizeUser);
  },

  create: async (userData: UserFormData): Promise<User & { name: string }> => {
    const payload: UserFormData = {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      department: userData.department,
    };

    if (userData.role === 'student') {
      payload.cgpa = userData.cgpa;
      payload.semester = userData.semester;
    }

    const { data } = await api.post<ApiResponse<{ user: User }>>('/auth/register', payload);
    return normalizeUser(getPayload<User>(data.data as any, 'user') || {});
  },

  update: async (id: string | number, userData: UserFormData): Promise<User & { name: string }> => {
    const payload: UserFormData = {
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      is_active: userData.is_active,
    };

    if (userData.role === 'student') {
      payload.cgpa = userData.cgpa;
      payload.semester = userData.semester;
    } else {
      payload.cgpa = undefined;
      payload.semester = undefined;
    }

    const { data } = await api.put<ApiResponse<{ user: User }>>(`/users/${id}`, payload);
    return normalizeUser(getPayload<User>(data.data as any, 'user') || {});
  },

  delete: async (id: string | number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

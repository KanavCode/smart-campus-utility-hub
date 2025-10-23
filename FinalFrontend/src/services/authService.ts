import { api } from '@/lib/axios';

export const authService = {
  login: async (email: string, password: string) => {
    // TODO: Backend integration
    // const { data } = await api.post('/auth/login', { email, password });
    // return data;
    console.log('Login:', { email, password });
  },

  register: async (userData: any) => {
    // TODO: Backend integration
    // const { data } = await api.post('/auth/register', {
    //   full_name: userData.full_name,
    //   email: userData.email,
    //   password: userData.password,
    //   role: userData.role,
    //   department: userData.department,
    //   semester: userData.semester,
    //   cgpa: userData.cgpa
    // });
    // return data;
    console.log('Register:', userData);
  },

  getProfile: async () => {
    // TODO: Backend integration
    // const { data } = await api.get('/auth/profile');
    // return data;
    console.log('Get profile');
  },

  updateProfile: async (updates: any) => {
    // TODO: Backend integration
    // const { data } = await api.put('/auth/profile', updates);
    // return data;
    console.log('Update profile:', updates);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    // TODO: Backend integration
    // const { data } = await api.post('/auth/change-password', {
    //   current_password: currentPassword,
    //   new_password: newPassword
    // });
    // return data;
    console.log('Change password');
  },

  logout: async () => {
    // TODO: Backend integration
    // await api.post('/auth/logout');
    console.log('Logout');
  },
};

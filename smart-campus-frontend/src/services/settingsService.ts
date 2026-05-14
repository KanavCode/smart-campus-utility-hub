import { api } from '@/lib/axios';
import { asApiData, withServiceError } from './serviceUtils';
import { ApiResponse } from '@/types';

export interface AdminSettings {
  academic_year: string;
  current_semester: 'Fall' | 'Spring' | 'Summer';
  campus_name: string;
}

export const settingsService = {
  get: async (): Promise<ApiResponse<{ settings: AdminSettings }>> => {
    try {
      return asApiData(await api.get('/settings'));
    } catch (error) {
      return withServiceError(error, 'Failed to load settings');
    }
  },

  update: async (settings: AdminSettings): Promise<ApiResponse<{ settings: AdminSettings }>> => {
    try {
      return asApiData(await api.put('/settings', settings));
    } catch (error) {
      return withServiceError(error, 'Failed to save settings');
    }
  }
};

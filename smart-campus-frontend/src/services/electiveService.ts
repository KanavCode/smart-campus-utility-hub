import { api } from '@/lib/axios';

export interface Elective {
  id: number;
  subject_name: string;
  description: string;
  max_students: number;
  department: string;
  semester: number;
  created_at: string;
  updated_at: string;
}

export interface StudentChoice {
  preference_rank: number;
  id: number;
  subject_name: string;
  description: string;
  max_students: number;
  department: string;
  semester: number;
}

export interface StudentAllocation {
  id: number;
  student_id: number;
  elective_id: number;
  allocation_round: number;
  subject_name: string;
  description: string;
  department: string;
}

export interface AllocationResult {
  student_name: string;
  cgpa: number;
  allocated_elective: string;
  preference_rank: number | null;
}

export const electiveService = {
  /**
   * Get all electives (public endpoint)
   */
  getAll: async (filters?: { department?: string; semester?: number }): Promise<Elective[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.department) params.append('department', filters.department);
      if (filters?.semester) params.append('semester', filters.semester.toString());
      
      const { data } = await api.get(`/electives${params.toString() ? `?${params.toString()}` : ''}`);
      return data.data.electives;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch electives' };
    }
  },

  /**
   * Get specific elective by ID (public endpoint)
   */
  getById: async (id: number): Promise<Elective> => {
    try {
      const { data } = await api.get(`/electives/${id}`);
      return data.data.elective;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch elective' };
    }
  },

  /**
   * Create new elective (admin only)
   */
  create: async (electiveData: {
    subject_name: string;
    description: string;
    max_students?: number;
    department: string;
    semester: number;
  }): Promise<Elective> => {
    try {
      const { data } = await api.post('/electives', electiveData);
      return data.data.elective;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to create elective' };
    }
  },

  /**
   * Update elective (admin only)
   */
  update: async (id: number, electiveData: Partial<Elective>): Promise<Elective> => {
    try {
      const { data } = await api.put(`/electives/${id}`, electiveData);
      return data.data.elective;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update elective' };
    }
  },

  /**
   * Delete elective (admin only)
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/electives/${id}`);
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to delete elective' };
    }
  },

  /**
   * Submit elective choices (student only)
   * Expects array of choices with subject_name and preference_rank
   */
  submitChoices: async (choices: Array<{ subject_name: string; preference_rank: number }>): Promise<void> => {
    try {
      await api.post('/electives/choices', { choices });
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to submit elective choices' };
    }
  },

  /**
   * Get user's elective choices (student only)
   */
  getMyChoices: async (): Promise<StudentChoice[]> => {
    try {
      const { data } = await api.get('/electives/my/choices');
      return data.data.choices;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch your choices' };
    }
  },

  /**
   * Get user's allocated elective (student only)
   */
  getMyAllocation: async (): Promise<StudentAllocation | null> => {
    try {
      const { data } = await api.get('/electives/my/allocation');
      return data.data.allocation;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch your allocation' };
    }
  },

  /**
   * Run elective allocation algorithm (admin only)
   */
  runAllocation: async (): Promise<AllocationResult[]> => {
    try {
      const { data } = await api.post('/electives/allocate', {});
      return data.data.allocationResults;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to run allocation' };
    }
  },
};

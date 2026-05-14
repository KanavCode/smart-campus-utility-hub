import { api } from '@/lib/axios';
import { asApiData, getPayload, getPayloadArray, withServiceError } from './serviceUtils';
import { Elective, ApiResponse } from '@/types';

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
  student_id?: number;
  student_name: string;
  cgpa: number;
  allocated_elective: string;
  preference_rank: number | null;
}

export interface WaitlistEntry {
  id: number;
  elective_id: number;
  preference_rank: number;
  status: 'waiting' | 'allocated' | 'skipped' | 'removed';
  created_at: string;
  allocated_at?: string | null;
  subject_name: string;
  department: string;
  semester: number;
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
      
      const data = asApiData(await api.get(`/electives${params.toString() ? `?${params.toString()}` : ''}`));
      return getPayloadArray<Elective>(data, 'electives');
    } catch (error) {
      withServiceError(error, 'Failed to fetch electives');
    }
  },

  /**
   * Get specific elective by ID (public endpoint)
   */
  getById: async (id: number): Promise<Elective> => {
    try {
      const data = asApiData(await api.get(`/electives/${id}`));
      return getPayload<Elective>(data, 'elective') as Elective;
    } catch (error) {
      withServiceError(error, 'Failed to fetch elective');
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
      const data = asApiData(await api.post('/electives', electiveData));
      return getPayload<Elective>(data, 'elective') as Elective;
    } catch (error) {
      withServiceError(error, 'Failed to create elective');
    }
  },

  /**
   * Update elective (admin only)
   */
  update: async (id: number, electiveData: Partial<Elective>): Promise<Elective> => {
    try {
      const data = asApiData(await api.put(`/electives/${id}`, electiveData));
      return getPayload<Elective>(data, 'elective') as Elective;
    } catch (error) {
      withServiceError(error, 'Failed to update elective');
    }
  },

  /**
   * Delete elective (admin only)
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/electives/${id}`);
    } catch (error) {
      withServiceError(error, 'Failed to delete elective');
    }
  },

  /**
   * Submit elective choices (student only)
   * Expects array of choices with subject_name and preference_rank
   */
  submitChoices: async (choices: Array<{ subject_name: string; preference_rank: number }>): Promise<void> => {
    try {
      await api.post('/electives/choices', { choices });
    } catch (error) {
      withServiceError(error, 'Failed to submit elective choices');
    }
  },

  /**
   * Get user's elective choices (student only)
   */
  getMyChoices: async (): Promise<StudentChoice[]> => {
    try {
      const data = asApiData(await api.get('/electives/my/choices'));
      return getPayloadArray<StudentChoice>(data, 'choices');
    } catch (error) {
      withServiceError(error, 'Failed to fetch your choices');
    }
  },

  /**
   * Get user's allocated elective (student only)
   */
  getMyAllocation: async (): Promise<StudentAllocation | null> => {
    try {
      const data = asApiData(await api.get('/electives/my/allocation'));
      return (getPayload<StudentAllocation | null>(data, 'allocation') ?? null) as StudentAllocation | null;
    } catch (error) {
      withServiceError(error, 'Failed to fetch your allocation');
    }
  },

  getMyWaitlist: async (): Promise<WaitlistEntry[]> => {
    try {
      const data = asApiData(await api.get('/electives/my/waitlist'));
      return getPayloadArray<WaitlistEntry>(data, 'waitlist');
    } catch (error) {
      withServiceError(error, 'Failed to fetch your waitlist status');
    }
  },

  /**
   * Run elective allocation algorithm (admin only)
   */
  runAllocation: async (): Promise<AllocationResult[]> => {
    try {
      const data = asApiData(await api.post('/electives/allocate', {}));
      return getPayloadArray<AllocationResult>(data, 'allocationResults');
    } catch (error: any) {
      withServiceError(error, 'Failed to run allocation');
    }
  },

  processWaitlist: async (electiveId?: number): Promise<{ promotedCount: number }> => {
    try {
      const data = asApiData(await api.post('/electives/waitlist/process', electiveId ? { elective_id: electiveId } : {}));
      return (data as { data: { promotedCount: number } }).data;
    } catch (error: any) {
      withServiceError(error, 'Failed to process waitlist');
    }
  },
};

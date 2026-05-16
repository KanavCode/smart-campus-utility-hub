import { api } from '@/lib/axios';
import { asApiData } from './serviceUtils';

export interface SearchResult {
  id: number;
  name: string;
  description: string;
  type: 'event' | 'club' | 'elective' | 'subject' | 'teacher';
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    results: SearchResult[];
    query: string;
    count: number;
  };
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

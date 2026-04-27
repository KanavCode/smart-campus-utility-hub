import { ApiResponse, ApiError } from '@/types';

export const getPayload = <T = unknown>(data: ApiResponse<any>, key: string): T | undefined => {
  return (data?.data as any)?.[key] as T | undefined;
};

export const getPayloadArray = <T = unknown>(data: ApiResponse<any>, key: string): T[] => {
  return ((data?.data as any)?.[key] as T[]) || [];
};

export const withServiceError = (error: any, fallbackMessage: string): never => {
  const apiError = error?.response?.data as ApiError | undefined;
  throw apiError || { message: fallbackMessage };
};

export const asApiData = <T = unknown>(response: { data: T }): T => response.data;

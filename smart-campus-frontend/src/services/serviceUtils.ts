import { ApiResponse, ApiError } from '@/types';

export const getPayload = <T = unknown>(data: ApiResponse<unknown>, key: string): T | undefined => {
  return ((data?.data as Record<string, unknown>)?.[key] as T) || undefined;
};

export const getPayloadArray = <T = unknown>(data: ApiResponse<unknown>, key: string): T[] => {
  return ((data?.data as Record<string, unknown>)?.[key] as T[]) || [];
};

export const withServiceError = (error: unknown, fallbackMessage: string): never => {
  const apiError = (error as { response?: { data?: ApiError } })?.response?.data;
  throw apiError || { message: fallbackMessage };
};

export const asApiData = <T = unknown>(response: { data: T }): T => response.data;

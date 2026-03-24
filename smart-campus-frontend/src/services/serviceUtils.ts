export const getPayload = <T = unknown>(data: any, key: string): T | undefined => {
  return data?.data?.[key] as T | undefined;
};

export const getPayloadArray = <T = unknown>(data: any, key: string): T[] => {
  return (data?.data?.[key] as T[]) || [];
};

export const withServiceError = (error: any, fallbackMessage: string) => {
  throw error?.response?.data || { message: fallbackMessage };
};

export const asApiData = <T = unknown>(response: { data: T }): T => response.data;

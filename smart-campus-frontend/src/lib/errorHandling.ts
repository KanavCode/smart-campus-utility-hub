import { z } from 'zod';

/**
 * Extracts per-field and general errors from a ZodError.
 */
export const extractZodErrors = (
  error: z.ZodError
): { fieldErrors: Record<string, string>; generalError: string | null } => {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0] as string | undefined;
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return {
    fieldErrors,
    generalError: Object.keys(fieldErrors).length === 0 ? error.issues[0]?.message ?? null : null,
  };
};

/**
 * Extracts per-field and general errors from an unknown API error.
 * Handles Axios error shapes as well as plain Error / ApiError objects.
 */
export const extractApiErrors = (
  error: unknown
): { fieldErrors: Record<string, string>; generalError: string | null } => {
  // Zod validation error
  if (error instanceof z.ZodError) {
    return extractZodErrors(error);
  }

  // Axios / fetch structured API error  { response.data.errors: { field: message } }
  const axiosData = (error as any)?.response?.data;
  if (axiosData) {
    if (axiosData.errors && typeof axiosData.errors === 'object') {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msg] of Object.entries(axiosData.errors)) {
        fieldErrors[key] = String(msg);
      }
      return { fieldErrors, generalError: null };
    }
    if (axiosData.message) {
      return { fieldErrors: {}, generalError: String(axiosData.message) };
    }
  }

  // Plain Error / ApiError
  const message = (error as any)?.message;
  return {
    fieldErrors: {},
    generalError: typeof message === 'string' ? message : 'An unexpected error occurred',
  };
};

/**
 * Merges two error maps, giving priority to the second (API errors override
 * client-side inline errors for the same field).
 */
export const mergeErrors = (
  clientErrors: Record<string, string>,
  apiErrors: Record<string, string>
): Record<string, string> => ({ ...clientErrors, ...apiErrors });

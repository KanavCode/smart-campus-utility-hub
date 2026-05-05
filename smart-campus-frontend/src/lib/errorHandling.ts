import { AxiosError } from 'axios';
import { ZodError } from 'zod';

export interface FieldError {
  field: string;
  message: string;
}

export interface FormErrorResponse {
  fieldErrors: Record<string, string>;
  generalError?: string;
}

/**
 * Extract field-specific errors from Zod validation
 */
export const extractZodErrors = (error: ZodError): FormErrorResponse => {
  const fieldErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    fieldErrors[path] = err.message;
  });

  return { fieldErrors };
};

/**
 * Extract field-specific errors from API response
 */
export const extractApiErrors = (error: unknown): FormErrorResponse => {
  const axiosError = error as AxiosError<any>;

  // Handle validation errors from backend
  if (axiosError?.response?.status === 400) {
    const data = axiosError.response.data;
    
    // Backend might return errors in different formats
    if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
      return {
        fieldErrors: data.fieldErrors,
        generalError: data.message,
      };
    }

    // Or as a flat error message
    if (data?.message) {
      return {
        fieldErrors: {},
        generalError: data.message,
      };
    }

    // Or as validation array
    if (Array.isArray(data?.errors)) {
      const fieldErrors: Record<string, string> = {};
      data.errors.forEach((err: any) => {
        if (err.field && err.message) {
          fieldErrors[err.field] = err.message;
        }
      });
      return { fieldErrors, generalError: data.message };
    }
  }

  // Handle server errors
  if (axiosError?.response?.status === 500) {
    return {
      fieldErrors: {},
      generalError: 'Server error. Please try again later.',
    };
  }

  // Handle network errors
  if (axiosError?.message === 'Network Error') {
    return {
      fieldErrors: {},
      generalError: 'Network error. Please check your connection.',
    };
  }

  // Handle timeout
  if (axiosError?.code === 'ECONNABORTED') {
    return {
      fieldErrors: {},
      generalError: 'Request timeout. Please try again.',
    };
  }

  return {
    fieldErrors: {},
    generalError: axiosError?.message || 'An unexpected error occurred',
  };
};

/**
 * Merge multiple error sources
 */
export const mergeErrors = (
  validationErrors: Record<string, string>,
  apiErrors: Record<string, string>
): Record<string, string> => {
  return { ...validationErrors, ...apiErrors };
};

/**
 * Format field error message with context
 */
export const formatFieldError = (
  field: string,
  message: string,
  context?: string
): string => {
  if (context) {
    return `${context} - ${message}`;
  }
  return message;
};

/**
 * Check if a specific field has an error
 */
export const hasFieldError = (
  fieldErrors: Record<string, string>,
  field: string
): boolean => {
  return field in fieldErrors && fieldErrors[field]?.length > 0;
};

/**
 * Get error message for a field
 */
export const getFieldError = (
  fieldErrors: Record<string, string>,
  field: string
): string | undefined => {
  return fieldErrors[field];
};

/**
 * Transform form errors to be displayed above the form
 */
export const toDisplayErrors = (
  fieldErrors: Record<string, string>,
  generalError?: string
): { field: string; message: string }[] => {
  const errors: FieldError[] = [];

  // Add general error first
  if (generalError) {
    errors.push({ field: 'general', message: generalError });
  }

  // Add field errors
  Object.entries(fieldErrors).forEach(([field, message]) => {
    errors.push({ field, message });
  });

  return errors;
};

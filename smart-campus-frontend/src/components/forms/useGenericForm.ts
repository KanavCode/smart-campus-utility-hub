import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ApiError } from '@/types';
import { extractZodErrors, extractApiErrors, mergeErrors } from '@/lib/errorHandling';
import { FieldConfig, CrudService, UseGenericFormReturn } from './types';

export const useGenericForm = (
  fields: FieldConfig[],
  service: CrudService,
  initialData?: any,
  onSuccess?: () => void,
  validationSchema?: z.ZodSchema,
  customSubmitHandler?: (data: any, isUpdate: boolean) => Promise<void>
): UseGenericFormReturn => {
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData
      ? { ...initialData }
      : fields.reduce((acc, field) => ({ ...acc, [field.id]: field.type === 'checkbox' ? false : '' }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Client-side inline errors (per-field, shown after touch)
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});
  // Server-side field errors returned from the API
  const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});
  // Tracks which fields the user has interacted with
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Abort controller so in-flight requests can be cancelled on unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build validation schema from fields if not provided
  const buildDefaultSchema = () => {
    const schemaShape: Record<string, any> = {};

    fields.forEach((field) => {
      let schema: any;

      switch (field.type) {
        case 'email':
          schema = z.string().email('Invalid email address');
          break;
        case 'number':
          schema = z.coerce.number().or(z.string().optional());
          break;
        case 'checkbox':
          schema = z.boolean().optional();
          break;
        default:
          schema = z.string();
      }

      if (!field.required) {
        schema = schema.optional();
      } else {
        schema = schema.refine((val: unknown) => {
          if (field.type === 'checkbox') return true;
          if (typeof val === 'number') return !isNaN(val);
          return val != null && String(val).trim().length > 0;
        }, `${field.label} is required`);
      }

      schemaShape[field.id] = schema;
    });

    return z.object(schemaShape);
  };

  const schema = validationSchema || buildDefaultSchema();

  /**
   * Re-validate the entire form against the schema.
   * Only surfaces errors for fields the user has already touched.
   */
  const revalidate = useCallback(
    (data: Record<string, any>, touched: Record<string, boolean>) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as string;
          if (touched[key] && !errors[key]) {
            errors[key] = issue.message;
          }
        }
        setInlineErrors(errors);
      } else {
        setInlineErrors({});
      }
    },
    [schema]
  );

  // Cancel any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const register = useCallback(
    (fieldId: string) => ({
      value: formData[fieldId] ?? '',
      onChange: (value: any) => {
        const updated = { ...formData, [fieldId]: value };
        const newTouched = { ...touchedFields, [fieldId]: true };

        setFormData(updated);
        setTouchedFields(newTouched);

        // Re-run client-side validation for touched fields
        revalidate(updated, newTouched);

        // Clear any server-side error for this field when the user edits it
        if (apiFieldErrors[fieldId]) {
          setApiFieldErrors((prev) => {
            const next = { ...prev };
            delete next[fieldId];
            return next;
          });
        }
      },
    }),
    [formData, touchedFields, apiFieldErrors, revalidate]
  );

  /**
   * Handles errors from the API and surfaces them as field-level or toast messages.
   */
  const handleApiError = useCallback((error: unknown) => {
    const { fieldErrors, generalError } = extractApiErrors(error);

    if (Object.keys(fieldErrors).length > 0) {
      setApiFieldErrors(fieldErrors);
      toast.error(Object.values(fieldErrors)[0]);
    } else if (generalError) {
      toast.error(generalError);
    } else {
      toast.error('An unexpected error occurred');
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields touched so every error becomes visible on submit
      const allTouched = fields.reduce(
        (acc, f) => ({ ...acc, [f.id]: true }),
        {} as Record<string, boolean>
      );
      setTouchedFields(allTouched);

      // Run full synchronous validation — short-circuit before any API call
      const parseResult = schema.safeParse(formData);
      if (!parseResult.success) {
        const { fieldErrors } = extractZodErrors(parseResult.error);
        setInlineErrors(fieldErrors);
        toast.error(parseResult.error.errors[0].message);
        return;
      }

      try {
        setIsLoading(true);
        setFieldErrors({});
        
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        // Validate form data
        let validatedData: any;
        try {
          validatedData = await schema.parseAsync(formData);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const errors = extractZodErrors(validationError);
            setFieldErrors(errors.fieldErrors);
            
            // Show first error as toast
            const firstError = Object.values(errors.fieldErrors)[0];
            if (firstError) {
              toast.error(firstError);
            }
          }
          return;
        }
        
        // Use custom submit handler if provided
        if (customSubmitHandler) {
          try {
            await customSubmitHandler(validatedData, !!initialData?.id);
          } catch (error) {
            handleSubmitError(error);
          }
        } else {
          // Default CRUD logic
          try {
            if (initialData?.id) {
              await service.update(initialData.id, validatedData);
              toast.success('Updated successfully!');
            } else {
              await service.create(validatedData);
              toast.success('Created successfully!');
            }
            onSuccess?.();
          } catch (error) {
            handleSubmitError(error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fields, formData, schema, service, initialData, onSuccess, customSubmitHandler, handleApiError]
  );

  const handleSubmitError = (error: unknown) => {
    const apiErrors = extractApiErrors(error);
    // Set field-specific errors
    if (Object.keys(apiErrors.fieldErrors).length > 0) {
      setFieldErrors(apiErrors.fieldErrors);
      // Show first field error as toast
      const firstError = Object.values(apiErrors.fieldErrors)[0];
      toast.error(firstError);
    } else if (apiErrors.generalError) {
      // Show general error
      toast.error(apiErrors.generalError);
    } else {
      toast.error('An unexpected error occurred');
    }
  };

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  const mergedErrors = mergeErrors(inlineErrors, fieldErrors);

  return {
    formData,
    errors: mergedErrors,
    isLoading,
    register,
    handleSubmit,
    setFormData,
    cancelRequest,
  };
};

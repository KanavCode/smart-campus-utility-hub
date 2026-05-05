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
  const [formData, setFormData] = useState(
    initialData 
      ? { ...initialData }
      : fields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        schema = schema.refine(val => {
          if (field.type === 'checkbox') return true;
          if (typeof val === 'number') return true;
          return val && String(val).trim().length > 0;
        }, `${field.label} is required`);
      }
      
      schemaShape[field.id] = schema;
    });
    
    return z.object(schemaShape);
  };

  const schema = validationSchema || buildDefaultSchema();
  
  const {
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: formData,
    mode: 'onChange',
  });

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
        setFormData((prev) => ({
          ...prev,
          [fieldId]: value,
        }));
        // Clear error for this field when user starts typing
        if (fieldErrors[fieldId]) {
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
          });
        }
      },
    }),
    [formData, fieldErrors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
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
    [formData, schema, service, initialData, onSuccess, customSubmitHandler]
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

  const mergedErrors = mergeErrors(
    Object.keys(errors).reduce((acc, key) => {
      acc[key] = errors[key as keyof typeof errors]?.message || '';
      return acc;
    }, {} as Record<string, string>),
    fieldErrors
  );

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

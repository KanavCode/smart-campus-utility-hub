import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ApiError } from '@/types';
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

  const register = useCallback(
    (fieldId: string) => ({
      value: formData[fieldId] ?? '',
      onChange: (value: any) => {
        setFormData((prev) => ({
          ...prev,
          [fieldId]: value,
        }));
      },
    }),
    [formData]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        setIsLoading(true);
        
        // Validate form data
        const validatedData = await schema.parseAsync(formData);
        
        // Use custom submit handler if provided
        if (customSubmitHandler) {
          await customSubmitHandler(validatedData, !!initialData?.id);
        } else {
          // Default CRUD logic
          if (initialData?.id) {
            await service.update(initialData.id, validatedData);
            toast.success('Updated successfully!');
          } else {
            await service.create(validatedData);
            toast.success('Created successfully!');
          }
        }
        
        onSuccess?.();
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          const firstError = error.errors[0];
          toast.error(firstError.message);
        } else {
          const err = error as ApiError;
          toast.error(err?.message || 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, schema, service, initialData, onSuccess, customSubmitHandler]
  );

  const formErrors = Object.keys(errors).reduce((acc, key) => {
    acc[key] = errors[key as keyof typeof errors]?.message || '';
    return acc;
  }, {} as Record<string, string>);

  return {
    formData,
    errors: formErrors,
    isLoading,
    register,
    handleSubmit,
    setFormData,
  };
};

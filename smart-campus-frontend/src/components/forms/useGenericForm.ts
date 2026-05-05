import { useState, useCallback } from 'react';
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
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData
      ? { ...initialData }
      : fields.reduce((acc, field) => ({ ...acc, [field.id]: field.type === 'checkbox' ? false : '' }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  // Tracks which fields the user has interacted with so we only show
  // inline errors after the field has been touched.
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});

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
   * Re-validate the entire form and update inlineErrors.
   * Only shows errors for fields that have been touched.
   */
  const revalidate = useCallback(
    (data: Record<string, any>, touched: Record<string, boolean>) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as string;
          // Only surface errors for fields the user has interacted with
          if (touched[key] && !fieldErrors[key]) {
            fieldErrors[key] = issue.message;
          }
        }
        setInlineErrors(fieldErrors);
      } else {
        setInlineErrors({});
      }
    },
    [schema]
  );

  const register = useCallback(
    (fieldId: string) => ({
      value: formData[fieldId] ?? '',
      onChange: (value: any) => {
        const updated = { ...formData, [fieldId]: value };
        const newTouched = { ...touchedFields, [fieldId]: true };
        setFormData(updated);
        setTouchedFields(newTouched);
        revalidate(updated, newTouched);
      },
    }),
    [formData, touchedFields, revalidate]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched so every error becomes visible on submit
      const allTouched = fields.reduce(
        (acc, f) => ({ ...acc, [f.id]: true }),
        {} as Record<string, boolean>
      );
      setTouchedFields(allTouched);

      // Run full synchronous validation first so errors appear before any API call
      const parseResult = schema.safeParse(formData);
      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parseResult.error.issues) {
          const key = issue.path[0] as string;
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setInlineErrors(fieldErrors);
        // Surface the first error in a toast so the user knows what to fix
        toast.error(parseResult.error.errors[0].message);
        return;
      }

      try {
        setIsLoading(true);
        setInlineErrors({});

        const validatedData = parseResult.data;

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
          toast.error(error.errors[0].message);
        } else {
          const err = error as ApiError;
          toast.error(err?.message || 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fields, formData, schema, service, initialData, onSuccess, customSubmitHandler]
  );

  return {
    formData,
    errors: inlineErrors,
    isLoading,
    register,
    handleSubmit,
    setFormData,
  };
};

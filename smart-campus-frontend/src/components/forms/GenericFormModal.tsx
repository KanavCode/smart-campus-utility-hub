import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGenericForm } from './useGenericForm';
import { FormField } from './FormField';
import { GenericFormProps } from './types';

export const GenericFormModal = ({
  fields,
  service,
  initialData,
  onSuccess,
  onCancel,
  validationSchema,
  submitButtonLabel,
  title,
  mode = initialData?.id ? 'edit' : 'create',
  customSubmitHandler,
  disableSubmit,
}: GenericFormProps) => {
  const { formData, errors, isLoading, register, handleSubmit } = useGenericForm(
    fields,
    service,
    initialData,
    onSuccess,
    validationSchema,
    customSubmitHandler
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {fields.map((field) => (
        <FormField
          key={field.id}
          field={field}
          value={register(field.id).value}
          onChange={register(field.id).onChange}
          error={errors[field.id]}
          isLoading={isLoading}
        />
      ))}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading || disableSubmit} className="flex-1">
          {isLoading ? 'Saving...' : (submitButtonLabel || (mode === 'edit' ? 'Update' : 'Create'))}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
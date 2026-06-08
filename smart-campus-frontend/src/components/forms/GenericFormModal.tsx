import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGenericForm } from './useGenericForm';
import { FormField } from './FormField';
import { GenericFormProps } from './types';

export const GenericFormModal = ({ fields, service, initialData, onSuccess, onCancel, validationSchema, submitButtonLabel, title, mode = initialData?.id ? 'edit' : 'create', customSubmitHandler, disableSubmit }: GenericFormProps) => {
  const { formData, errors, isLoading, register, handleSubmit } = useGenericForm(fields, service, initialData, onSuccess, validationSchema, customSubmitHandler);

  const groupedFields: GenericFormProps['fields'][][] = [];
  let currentRow: GenericFormProps['fields'][] = [];
  let currentRowCols = 0;

  fields.forEach((field) => {
    const shouldShow = field.condition ? field.condition(formData) : true;
    if (!shouldShow) return;
    const fieldCols = field.gridCol || 1;
    if (currentRowCols + fieldCols > 3) {
      if (currentRow.length > 0) groupedFields.push(currentRow);
      currentRow = [field];
      currentRowCols = fieldCols;
    } else {
      currentRow.push(field);
      currentRowCols += fieldCols;
    }
  });
  if (currentRow.length > 0) groupedFields.push(currentRow);

  return (
    <form onSubmit={handleSubmit} className=\"space-y-4\">
      {title && <h2 className=\"text-lg font-semibold\">{title}</h2>}
      {groupedFields.map((row, i) => (
        <div key={i} className={\grid md:grid-cols-\ gap-4\}>
          {row.map((field) => <FormField key={field.id} field={field} value={register(field.id).value} onChange={register(field.id).onChange} error={errors[field.id]} isLoading={isLoading} />)}
        </div>
      ))}
      <div className=\"flex gap-3 pt-4\">
        <Button type=\"submit\" disabled={isLoading || disableSubmit} className=\"flex-1\">{isLoading ? 'Saving...' : 'Submit'}</Button>
        <Button type=\"button\" onClick={onCancel} variant=\"outline\" className=\"flex-1\">Cancel</Button>
      </div>
    </form>
  );
};

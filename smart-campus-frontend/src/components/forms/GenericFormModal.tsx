import { useGenericForm } from './useGenericForm';
import { FormField } from './FormField';
import { GenericFormProps } from './types';

interface ExtendedFormProps extends GenericFormProps {
  disableSubmit?: boolean;
  submitButtonLabel?: string;
  onFieldChange?: (id: string, value: string) => void;
}

export const GenericFormModal = ({
  fields,
  service,
  initialData,
  onSuccess,
  onCancel,
  validationSchema,
  customSubmitHandler,
  title,
  disableSubmit,
  submitButtonLabel,
  onFieldChange,
}: ExtendedFormProps) => {
  const { errors, isLoading, register, handleSubmit } = useGenericForm(
    fields,
    service,
    initialData,
    onSuccess,
    validationSchema,
    customSubmitHandler
  );

  const groupedFields: any[][] = [];
  let currentRow: any[] = [];
  let currentRowCols = 0;

  fields.forEach((field) => {
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

  const mode = initialData?.id ? 'edit' : 'create';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {groupedFields.map((row, i) => (
        <div key={i} className={`grid gap-4 ${row.length === 3 ? 'md:grid-cols-3' : row.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {row.map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={register(field.id)?.value}
              onChange={(val: string) => {
                register(field.id)?.onChange(val);
                onFieldChange?.(field.id, val);
              }}
              error={errors?.[field.id]}
              isLoading={isLoading}
            />
          ))}
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isLoading || disableSubmit} className="bg-primary px-4 py-2 text-white rounded flex-1">
          {isLoading ? 'Saving...' : (submitButtonLabel || (mode === 'edit' ? 'Update' : 'Create'))}
        </button>
        <button type="button" onClick={onCancel} className="border px-4 py-2 rounded flex-1">Cancel</button>
      </div>
    </form>
  );
};

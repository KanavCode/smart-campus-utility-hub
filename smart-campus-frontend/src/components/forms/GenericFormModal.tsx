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
}: GenericFormProps) => {
  const { formData, errors, isLoading, register, handleSubmit, setFormData } =
    useGenericForm(
      fields,
      service,
      initialData,
      onSuccess,
      validationSchema,
      customSubmitHandler
    );

  const gridCols = fields.reduce((max, field) => {
    return Math.max(max, field.gridCol || 1);
  }, 1);

  // Group fields by row based on gridCol
  const groupedFields: GenericFormProps['fields'][][] = [];
  let currentRow: GenericFormProps['fields'][] = [];
  let currentRowCols = 0;

  fields.forEach((field) => {
    const shouldShow = field.condition ? field.condition(formData) : true;
    if (!shouldShow) return;

    const fieldCols = field.gridCol || 1;
    
    if (currentRowCols + fieldCols > 3) {
      if (currentRow.length > 0) {
        groupedFields.push(currentRow);
      }
      currentRow = [field];
      currentRowCols = fieldCols;
    } else {
      currentRow.push(field);
      currentRowCols += fieldCols;
    }
  });

  if (currentRow.length > 0) {
    groupedFields.push(currentRow);
  }

  const defaultSubmitLabel =
    mode === 'edit'
      ? submitButtonLabel || `Update ${title || 'Item'}`
      : submitButtonLabel || `Create ${title || 'Item'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}

      {groupedFields.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid md:grid-cols-${row.length === 1 ? 1 : row.length === 2 ? 2 : 3} gap-4`}
        >
          {row.map((field) => {
            const fieldReg = register(field.id);
            return (
              <FormField
                key={field.id}
                field={field}
                value={fieldReg.value}
                onChange={fieldReg.onChange}
                error={errors[field.id]}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground font-semibold glow-primary-hover"
          asChild
        >
          <motion.button
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? 'Saving...' : defaultSubmitLabel}
          </motion.button>
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
          asChild
        >
          <motion.button
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            Cancel
          </motion.button>
        </Button>
      </div>
    </form>
  );
};

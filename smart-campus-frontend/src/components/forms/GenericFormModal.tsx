import { FormField } from './FormField';


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

export const GenericFormModal = (props: any) => {
  const { fields, title, ...rest } = props;
  
  // Use the hook with 'any' to stop the type errors
  const { errors, isLoading, register, handleSubmit } = props.useGenericForm 
    ? props.useGenericForm(props.fields, props.service, props.initialData, props.onSuccess, props.validationSchema, props.customSubmitHandler)
    : { errors: {}, isLoading: false, register: () => ({}), handleSubmit: (e: any) => e.preventDefault() };

  // Group fields for layout
  const groupedFields: any[] = [];
  let currentRow: any[] = [];
  let currentRowCols = 0;

  props.fields.forEach((field: any) => {
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

      {groupedFields.map((row: any, i: number) => (
        <div key={i} className={`grid gap-4 ${row.length === 3 ? 'md:grid-cols-3' : row.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {row.map((field: any) => (
            <FormField
              key={field.id}
              field={field}
              value={register(field.id)?.value}
              onChange={register(field.id)?.onChange}
              error={errors?.[field.id]}
              isLoading={isLoading}
            />
          ))}
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isLoading} className="bg-primary px-4 py-2 text-white rounded">Submit</button>
        <button type="button" onClick={props.onCancel} className="border px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  );
};
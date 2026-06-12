import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldConfig } from './types';
import { useCallback } from 'react';

interface FormFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isLoading?: boolean;
}

export const FormField = ({
  field,
  value,
  onChange,
  error,
  isLoading,
}: FormFieldProps) => {
  const errorId = `${field.id}-error`;
  const hintId = field.hint ? `${field.id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = e.target;
      
      if ('type' in target && target.type === 'checkbox') {
        onChange((target as HTMLInputElement).checked);
      } else if (field.type === 'number') {
        onChange(target.value === '' ? '' : Number(target.value));
      } else {
        onChange(target.value);
      }
    },
    [field.type, onChange]
  );

  const baseInputClasses = `glass border-border ${
    error ? 'border-red-500' : ''
  }`;

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value ?? ''}
            onChange={handleChange}
            required={field.required}
            disabled={isLoading || field.disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`${baseInputClasses} min-h-[100px]`}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value ?? ''}
            onChange={handleChange}
            required={field.required}
            disabled={isLoading || field.disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`w-full px-3 py-2 rounded-lg ${baseInputClasses} focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="">-- Select {field.label.toLowerCase()} --</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            id={field.id}
            type="checkbox"
            checked={value ?? false}
            onChange={handleChange}
            disabled={isLoading || field.disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="h-4 w-4"
          />
        );

      // Native input for datetime-local — the shadcn Input wrapper can block
      // the browser's native date/time picker popup from opening.
      case 'datetime-local':
        return (
          <input
            id={field.id}
            type="datetime-local"
            value={value ?? ''}
            onChange={handleChange}
            required={field.required}
            disabled={isLoading || field.disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`w-full px-3 py-2 rounded-lg text-sm bg-transparent ${baseInputClasses} focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );

      default:
        return (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={value ?? ''}
            onChange={handleChange}
            required={field.required}
            disabled={isLoading || field.disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${field.className || ''}`}>
      {field.type !== 'checkbox' && (
        <Label htmlFor={field.id}>
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      
      {renderField()}
      
      {field.type === 'checkbox' && (
        <Label htmlFor={field.id} className="cursor-pointer ml-2">
          {field.label}
        </Label>
      )}
      
      {field.hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {field.hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs text-red-500 flex items-center gap-1" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      ) : null}
    </div>
  );
};

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
            className="h-4 w-4"
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
      
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

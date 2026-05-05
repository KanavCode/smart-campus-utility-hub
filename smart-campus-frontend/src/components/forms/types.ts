import { ZodSchema } from 'zod';

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'select' 
  | 'textarea' 
  | 'checkbox' 
  | 'datetime-local' 
  | 'tel';

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  options?: Array<{ value: string | number; label: string }>;
  condition?: (formData: any) => boolean; // Show field conditionally
  gridCol?: 1 | 2 | 3; // For layout (default 1)
  className?: string;
  disabled?: boolean;
}

export interface CrudService {
  create: (data: any) => Promise<any>;
  update: (id: string | number, data: any) => Promise<any>;
}

export interface GenericFormProps {
  fields: FieldConfig[];
  service: CrudService;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
  validationSchema?: ZodSchema;
  submitButtonLabel?: string;
  title?: string;
  mode?: 'create' | 'edit';
  customSubmitHandler?: (data: any, isUpdate: boolean) => Promise<void>;
}

export interface UseGenericFormReturn {
  formData: Record<string, any>;
  errors: Record<string, string>;
  isLoading: boolean;
  register: (fieldId: string) => {
    value: any;
    onChange: (value: any) => void;
  };
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFormData: (data: Record<string, any>) => void;
  cancelRequest?: () => void;
}

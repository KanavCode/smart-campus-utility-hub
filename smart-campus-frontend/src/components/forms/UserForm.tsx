import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { UserFormData, ApiError } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: UserFormData;
}

export const UserForm = ({ onSuccess, onCancel, initialData }: UserFormProps) => {
  const fields: FieldConfig[] = [
    {
      id: 'full_name',
      label: 'Full Name',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      gridCol: 1,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      placeholder: initialData?.id ? 'Leave blank to keep current' : '',
      required: !initialData?.id,
      gridCol: 1,
    },
    {
      id: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'student', label: 'Student' },
        { value: 'admin', label: 'Admin' },
      ],
      gridCol: 1,
    },
    {
      id: 'department',
      label: 'Department',
      type: 'text',
      required: false,
      gridCol: 1,
    },
    {
      id: 'cgpa',
      label: 'CGPA',
      type: 'number',
      required: true,
      min: 0,
      max: 10,
      step: 0.01,
      condition: (formData) => formData.role === 'student',
      gridCol: 1,
    },
    {
      id: 'semester',
      label: 'Semester',
      type: 'number',
      required: true,
      min: 1,
      max: 8,
      condition: (formData) => formData.role === 'student',
      gridCol: 1,
    },
  ];

  const validationSchema = z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: initialData?.id
      ? z.string().optional()
      : z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'admin']),
    department: z.string().optional(),
    cgpa: z.coerce.number().min(0).max(10).or(z.string().optional()),
    semester: z.coerce.number().min(1).max(8).or(z.string().optional()),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    if (data.role === 'student' && (!data.cgpa || !data.semester)) {
      toast.error('CGPA and Semester are required for student accounts.');
      throw new Error('Validation error');
    }

    const payload = {
      ...data,
      cgpa: data.role === 'student' && data.cgpa ? parseFloat(data.cgpa) : null,
      semester: data.role === 'student' && data.semester ? parseInt(data.semester, 10) : null,
    };

    if (isUpdate) {
      await userService.update(initialData!.id, payload);
      toast.success('User updated successfully!');
    } else {
      await userService.create(payload);
      toast.success('User created successfully!');
    }
  };

  return (
    <GenericFormModal
      fields={fields}
      service={userService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="User"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

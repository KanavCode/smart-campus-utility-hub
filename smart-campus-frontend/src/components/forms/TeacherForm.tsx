import { toast } from 'sonner';
import { teacherService } from '@/services/teacherService';
import { TeacherFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface TeacherFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: TeacherFormData;
}

export const TeacherForm = ({ onSuccess, onCancel, initialData }: TeacherFormProps) => {
  const fields: FieldConfig[] = [
    {
      id: 'teacher_code',
      label: 'Teacher Code',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'full_name',
      label: 'Full Name',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'department',
      label: 'Department',
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
      id: 'phone',
      label: 'Phone',
      type: 'tel',
      required: true,
      gridCol: 1,
    },
  ];

  const validationSchema = z.object({
    teacher_code: z.string().min(1, 'Teacher code is required'),
    full_name: z.string().min(1, 'Full name is required'),
    department: z.string().min(1, 'Department is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const trimmedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
      return acc;
    }, {} as any);

    if (isUpdate) {
      await teacherService.update(initialData!.id, trimmedData);
      toast.success('Teacher updated successfully!');
    } else {
      await teacherService.create(trimmedData);
      toast.success('Teacher created successfully!');
    }
  };

  return (
    <GenericFormModal
      fields={fields}
      service={teacherService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="Teacher"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

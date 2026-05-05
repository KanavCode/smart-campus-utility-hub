import { toast } from 'sonner';
import { subjectService } from '@/services/subjectService';
import { SubjectFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface SubjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: SubjectFormData;
}

export const SubjectForm = ({ onSuccess, onCancel, initialData }: SubjectFormProps) => {
  const fields: FieldConfig[] = [
    {
      id: 'subject_code',
      label: 'Subject Code',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'subject_name',
      label: 'Subject Name',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'hours_per_week',
      label: 'Hours per Week',
      type: 'number',
      required: true,
      gridCol: 1,
    },
    {
      id: 'course_type',
      label: 'Course Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Theory', label: 'Theory' },
        { value: 'Practical', label: 'Practical' },
        { value: 'Lab', label: 'Lab' },
      ],
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
      id: 'semester',
      label: 'Semester',
      type: 'number',
      required: true,
      min: 1,
      max: 8,
      gridCol: 1,
    },
  ];

  const validationSchema = z.object({
    subject_code: z.string().min(1, 'Subject code is required'),
    subject_name: z.string().min(1, 'Subject name is required'),
    hours_per_week: z.coerce.number().min(1, 'Hours per week is required'),
    course_type: z.string().min(1, 'Course type is required'),
    department: z.string().min(1, 'Department is required'),
    semester: z.coerce.number().min(1).max(8, 'Semester must be between 1 and 8'),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const payload = {
      subject_code: data.subject_code.trim(),
      subject_name: data.subject_name.trim(),
      hours_per_week: Number(data.hours_per_week),
      course_type: String(data.course_type),
      department: data.department.trim(),
      semester: Number(data.semester),
    };

    if (isUpdate) {
      await subjectService.update(initialData!.id, payload);
      toast.success('Subject updated successfully!');
    } else {
      await subjectService.create(payload);
      toast.success('Subject created successfully!');
    }
  };

  return (
    <GenericFormModal
      fields={fields}
      service={subjectService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="Subject"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

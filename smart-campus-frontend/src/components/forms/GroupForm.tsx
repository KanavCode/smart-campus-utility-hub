import { toast } from 'sonner';
import { timetableService } from '@/services/timetableService';
import { GroupFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface GroupFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: GroupFormData;
}

export const GroupForm = ({ onSuccess, onCancel, initialData }: GroupFormProps) => {
  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;

  const fields: FieldConfig[] = [
    {
      id: 'group_code',
      label: 'Group Code',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'group_name',
      label: 'Group Name',
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
      id: 'semester',
      label: 'Semester',
      type: 'number',
      required: true,
      min: 1,
      max: 8,
      gridCol: 1,
    },
    {
      id: 'strength',
      label: 'Student Strength',
      type: 'number',
      required: true,
      min: 1,
      gridCol: 1,
    },
    {
      id: 'academic_year',
      label: 'Academic Year',
      type: 'text',
      placeholder: 'e.g., 2024-25',
      required: true,
      gridCol: 1,
    },
  ];

  const validationSchema = z.object({
    group_code: z.string().min(1, 'Group code is required'),
    group_name: z.string().min(1, 'Group name is required'),
    department: z.string().min(1, 'Department is required'),
    semester: z.coerce.number().min(1).max(8, 'Semester must be between 1 and 8'),
    strength: z.coerce.number().min(1, 'Student strength is required'),
    academic_year: z.string().min(1, 'Academic year is required'),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const payload = {
      group_code: data.group_code.trim(),
      group_name: data.group_name.trim(),
      strength: Number(data.strength),
      department: data.department.trim(),
      semester: Number(data.semester),
      academic_year: data.academic_year.trim(),
    };

    // Only create for now (GroupForm doesn't have update endpoint in timetableService)
    await timetableService.createGroup(payload);
    toast.success('Group created successfully!');
  };

  return (
    <GenericFormModal
      fields={fields}
      service={timetableService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="Group"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

import { toast } from 'sonner';
import { electiveService, Elective } from '@/services/electiveService';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface ElectiveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Elective | null;
}

export const ElectiveForm = ({ onSuccess, onCancel, initialData }: ElectiveFormProps) => {
  // List of 10 allowed subjects
  const allowedSubjects = [
    "Artificial Intelligence",
    "Statistics in Data Science",
    "Data Warehousing & Data Mining",
    "Distributed Systems",
    "Network Security",
    "Big Data Analytics",
    "Cloud Computing",
    "Machine Learning",
    "Mobile Computing",
    "Computer Vision & Applications",
  ];

  const fields: FieldConfig[] = [
    {
      id: 'subject_name',
      label: 'Subject Name',
      type: 'select',
      required: true,
      options: allowedSubjects.map(subject => ({ value: subject, label: subject })),
      gridCol: 1,
    },
    {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Brief description of the elective',
      gridCol: 1,
    },
    {
      id: 'max_students',
      label: 'Max Students',
      type: 'number',
      required: true,
      min: 1,
      max: 200,
      gridCol: 1,
    },
    {
      id: 'department',
      label: 'Department',
      type: 'text',
      required: true,
      placeholder: 'e.g., Computer Science',
      gridCol: 1,
    },
    {
      id: 'semester',
      label: 'Semester',
      type: 'select',
      required: true,
      options: [1, 2, 3, 4, 5, 6, 7, 8].map(sem => ({ value: sem.toString(), label: `Semester ${sem}` })),
      gridCol: 1,
    },
  ];

  const validationSchema = z.object({
    subject_name: z.string().refine(
      val => allowedSubjects.includes(val),
      'Please select a valid subject from the allowed list'
    ),
    description: z.string().min(1, 'Description is required'),
    max_students: z.coerce.number().min(1, 'Max students is required').max(200),
    department: z.string().min(1, 'Department is required'),
    semester: z.coerce.number().min(1).max(8, 'Semester must be between 1 and 8'),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const payload = {
      subject_name: data.subject_name,
      description: data.description,
      max_students: parseInt(data.max_students.toString()),
      department: data.department,
      semester: parseInt(data.semester.toString()),
    };

    if (isUpdate) {
      await electiveService.update(initialData!.id, payload);
      toast.success('Elective updated successfully!');
    } else {
      await electiveService.create(payload);
      toast.success('Elective created successfully!');
    }
  };

  return (
    <GenericFormModal
      fields={fields}
      service={electiveService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="Elective"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

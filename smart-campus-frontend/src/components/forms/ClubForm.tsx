import { toast } from 'sonner';
import { clubService } from '@/services/clubService';
import { ClubFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface ClubFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: ClubFormData;
}

export const ClubForm = ({ onSuccess, onCancel, initialData }: ClubFormProps) => {
  const fields: FieldConfig[] = [
    {
      id: 'name',
      label: 'Club Name',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      gridCol: 1,
    },
    {
      id: 'contact_email',
      label: 'Contact Email',
      type: 'email',
      required: true,
      gridCol: 1,
    },
    {
      id: 'category',
      label: 'Category',
      type: 'text',
      required: true,
      placeholder: 'e.g., Technical, Cultural, Sports',
      gridCol: 1,
    },
  ];

  const validationSchema = z.object({
    name: z.string().min(1, 'Club name is required'),
    description: z.string().min(1, 'Description is required'),
    contact_email: z.string().email('Invalid email address'),
    category: z.string().min(1, 'Category is required'),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    if (isUpdate) {
      await clubService.update(initialData!.id, data);
      toast.success('Club updated successfully!');
    } else {
      await clubService.create(data);
      toast.success('Club created successfully!');
    }
  };

  return (
    <GenericFormModal
      fields={fields}
      service={clubService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="Club"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

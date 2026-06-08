import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { eventsService } from '@/services/eventService';
import { clubService, Club } from '@/services/clubService';
import { EventFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { eventSchema } from '@/lib/validationSchemas';
import { ImageUploadField } from './ImageUploadField';
import api from '@/lib/axios';

const MAX_DESCRIPTION_LENGTH = 500;

interface EventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: EventFormData;
}

export const EventForm = ({ onSuccess, onCancel, initialData }: EventFormProps) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [descriptionLength, setDescriptionLength] = useState(initialData?.description?.length ?? 0);

  useEffect(() => { loadClubs(); }, []);

  const loadClubs = async () => {
    try {
      setIsLoadingClubs(true);
      const clubsList = await clubService.getAll();
      setClubs(clubsList);
    } catch (error) {
      toast.error('Failed to load clubs');
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const isAtLimit = descriptionLength >= MAX_DESCRIPTION_LENGTH;
  const getCounterColor = () => {
    const ratio = descriptionLength / MAX_DESCRIPTION_LENGTH;
    if (ratio >= 1) return 'text-red-500';
    if (ratio >= 0.9) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const fields: FieldConfig[] = [
    { id: 'title', label: 'Event Title', type: 'text', required: true, gridCol: 1 },
    { id: 'description', label: 'Description', type: 'textarea', required: true, gridCol: 1, onChange: (val: string) => setDescriptionLength(val.length) },
    { id: 'location', label: 'Location', type: 'text', required: true, gridCol: 1 },
    { id: 'club_id', label: 'Associated Club', type: 'select', required: true, options: clubs.map(c => ({ value: c.id.toString(), label: c.name })), disabled: isLoadingClubs, gridCol: 1 },
    { id: 'start_time', label: 'Start Time', type: 'datetime-local', required: true, gridCol: 1 },
    { id: 'end_time', label: 'End Time', type: 'datetime-local', required: true, gridCol: 1 },
    { id: 'target_department', label: 'Target Department', type: 'text', required: false, gridCol: 1 },
    { id: 'tags', label: 'Tags', type: 'text', required: false, gridCol: 1 },
    { id: 'is_featured', label: 'Featured Event', type: 'checkbox', required: false, gridCol: 1 },
    { id: 'image', label: 'Event Poster', type: 'image-upload', required: false, gridCol: 1 },
  ];

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const payload = { ...data, club_id: parseInt(data.club_id, 10) };
    if (image) {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => formData.append(k, String(v)));
      formData.append('image', image);
      isUpdate ? await api.put(\/events/\\, formData) : await api.post('/events', formData);
    } else {
      isUpdate ? await eventsService.update(initialData!.id, payload) : await eventsService.create(payload);
    }
    toast.success('Event saved successfully!');
  };

  if (clubs.length === 0 && !isLoadingClubs) return <div>No clubs found.</div>;

  return (
    <div className=\"space-y-4\">
      <ImageUploadField image={image} onImageSelect={setImage} onImageRemove={() => setImage(null)} />
      <GenericFormModal fields={fields} service={eventsService} initialData={initialData} onSuccess={onSuccess} onCancel={onCancel} validationSchema={eventSchema} title=\"Event\" customSubmitHandler={customSubmitHandler} disableSubmit={isAtLimit} />
      <p className={\	ext-sm text-right -mt-3 \\}>
        {descriptionLength} / {MAX_DESCRIPTION_LENGTH} characters {isAtLimit && '(Limit reached)'}
      </p>
    </div>
  );
};

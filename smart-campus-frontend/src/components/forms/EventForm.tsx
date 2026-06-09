import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { eventsService } from '@/services/eventService';
import { clubService, Club } from '@/services/clubService';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { ImageUploadField } from './ImageUploadField';
import api from '@/lib/axios';

const MAX_LIMIT = 500;

export const EventForm = ({ onSuccess, onCancel, initialData }: any) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [description, setDescription] = useState(initialData?.description || '');

  useEffect(() => {
    loadClubs();
  }, []);

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

  const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required').max(MAX_LIMIT, `Description must be ${MAX_LIMIT} characters or less`),
    location: z.string().min(1, 'Location is required'),
    club_id: z.string().min(1, 'Club is required'),
    start_time: z.string().min(1, 'Start time required'),
    end_time: z.string().min(1, 'End time required'),
  });

  const fields: FieldConfig[] = [
    { id: 'title', label: 'Event Title', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea', required: true },
    { id: 'location', label: 'Location', type: 'text', required: true },
    {
      id: 'club_id',
      label: 'Associated Club',
      type: 'select',
      options: clubs.map((c) => ({ value: c.id.toString(), label: c.name })),
    },
    { id: 'start_time', label: 'Start Time', type: 'datetime-local', required: true },
    { id: 'end_time', label: 'End Time', type: 'datetime-local', required: true },
  ];

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));
    if (image) formData.append('image', image);

    const method = isUpdate ? 'put' : 'post';
    const url = isUpdate ? `/events/${initialData?.id}` : '/events';

    await api({ method, url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } });
    toast.success('Event saved successfully!');
    onSuccess();
  };

  return (
    <div className="space-y-2">
      <ImageUploadField image={image} onImageSelect={setImage} onImageRemove={() => setImage(null)} />
      <GenericFormModal
        fields={fields}
        service={eventsService}
        initialData={initialData}
        onSuccess={onSuccess}
        onCancel={onCancel}
        validationSchema={eventSchema}
        customSubmitHandler={customSubmitHandler}
        title="Event"
        onFieldChange={(id: string, val: string) => { if (id === 'description') setDescription(val); }}
      />
      <p className={`text-sm text-right ${description.length > MAX_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
        {description.length} / {MAX_LIMIT}
      </p>
    </div>
  );
};

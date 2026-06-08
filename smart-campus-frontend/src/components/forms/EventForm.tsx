import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { eventsService } from '@/services/eventService';
import { clubService, Club } from '@/services/clubService';
import { EventFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { eventSchema } from '@/lib/validationSchemas';
import { useRef } from 'react';
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
  const [descriptionLength, setDescriptionLength] = useState(
    initialData?.description?.length ?? 0
  );

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setIsLoadingClubs(true);
      const clubsList = await clubService.getAll();
      setClubs(clubsList);
    } catch (error) {
      console.error('Failed to load clubs', error);
      toast.error('Failed to load clubs');
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const getCounterColor = () => {
    const ratio = descriptionLength / MAX_DESCRIPTION_LENGTH;
    if (ratio >= 1) return 'text-red-500';
    if (ratio >= 0.9) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const isAtLimit = descriptionLength >= MAX_DESCRIPTION_LENGTH;

  const fields: FieldConfig[] = [
    {
      id: 'title',
      label: 'Event Title',
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
      onChange: (val: string) => setDescriptionLength(val.length),
    },
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'club_id',
      label: 'Associated Club',
      type: 'select',
      required: true,
      options: clubs.map(club => ({ value: club.id.toString(), label: club.name })),
      disabled: isLoadingClubs,
      gridCol: 1,
    },
    {
      id: 'start_time',
      label: 'Start Time',
      type: 'datetime-local',
      required: true,
      gridCol: 1,
    },
    {
      id: 'end_time',
      label: 'End Time',
      type: 'datetime-local',
      required: true,
      gridCol: 1,
      hint: 'Must be after the start time',
    },
    {
      id: 'target_department',
      label: 'Target Department',
      type: 'text',
      required: false,
      placeholder: 'e.g. Computer Science (leave blank for all)',
      gridCol: 1,
    },
    {
      id: 'tags',
      label: 'Tags',
      type: 'text',
      required: false,
      placeholder: 'e.g. tech, workshop, open-to-all',
      hint: 'Comma-separated. Each tag will be trimmed automatically.',
      gridCol: 1,
    },
    {
      id: 'is_featured',
      label: 'Featured Event',
      type: 'checkbox',
      required: false,
      gridCol: 1,
    },
    {
      id: 'image',
      label: 'Event Poster',
      type: 'image-upload',
      required: false,
      gridCol: 1,
    },
  ];

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const normalizeTags = (raw: unknown): string[] => {
      if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
      if (typeof raw === 'string')
        return raw.split(',').map((t) => t.trim()).filter(Boolean);
      return [];
    };

    const payload = {
      ...data,
      title: typeof data.title === 'string' ? data.title.trim() : data.title,
      description: typeof data.description === 'string' ? data.description.trim() : data.description,
      location: typeof data.location === 'string' ? data.location.trim() : data.location,
      club_id: parseInt(data.club_id, 10),
      tags: normalizeTags(data.tags),
    };

    if (image) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      formData.append('image', image);

      if (isUpdate) {
        await api.put(/events/, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Event created successfully!');
      }
    } else {
      if (isUpdate) {
        await eventsService.update(initialData!.id, payload);
        toast.success('Event updated successfully!');
      } else {
        await eventsService.create(payload);
        toast.success('Event created successfully!');
      }
    }
  };

  if (clubs.length === 0 && !isLoadingClubs) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-600">
        No clubs available. Please create a club first before creating an event.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ImageUploadField
        image={image}
        onImageSelect={setImage}
        onImageRemove={() => setImage(null)}
      />
      <GenericFormModal
        fields={fields}
        service={eventsService}
        initialData={initialData}
        onSuccess={onSuccess}
        onCancel={onCancel}
        validationSchema={eventSchema}
        title="Event"
        customSubmitHandler={customSubmitHandler}
        disableSubmit={isAtLimit}
      />
      <p className={	ext-sm text-right -mt-3 }>
        {descriptionLength} / {MAX_DESCRIPTION_LENGTH} characters
        {isAtLimit && ' — limit reached'}
        {!isAtLimit && descriptionLength >= MAX_DESCRIPTION_LENGTH * 0.9 && ' — approaching limit'}
      </p>
    </div>
  );
};

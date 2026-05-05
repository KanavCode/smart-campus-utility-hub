import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { eventsService } from '@/services/eventService';
import { clubService, Club } from '@/services/clubService';
import { EventFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface EventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: EventFormData;
}

export const EventForm = ({ onSuccess, onCancel, initialData }: EventFormProps) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);

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
  ];

  const validationSchema = z
    .object({
      title: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(1, 'Event title is required')),
      description: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(1, 'Description is required')),
      location: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(1, 'Location is required')),
      club_id: z.string().min(1, 'Associated club is required'),
      start_time: z.string().min(1, 'Start time is required'),
      end_time: z.string().min(1, 'End time is required'),
      target_department: z
        .string()
        .transform((v) => v.trim())
        .optional(),
      // Accept either a raw comma-string (from the text input) or an already
      // normalised array so the form works correctly in both create and edit mode.
      tags: z
        .union([
          z.array(z.string()),
          z
            .string()
            .optional()
            .transform((v) =>
              v
                ? v
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                : []
            ),
        ])
        .optional(),
      is_featured: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.start_time && data.end_time) {
        const start = new Date(data.start_time);
        const end = new Date(data.end_time);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End time must be after the start time',
            path: ['end_time'],
          });
        }
      }
    });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const normalizeTags = (raw: unknown): string[] => {
      if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
      if (typeof raw === 'string')
        return raw
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      return [];
    };

    const payload = {
      ...data,
      title: typeof data.title === 'string' ? data.title.trim() : data.title,
      description:
        typeof data.description === 'string'
          ? data.description.trim()
          : data.description,
      location:
        typeof data.location === 'string' ? data.location.trim() : data.location,
      club_id: parseInt(data.club_id, 10),
      tags: normalizeTags(data.tags),
    };

    if (isUpdate) {
      await eventsService.update(initialData!.id, payload);
      toast.success('Event updated successfully!');
    } else {
      await eventsService.create(payload);
      toast.success('Event created successfully!');
    }
  };

  if (clubs.length === 0 && !isLoadingClubs) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-600">
        ⚠️ No clubs available. Please create a club first before creating an event.
      </div>
    );
  }

  return (
    <GenericFormModal
      fields={fields}
      service={eventsService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="Event"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

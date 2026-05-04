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
    },
    {
      id: 'target_department',
      label: 'Target Department',
      type: 'text',
      required: false,
      gridCol: 1,
    },
    {
      id: 'tags',
      label: 'Tags (comma-separated)',
      type: 'text',
      required: false,
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

  const validationSchema = z.object({
    title: z.string().min(1, 'Event title is required'),
    description: z.string().min(1, 'Description is required'),
    location: z.string().min(1, 'Location is required'),
    club_id: z.string().min(1, 'Associated club is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    target_department: z.string().optional(),
    tags: z.string().optional(),
    is_featured: z.boolean().optional(),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const payload = {
      ...data,
      club_id: parseInt(data.club_id),
      tags: data.tags
        ? data.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t)
        : [],
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
          className="flex-1"
          asChild
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Cancel
          </motion.button>
        </Button>
      </div>
    </form>
  );
};

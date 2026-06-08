import { useState } from 'react';
import { GenericFormModal } from './GenericFormModal';
import { eventsService } from '@/services/eventService';
import { eventSchema } from '@/lib/validationSchemas';
import { FieldConfig } from './types'; // Ensure you import your type

export const EventForm = ({ onSuccess, onCancel, initialData }: any) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const MAX_LIMIT = 500;
  
  // Explicitly type the array as FieldConfig[]
  const fields: FieldConfig[] = [
    { 
      id: 'title', 
      label: 'Event Title', 
      type: 'text', 
      required: true 
    },
    { 
      id: 'description', 
      label: 'Description', 
      type: 'textarea', 
      required: true,
      onChange: (val: string) => setDescription(val) 
    }
  ];

  return (
    <div className="space-y-2">
      <GenericFormModal
        fields={fields}
        service={eventsService}
        initialData={initialData}
        onSuccess={onSuccess}
        onCancel={onCancel}
        validationSchema={eventSchema}
        title="Event"
        disableSubmit={description.length > MAX_LIMIT}
      />
      <p className={`text-sm text-right ${description.length > MAX_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
        {description.length} / {MAX_LIMIT}
      </p>
    </div>
  );
};
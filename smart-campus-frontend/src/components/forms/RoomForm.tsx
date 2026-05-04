import { toast } from 'sonner';
import { roomService } from '@/services/roomService';
import { RoomFormData } from '@/types';
import { GenericFormModal } from './GenericFormModal';
import { FieldConfig } from './types';
import { z } from 'zod';

interface RoomFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: RoomFormData;
}

export const RoomForm = ({ onSuccess, onCancel, initialData }: RoomFormProps) => {
  const fields: FieldConfig[] = [
    {
      id: 'room_code',
      label: 'Room Code',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'room_name',
      label: 'Room Name',
      type: 'text',
      required: true,
      gridCol: 1,
    },
    {
      id: 'capacity',
      label: 'Capacity',
      type: 'number',
      required: true,
      gridCol: 1,
    },
    {
      id: 'room_type',
      label: 'Room Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Classroom', label: 'Classroom' },
        { value: 'Lab', label: 'Lab' },
        { value: 'Auditorium', label: 'Auditorium' },
        { value: 'Seminar_Hall', label: 'Seminar Hall' },
      ],
      gridCol: 1,
    },
    {
      id: 'floor_number',
      label: 'Floor Number',
      type: 'number',
      required: true,
      gridCol: 1,
    },
    {
      id: 'building',
      label: 'Building',
      type: 'text',
      required: true,
      gridCol: 1,
    },
  ];

  const validationSchema = z.object({
    room_code: z.string().min(1, 'Room code is required'),
    room_name: z.string().min(1, 'Room name is required'),
    capacity: z.coerce.number().min(1, 'Capacity is required'),
    room_type: z.string().min(1, 'Room type is required'),
    floor_number: z.coerce.number().min(0, 'Floor number is required'),
    building: z.string().min(1, 'Building is required'),
  });

  const customSubmitHandler = async (data: any, isUpdate: boolean) => {
    const payload = {
      room_code: data.room_code.trim(),
      room_name: data.room_name.trim(),
      capacity: Number(data.capacity),
      room_type: String(data.room_type),
      floor_number: data.floor_number ? Number(data.floor_number) : undefined,
      building: data.building.trim(),
    };

    if (isUpdate) {
      await roomService.update(initialData!.id, payload);
      toast.success('Room updated successfully!');
    } else {
      await roomService.create(payload);
      toast.success('Room created successfully!');
    }
  };

  return (
    <GenericFormModal
      fields={fields}
      service={roomService}
      initialData={initialData}
      onSuccess={onSuccess}
      onCancel={onCancel}
      validationSchema={validationSchema}
      title="Room"
      customSubmitHandler={customSubmitHandler}
    />
  );
};

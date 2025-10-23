import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { roomService } from '@/services/roomService';

interface RoomFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const RoomForm = ({ onSuccess, onCancel, initialData }: RoomFormProps) => {
  const [formData, setFormData] = useState({
    room_code: initialData?.room_code || '',
    room_name: initialData?.room_name || '',
    capacity: initialData?.capacity || '',
    room_type: initialData?.room_type || 'classroom',
    floor_number: initialData?.floor_number || '',
    building: initialData?.building || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await roomService.update(initialData.id, formData);
        toast.success('Room updated successfully!');
      } else {
        await roomService.create(formData);
        toast.success('Room created successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save room');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="room_code">Room Code *</Label>
          <Input
            id="room_code"
            name="room_code"
            value={formData.room_code}
            onChange={(e) => setFormData({ ...formData, room_code: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="room_name">Room Name *</Label>
          <Input
            id="room_name"
            name="room_name"
            value={formData.room_name}
            onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="room_type">Room Type *</Label>
          <select
            id="room_type"
            name="room_type"
            value={formData.room_type}
            onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
            required
            className="w-full p-2 rounded-lg glass border border-border"
          >
            <option value="classroom">Classroom</option>
            <option value="lab">Lab</option>
            <option value="auditorium">Auditorium</option>
            <option value="seminar_hall">Seminar Hall</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor_number">Floor Number *</Label>
          <Input
            id="floor_number"
            name="floor_number"
            type="number"
            value={formData.floor_number}
            onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="building">Building *</Label>
        <Input
          id="building"
          name="building"
          value={formData.building}
          onChange={(e) => setFormData({ ...formData, building: e.target.value })}
          required
          className="glass"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground font-semibold glow-primary-hover"
          asChild
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {initialData?.id ? 'Update Room' : 'Create Room'}
          </motion.button>
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
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

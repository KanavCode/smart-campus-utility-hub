import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { eventsService } from '@/services/eventService';
import { clubService, Club } from '@/services/clubService';

interface EventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const EventForm = ({ onSuccess, onCancel, initialData }: EventFormProps) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    club_id: initialData?.club_id || '',
    target_department: initialData?.target_department || '',
    is_featured: initialData?.is_featured || false,
    tags: initialData?.tags || [],
  });

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
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert tags string to array if needed
      const payload = {
        ...formData,
        tags: Array.isArray(formData.tags) 
          ? formData.tags 
          : (typeof formData.tags === 'string' 
              ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
              : [])
      };

      if (initialData?.id) {
        await eventsService.update(initialData.id, payload);
        toast.success('Event updated successfully!');
      } else {
        await eventsService.create(payload);
        toast.success('Event created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save event');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="glass"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="glass min-h-[100px]"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club_id">Associated Club *</Label>
          <select
            id="club_id"
            name="club_id"
            value={formData.club_id || ''}
            onChange={(e) => setFormData({ ...formData, club_id: e.target.value ? parseInt(e.target.value) : '' })}
            required
            disabled={isLoadingClubs}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">
              {isLoadingClubs ? 'Loading clubs...' : 'Select a club...'}
            </option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
          {clubs.length === 0 && !isLoadingClubs && (
            <p className="text-xs text-red-600">No clubs available. Create a club first.</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time *</Label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time *</Label>
          <Input
            id="end_time"
            name="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_department">Target Department</Label>
          <Input
            id="target_department"
            name="target_department"
            value={formData.target_department}
            onChange={(e) => setFormData({ ...formData, target_department: e.target.value })}
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            name="tags"
            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="glass"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_featured"
          name="is_featured"
          checked={formData.is_featured}
          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
          className="h-4 w-4"
        />
        <Label htmlFor="is_featured" className="cursor-pointer">
          Featured Event
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground font-semibold glow-primary-hover"
          asChild
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {initialData?.id ? 'Update Event' : 'Create Event'}
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { timetableService } from '@/services/timetableService';

interface GroupFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const GroupForm = ({ onSuccess, onCancel, initialData }: GroupFormProps) => {
  const [formData, setFormData] = useState({
    group_code: initialData?.group_code || '',
    group_name: initialData?.group_name || '',
    strength: initialData?.strength || '',
    department: initialData?.department || '',
    semester: initialData?.semester || '',
    academic_year: initialData?.academic_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.group_code.trim()) {
        toast.error('Group code is required');
        return;
      }
      if (!formData.group_name.trim()) {
        toast.error('Group name is required');
        return;
      }
      if (!formData.strength) {
        toast.error('Strength is required');
        return;
      }
      if (!formData.department.trim()) {
        toast.error('Department is required');
        return;
      }
      if (!formData.semester) {
        toast.error('Semester is required');
        return;
      }
      if (!formData.academic_year.trim()) {
        toast.error('Academic year is required');
        return;
      }

      await timetableService.createGroup({
        group_code: formData.group_code.trim(),
        group_name: formData.group_name.trim(),
        strength: parseInt(formData.strength as any),
        department: formData.department.trim(),
        semester: parseInt(formData.semester as any),
        academic_year: formData.academic_year.trim(),
      });
      toast.success('Group created successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="group_code">Group Code *</Label>
        <Input
          id="group_code"
          name="group_code"
          value={formData.group_code}
          onChange={(e) => setFormData({ ...formData, group_code: e.target.value })}
          required
          className="glass"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="group_name">Group Name *</Label>
        <Input
          id="group_name"
          name="group_name"
          value={formData.group_name}
          onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
          required
          className="glass"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">Semester *</Label>
          <Input
            id="semester"
            name="semester"
            type="number"
            min="1"
            max="8"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="strength">Student Strength *</Label>
          <Input
            id="strength"
            name="strength"
            type="number"
            min="1"
            value={formData.strength}
            onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="academic_year">Academic Year *</Label>
          <Input
            id="academic_year"
            name="academic_year"
            placeholder="e.g., 2024-25"
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground font-semibold glow-primary-hover"
          asChild
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {isLoading ? 'Creating...' : 'Create Group'}
          </motion.button>
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
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

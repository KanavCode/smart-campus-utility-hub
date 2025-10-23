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
    department: initialData?.department || '',
    semester: initialData?.semester || '',
    student_count: initialData?.student_count || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await timetableService.createGroup(formData);
      toast.success('Group created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to save group');
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
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="student_count">Student Count *</Label>
        <Input
          id="student_count"
          name="student_count"
          type="number"
          value={formData.student_count}
          onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
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
            Create Group
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

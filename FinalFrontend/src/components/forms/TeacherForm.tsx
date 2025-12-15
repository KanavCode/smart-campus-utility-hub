import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { timetableService } from '@/services/timetableService';

interface TeacherFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const TeacherForm = ({ onSuccess, onCancel, initialData }: TeacherFormProps) => {
  const [formData, setFormData] = useState({
    teacher_code: initialData?.teacher_code || '',
    full_name: initialData?.full_name || '',
    department: initialData?.department || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.teacher_code.trim()) {
        toast.error('Teacher code is required');
        return;
      }
      if (!formData.full_name.trim()) {
        toast.error('Full name is required');
        return;
      }
      if (!formData.department.trim()) {
        toast.error('Department is required');
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Email is required');
        return;
      }
      if (!formData.phone.trim()) {
        toast.error('Phone is required');
        return;
      }

      await timetableService.createTeacher({
        teacher_code: formData.teacher_code.trim(),
        full_name: formData.full_name.trim(),
        department: formData.department.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      toast.success('Teacher created successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create teacher');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teacher_code">Teacher Code *</Label>
          <Input
            id="teacher_code"
            name="teacher_code"
            value={formData.teacher_code}
            onChange={(e) => setFormData({ ...formData, teacher_code: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            {isLoading ? 'Creating...' : 'Create Teacher'}
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

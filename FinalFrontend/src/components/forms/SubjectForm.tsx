import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { subjectService } from '@/services/subjectService';

interface SubjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const SubjectForm = ({ onSuccess, onCancel, initialData }: SubjectFormProps) => {
  const [formData, setFormData] = useState({
    subject_code: initialData?.code || '',
    subject_name: initialData?.name || '',
    hours_per_week: initialData?.hours_per_week || '',
    course_type: initialData?.course_type || 'theory',
    department: initialData?.department || '',
    semester: initialData?.semester || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await subjectService.update(initialData.id, formData);
        toast.success('Subject updated successfully!');
      } else {
        await subjectService.create(formData);
        toast.success('Subject created successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save subject');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject_code">Subject Code *</Label>
          <Input
            id="subject_code"
            name="subject_code"
            value={formData.subject_code}
            onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject_name">Subject Name *</Label>
          <Input
            id="subject_name"
            name="subject_name"
            value={formData.subject_name}
            onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
            required
            className="glass"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours_per_week">Hours per Week *</Label>
          <Input
            id="hours_per_week"
            name="hours_per_week"
            type="number"
            value={formData.hours_per_week}
            onChange={(e) => setFormData({ ...formData, hours_per_week: e.target.value })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course_type">Course Type *</Label>
          <select
            id="course_type"
            name="course_type"
            value={formData.course_type}
            onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
            required
            className="w-full p-2 rounded-lg glass border border-border"
          >
            <option value="theory">Theory</option>
            <option value="practical">Practical</option>
            <option value="lab">Lab</option>
          </select>
        </div>
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

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground font-semibold glow-primary-hover"
          asChild
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {initialData?.id ? 'Update Subject' : 'Create Subject'}
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

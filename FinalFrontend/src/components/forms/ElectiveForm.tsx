import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { electiveService } from '@/services/electiveService';

interface ElectiveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const ElectiveForm = ({ onSuccess, onCancel, initialData }: ElectiveFormProps) => {
  const [formData, setFormData] = useState({
    subject_name: initialData?.name || '',
    description: initialData?.description || '',
    max_students: initialData?.max_students || '',
    department: initialData?.department || '',
    semester: initialData?.semester || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await electiveService.update(initialData.id, formData);
        toast.success('Elective updated successfully!');
      } else {
        await electiveService.create(formData);
        toast.success('Elective created successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save elective');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_students">Max Students *</Label>
          <Input
            id="max_students"
            name="max_students"
            type="number"
            value={formData.max_students}
            onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
            required
            className="glass"
          />
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
            {initialData?.id ? 'Update Elective' : 'Create Elective'}
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

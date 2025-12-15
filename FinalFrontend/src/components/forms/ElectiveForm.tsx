import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { electiveService, Elective } from '@/services/electiveService';

interface ElectiveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Elective | null;
}

export const ElectiveForm = ({ onSuccess, onCancel, initialData }: ElectiveFormProps) => {
  const [formData, setFormData] = useState({
    subject_name: initialData?.subject_name || '',
    description: initialData?.description || '',
    max_students: initialData?.max_students || 50,
    department: initialData?.department || '',
    semester: initialData?.semester || 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // List of 10 allowed subjects
  const allowedSubjects = [
    "Artificial Intelligence",
    "Statistics in Data Science",
    "Data Warehousing & Data Mining",
    "Distributed Systems",
    "Network Security",
    "Big Data Analytics",
    "Cloud Computing",
    "Machine Learning",
    "Mobile Computing",
    "Computer Vision & Applications",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate subject name is from allowed list
    if (!allowedSubjects.includes(formData.subject_name)) {
      toast.error('Please select a valid subject from the allowed list');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        subject_name: formData.subject_name,
        description: formData.description,
        max_students: parseInt(formData.max_students.toString()),
        department: formData.department,
        semester: parseInt(formData.semester.toString()),
      };

      if (initialData?.id) {
        await electiveService.update(initialData.id, payload);
        toast.success('Elective updated successfully!');
      } else {
        await electiveService.create(payload);
        toast.success('Elective created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save elective');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject_name">Subject Name *</Label>
        <select
          id="subject_name"
          value={formData.subject_name}
          onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-border bg-background glass focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a subject</option>
          {allowedSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Brief description of the elective"
          className="glass min-h-[100px]"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_students">Max Students *</Label>
          <Input
            id="max_students"
            type="number"
            min="1"
            max="200"
            value={formData.max_students}
            onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
            required
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
            placeholder="e.g., Computer Science"
            className="glass"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">Semester *</Label>
          <select
            id="semester"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background glass focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={submitting}
          loading={submitting}
          className="flex-1 bg-primary text-primary-foreground font-semibold glow-primary-hover"
          asChild
        >
          <motion.button 
            whileHover={!submitting ? { scale: 1.02 } : {}} 
            whileTap={!submitting ? { scale: 0.98 } : {}}
          >
            {initialData?.id ? 'Update Elective' : 'Create Elective'}
          </motion.button>
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={submitting}
          asChild
        >
          <motion.button 
            whileHover={!submitting ? { scale: 1.02 } : {}} 
            whileTap={!submitting ? { scale: 0.98 } : {}}
          >
            Cancel
          </motion.button>
        </Button>
      </div>
    </form>
  );
};

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { timetableService, Teacher, Subject } from '@/services/timetableService';

interface AssignTeacherSubjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  teachers: Teacher[];
  subjects: Subject[];
}

export const AssignTeacherSubjectForm = ({ 
  onSuccess, 
  onCancel, 
  teachers = [],
  subjects = [] 
}: AssignTeacherSubjectFormProps) => {
  const [formData, setFormData] = useState({
    teacher_id: '',
    subject_id: '',
    priority: '1',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Safety check for props
  const teacherList = Array.isArray(teachers) ? teachers : [];
  const subjectList = Array.isArray(subjects) ? subjects : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.teacher_id.trim()) {
        toast.error('Please select a teacher');
        return;
      }
      if (!formData.subject_id.trim()) {
        toast.error('Please select a subject');
        return;
      }

      await timetableService.assignTeacherSubject({
        teacher_id: formData.teacher_id.trim(),
        subject_id: formData.subject_id.trim(),
        priority: parseInt(formData.priority as any) || 1,
      });
      toast.success('Teacher assigned to subject successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign teacher to subject');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="teacher_id">Select Teacher *</Label>
        <select
          id="teacher_id"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
          required
          className="w-full p-2 rounded-lg glass border border-border"
        >
          <option value="">-- Choose a teacher --</option>
          {teacherList.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name} ({teacher.teacher_code}) - {teacher.department}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject_id">Select Subject *</Label>
        <select
          id="subject_id"
          name="subject_id"
          value={formData.subject_id}
          onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
          required
          className="w-full p-2 rounded-lg glass border border-border"
        >
          <option value="">-- Choose a subject --</option>
          {subjectList.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_name} ({subject.subject_code}) - {subject.course_type} - Sem {subject.semester}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full p-2 rounded-lg glass border border-border"
        >
          <option value="1">1 - Highest</option>
          <option value="2">2 - High</option>
          <option value="3">3 - Medium</option>
          <option value="4">4 - Low</option>
          <option value="5">5 - Lowest</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <motion.button
          type="submit"
          disabled={isLoading || teacherList.length === 0 || subjectList.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold glow-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Assigning...' : 'Assign Teacher to Subject'}
        </motion.button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>

      {teacherList.length === 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-yellow-600">
          ⚠️ No teachers available. Please create at least one teacher first.
        </div>
      )}
      {subjectList.length === 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-yellow-600">
          ⚠️ No subjects available. Please create at least one subject first.
        </div>
      )}
    </form>
  );
};

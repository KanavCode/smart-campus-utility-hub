import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { timetableService, Subject, Group } from '@/services/timetableService';

interface AssignSubjectGroupFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  subjects: Subject[];
  groups: Group[];
}

export const AssignSubjectGroupForm = ({ 
  onSuccess, 
  onCancel, 
  subjects = [],
  groups = [] 
}: AssignSubjectGroupFormProps) => {
  const [formData, setFormData] = useState({
    subject_id: '',
    group_id: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Safety check for props
  const subjectList = Array.isArray(subjects) ? subjects : [];
  const groupList = Array.isArray(groups) ? groups : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.subject_id.trim()) {
        toast.error('Please select a subject');
        return;
      }
      if (!formData.group_id.trim()) {
        toast.error('Please select a group');
        return;
      }

      await timetableService.assignSubjectGroup({
        subject_id: formData.subject_id.trim(),
        group_id: formData.group_id.trim(),
      });
      toast.success('Subject assigned to group successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign subject to group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="group_id">Select Group/Class *</Label>
        <select
          id="group_id"
          name="group_id"
          value={formData.group_id}
          onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
          required
          className="w-full p-2 rounded-lg glass border border-border"
        >
          <option value="">-- Choose a group --</option>
          {groupList.map(group => (
            <option key={group.id} value={group.id}>
              {group.group_name} ({group.group_code}) - {group.strength} students - Sem {group.semester}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg text-sm text-blue-600">
        ℹ️ This assigns the selected subject to the selected group/class for timetable generation.
      </div>

      <div className="flex gap-3 pt-4">
        <motion.button
          type="submit"
          disabled={isLoading || subjectList.length === 0 || groupList.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold glow-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Assigning...' : 'Assign Subject to Group'}
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

      {subjectList.length === 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-yellow-600">
          ⚠️ No subjects available. Please create at least one subject first.
        </div>
      )}
      {groupList.length === 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-yellow-600">
          ⚠️ No groups available. Please create at least one group first.
        </div>
      )}
    </form>
  );
};

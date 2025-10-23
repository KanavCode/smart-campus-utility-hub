import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { userService } from '@/services/userService';

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const UserForm = ({ onSuccess, onCancel, initialData }: UserFormProps) => {
  const [formData, setFormData] = useState({
    full_name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'student',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await userService.update(initialData.id, formData);
        toast.success('User updated successfully!');
      } else {
        await userService.create(formData);
        toast.success('User created successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="password">Password {!initialData?.id && '*'}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!initialData?.id}
          className="glass"
          placeholder={initialData?.id ? 'Leave blank to keep current' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
          className="w-full p-2 rounded-lg glass border border-border"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground font-semibold glow-primary-hover"
          asChild
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {initialData?.id ? 'Update User' : 'Create User'}
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

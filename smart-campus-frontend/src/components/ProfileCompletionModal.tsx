import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { UserCircle } from 'lucide-react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const ProfileCompletionModal = ({ isOpen, onComplete }: ProfileCompletionModalProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    semester: '',
    cgpa: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(formData);
      toast.success('Profile completed successfully!');
      onComplete();
    } catch (error) {
      toast.error('Failed to complete profile');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <UserCircle className="h-16 w-16 text-primary" />
            </motion.div>
          </div>
          <DialogTitle className="text-center text-2xl">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center">
            Welcome! Please complete your profile to get started with Smart Campus Hub
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
              placeholder="e.g., Computer Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
                placeholder="1-8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground glow-primary-hover"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Complete Profile
            </motion.button>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

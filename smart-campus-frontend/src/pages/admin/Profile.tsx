import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/modals/FormModal';
import { User, Lock, Mail, Shield, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

export default function AdminProfile() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: 'Admin User',
    email: 'admin@campus.edu',
    role: 'Administrator',
    department: 'Administration',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      await authService.changePassword(passwordData.current_password, passwordData.new_password);
      toast.success('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Administrator Profile</h1>
          <p className="text-muted-foreground">Manage your administrator account settings</p>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Administrator Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="text-lg font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {profileData.full_name}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profileData.email}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {profileData.role}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {profileData.department}
                </p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-primary text-primary-foreground glow-primary-hover"
                asChild
              >
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  Edit Profile
                </motion.button>
              </Button>
              <Button
                onClick={() => setIsPasswordModalOpen(true)}
                variant="outline"
                className="glow-accent-hover"
                asChild
              >
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </motion.button>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Access Card */}
        <Card className="glass border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Administrator Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="font-medium">User Management</span>
                <span className="text-sm text-muted-foreground">Full Access</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="font-medium">Event Management</span>
                <span className="text-sm text-muted-foreground">Full Access</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="font-medium">Timetable Configuration</span>
                <span className="text-sm text-muted-foreground">Full Access</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="font-medium">System Settings</span>
                <span className="text-sm text-muted-foreground">Full Access</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Administrator Profile"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={profileData.department}
              onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              asChild
            >
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                Cancel
              </motion.button>
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground" asChild>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                Save Changes
              </motion.button>
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Change Password Modal */}
      <FormModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordModalOpen(false)}
              asChild
            >
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                Cancel
              </motion.button>
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground" asChild>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                Change Password
              </motion.button>
            </Button>
          </div>
        </form>
      </FormModal>
    </DashboardLayout>
  );
}

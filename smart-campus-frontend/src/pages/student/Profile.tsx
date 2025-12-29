import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/modals/FormModal';
import { User, Lock, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    department: '',
    semester: '',
    cgpa: ''
  });

  // Load user profile on mount
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        department: user.department || '',
        semester: user.semester?.toString() || '',
        cgpa: user.cgpa?.toString() || ''
      });
    }
    setLoading(false);
  }, [user]);

  // Calculate profile completion
  const calculateCompletion = () => {
    const requiredFields = ['full_name', 'email', 'department'];
    if (user?.role === 'student') {
      requiredFields.push('cgpa', 'semester');
    }
    const filled = requiredFields.filter(field => profileData[field as keyof typeof profileData] && profileData[field as keyof typeof profileData].toString().trim() !== '').length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  const profileCompletion = calculateCompletion();
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatePayload: any = {
        full_name: profileData.full_name,
        email: profileData.email,
        department: profileData.department
      };
      
      // Add student-specific fields
      if (user?.role === 'student') {
        updatePayload.cgpa = parseFloat(profileData.cgpa);
        updatePayload.semester = parseInt(profileData.semester);
      }
      
      await authService.updateProfile(updatePayload);
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

//   return (
//     <DashboardLayout>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="space-y-6"
//       >
//         <div>
//           <h1 className="text-3xl font-bold mb-2">My Profile</h1>
//           <p className="text-muted-foreground">Manage your account settings</p>
//         </div>

//         <Card className="glass">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center gap-2">
//                 <User className="h-5 w-5" />
//                 Personal Information
//               </CardTitle>
//               <div className="text-right">
//                 <p className="text-sm text-muted-foreground">Profile Completion</p>
//                 <p className="text-2xl font-bold text-primary">{profileCompletion}%</p>
//               </div>
//             </div>
//             <div className="w-full bg-muted rounded-full h-2 mt-4">
//               <motion.div 
//                 className="bg-primary h-2 rounded-full"
//                 initial={{ width: 0 }}
//                 animate={{ width: `${profileCompletion}%` }}
//                 transition={{ duration: 1, ease: "easeOut" }}
//               />
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <Label className="text-muted-foreground">Full Name</Label>
//                 <p className="text-lg font-medium">{profileData.full_name}</p>
//               </div>
//               <div>
//                 <Label className="text-muted-foreground">Email</Label>
//                 <p className="text-lg font-medium flex items-center gap-2">
//                   <Mail className="h-4 w-4" />
//                   {profileData.email}
//                 </p>
//               </div>
//               <div>
//                 <Label className="text-muted-foreground">Department</Label>
//                 <p className="text-lg font-medium flex items-center gap-2">
//                   <GraduationCap className="h-4 w-4" />
//                   {profileData.department || 'Not set'}
//                 </p>
//               </div>
//               {user?.role === 'student' && (
//                 <>
//                   <div>
//                     <Label className="text-muted-foreground">Semester</Label>
//                     <p className="text-lg font-medium">{profileData.semester || 'Not set'}</p>
//                   </div>
//                   <div>
//                     <Label className="text-muted-foreground">CGPA</Label>
//                     <p className="text-lg font-medium">{profileData.cgpa || 'Not set'}</p>
//                   </div>
//                 </>
//               )}
//             </div>
//             <div className="flex gap-4 pt-4">
//               <Button
//                 onClick={() => setIsEditModalOpen(true)}
//                 className="bg-primary text-primary-foreground glow-primary-hover"
//                 asChild
//               >
//                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
//                   Edit Profile
//                 </motion.button>
//               </Button>
//               <Button
//                 onClick={() => setIsPasswordModalOpen(true)}
//                 variant="outline"
//                 className="glow-accent-hover"
//                 asChild
//               >
//                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
//                   <Lock className="h-4 w-4 mr-2" />
//                   Change Password
//                 </motion.button>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Edit Profile Modal */}
//       <FormModal
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         title="Edit Profile"
//       >
//         <form onSubmit={handleUpdateProfile} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="full_name">Full Name</Label>
//             <Input
//               id="full_name"
//               value={profileData.full_name}
//               onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="email">Email (Read-only)</Label>
//             <Input
//               id="email"
//               type="email"
//               value={profileData.email}
//               disabled
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="department">Department</Label>
//             <Input
//               id="department"
//               value={profileData.department}
//               onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
//             />
//           </div>
//           {user?.role === 'student' && (
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="semester">Semester</Label>
//                 <Input
//                   id="semester"
//                   type="number"
//                   min="1"
//                   max="8"
//                   value={profileData.semester}
//                   onChange={(e) => setProfileData({ ...profileData, semester: e.target.value })}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="cgpa">CGPA</Label>
//                 <Input
//                   id="cgpa"
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   max="10"
//                   value={profileData.cgpa}
//                   onChange={(e) => setProfileData({ ...profileData, cgpa: e.target.value })}
//                   required
//                 />
//               </div>
//             </div>
//           )}
//           <div className="flex gap-2 justify-end">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setIsEditModalOpen(false)}
//               asChild
//             >
//               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
//                 Cancel
//               </motion.button>
//             </Button>
//             <Button type="submit" className="bg-primary text-primary-foreground" asChild>
//               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
//                 Save Changes
//               </motion.button>
//             </Button>
//           </div>
//         </form>
//       </FormModal>

//       {/* Change Password Modal */}
//       <FormModal
//         isOpen={isPasswordModalOpen}
//         onClose={() => setIsPasswordModalOpen(false)}
//         title="Change Password"
//       >
//         <form onSubmit={handleChangePassword} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="oldPassword">Current Password</Label>
//             <Input
//               id="oldPassword"
//               type="password"
//               value={passwordData.oldPassword}
//               onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="newPassword">New Password</Label>
//             <Input
//               id="newPassword"
//               type="password"
//               value={passwordData.newPassword}
//               onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="confirm_password">Confirm New Password</Label>
//             <Input
//               id="confirm_password"
//               type="password"
//               value={passwordData.confirm_password}
//               onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
//               required
//             />
//           </div>
//           <div className="flex gap-2 justify-end">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setIsPasswordModalOpen(false)}
//               asChild
//             >
//               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
//                 Cancel
//               </motion.button>
//             </Button>
//             <Button type="submit" className="bg-primary text-primary-foreground" asChild>
//               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
//                 Change Password
//               </motion.button>
//             </Button>
//           </div>
//         </form>
//       </FormModal>
//     </DashboardLayout>
//   );
// }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Profile Completion</p>
                <p className="text-2xl font-bold text-primary">{profileCompletion}%</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <motion.div 
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="text-lg font-medium">{profileData.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profileData.email}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="text-lg font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {profileData.department}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Semester</Label>
                <p className="text-lg font-medium">{profileData.semester || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">CGPA</Label>
                <p className="text-lg font-medium">{profileData.cgpa || 'Not set'}</p>
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
      </motion.div>

      {/* Edit Profile Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
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
            <Label htmlFor="email">Email (Read-only)</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              disabled
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            </div>
            {user?.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  type="number"
                  min="1"
                  max="8"
                  value={profileData.semester}
                  onChange={(e) => setProfileData({ ...profileData, semester: e.target.value })}
                  required
                />
              </div>
            )}
          </div>
          {user?.role === 'student' && (
            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profileData.cgpa}
                onChange={(e) => setProfileData({ ...profileData, cgpa: e.target.value })}
                required
              />
            </div>
          )}
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
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              type="password"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/modals/FormModal';
import { AvatarCropModal } from '@/components/modals/AvatarCropModal';
import { TwoFactorSetupModal } from '@/components/modals/TwoFactorSetupModal';
import { Switch } from '@/components/ui/switch';
import { User, Lock, Mail, GraduationCap, Camera, ShieldCheck, Laptop, Smartphone, Globe, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { ApiError, UserFormData, UserSession } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { isSoundEffectsEnabled, setSoundEffectsEnabled } from '@/lib/successSound';

export default function Profile() {
  const { user, disableTwoFactor, getTwoFactorStatus } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [twoFactorStatus, setTwoFactorStatus] = useState<{ twoFactorEnabled: boolean; backupCodesCount: number } | null>(null);
  const [soundEffectsEnabled, setSoundEffectsEnabledState] = useState(isSoundEffectsEnabled);

  // Sessions state
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Avatar crop state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    department: '',
    semester: '',
    cgpa: ''
  });
  const requiredProfileFields = user?.role === 'student'
    ? ['full_name', 'email', 'department', 'semester', 'cgpa'] as const
    : ['full_name', 'email', 'department'] as const;

  const requiredFieldLabels: Record<(typeof requiredProfileFields)[number], string> = {
    full_name: 'Full Name',
    email: 'Email',
    department: 'Department',
    semester: 'Semester',
    cgpa: 'CGPA'
  };

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
      
      // Fetch 2FA status
      fetchTwoFactorStatus();
    }
    setLoading(false);
  }, [user]);

  const fetchTwoFactorStatus = async () => {
    try {
      const status = await getTwoFactorStatus();
      setTwoFactorStatus(status);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    }
  };

  const isRequiredFieldFilled = (field: (typeof requiredProfileFields)[number]) => {
    const value = profileData[field];
    return value !== null && value !== undefined && value.toString().trim() !== '';
  };

  const profileCompletion = Math.round(
    (requiredProfileFields.filter(isRequiredFieldFilled).length / requiredProfileFields.length) * 100
  );
  const missingRequiredFields = requiredProfileFields.filter(field => !isRequiredFieldFilled(field));
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Avatar file selection → open crop modal
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setIsCropModalOpen(true);
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  // Receive cropped Blob from AvatarCropModal → upload to backend
  const handleAvatarSave = async (croppedBlob: Blob) => {
    try {
      await authService.uploadAvatar(croppedBlob);
      // Show local preview immediately (avoids waiting for server round-trip)
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(URL.createObjectURL(croppedBlob));
      toast.success('Profile photo updated!');
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err?.message || 'Failed to upload avatar');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!profileData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (user?.role === 'student') {
      if (!profileData.department.trim()) {
        errors.department = 'Department is required';
      }
      if (!profileData.semester) {
        errors.semester = 'Semester is required';
      } else {
        const semVal = parseInt(profileData.semester, 10);
        if (isNaN(semVal) || semVal < 1 || semVal > 8) {
          errors.semester = 'Semester must be between 1 and 8';
        }
      }
      if (!profileData.cgpa) {
        errors.cgpa = 'CGPA is required';
      } else {
        const cgpaVal = parseFloat(profileData.cgpa);
        if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
          errors.cgpa = 'CGPA must be between 0 and 10';
        }
      }
    }

    setEditErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const updatePayload: UserFormData = {
        full_name: profileData.full_name,
        email: profileData.email,
        department: profileData.department || undefined,
      };
      
      // Add student-specific fields
      if (user?.role === 'student') {
        updatePayload.cgpa = parseFloat(profileData.cgpa);
        updatePayload.semester = parseInt(profileData.semester);
      }
      
      await authService.updateProfile(updatePayload);
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err?.message || 'Failed to change password');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await authService.getSessions();
      if (response?.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: number) => {
    try {
      const response = await authService.revokeSession(sessionId);
      if (response?.success) {
        toast.success('Session revoked successfully!');
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        toast.error(response?.message || 'Failed to revoke session');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to revoke session');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('phone') || type.includes('mobile') || type.includes('ios') || type.includes('android')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (type.includes('windows') || type.includes('mac') || type.includes('linux') || type.includes('chrome')) {
      return <Laptop className="h-5 w-5" />;
    }
    return <Globe className="h-5 w-5" />;
  };

  const formatLastActive = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Unknown';
    }
  };

  const handle2FADisable = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }
    try {
      await disableTwoFactor();
      toast.success('2FA has been disabled');
      setTwoFactorStatus(prev => prev ? { ...prev, twoFactorEnabled: false } : null);
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err?.message || 'Failed to disable 2FA');
    }
  };

  const handle2FASetupSuccess = () => {
    setIs2FAModalOpen(false);
    toast.success('2FA has been enabled successfully');
    fetchTwoFactorStatus();
  };

  const handleSoundEffectsChange = (enabled: boolean) => {
    setSoundEffectsEnabledState(enabled);
    setSoundEffectsEnabled(enabled);
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
            <div className="flex items-start justify-between gap-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-primary/60" />
                    )}
                  </div>
                  <motion.div
                    whileHover={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Profile Completion</p>
                <p className="text-2xl font-bold text-primary">{profileCompletion}%</p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              id="avatar-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Required fields</p>
                <p className="text-xs text-muted-foreground">
                  {missingRequiredFields.length === 0 ? 'All required fields complete' : `${missingRequiredFields.length} missing`}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {requiredProfileFields.map((field) => {
                  const isMissing = !isRequiredFieldFilled(field);
                  return (
                    <span
                      key={field}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        isMissing
                          ? 'border-destructive/40 bg-destructive/10 text-destructive'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {requiredFieldLabels[field]}{isMissing ? ' missing' : ' complete'}
                    </span>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className={isRequiredFieldFilled('full_name') ? '' : 'rounded-lg border border-destructive/30 bg-destructive/5 p-3'}>
                <Label className={isRequiredFieldFilled('full_name') ? 'text-muted-foreground' : 'text-destructive'}>Full Name</Label>
                <p className={`text-lg font-medium ${isRequiredFieldFilled('full_name') ? '' : 'text-destructive'}`}>{profileData.full_name || 'Not set'}</p>
              </div>
              <div className={isRequiredFieldFilled('email') ? '' : 'rounded-lg border border-destructive/30 bg-destructive/5 p-3'}>
                <Label className={isRequiredFieldFilled('email') ? 'text-muted-foreground' : 'text-destructive'}>Email</Label>
                <p className={`text-lg font-medium flex items-center gap-2 ${isRequiredFieldFilled('email') ? '' : 'text-destructive'}`}>
                  <Mail className="h-4 w-4" />
                  {profileData.email || 'Not set'}
                </p>
              </div>
              <div className={isRequiredFieldFilled('department') ? '' : 'rounded-lg border border-destructive/30 bg-destructive/5 p-3'}>
                <Label className={isRequiredFieldFilled('department') ? 'text-muted-foreground' : 'text-destructive'}>Department</Label>
                <p className={`text-lg font-medium flex items-center gap-2 ${isRequiredFieldFilled('department') ? '' : 'text-destructive'}`}>
                  <GraduationCap className="h-4 w-4" />
                  {profileData.department || 'Not set'}
                </p>
              </div>
              <div className={user?.role === 'student' && !isRequiredFieldFilled('semester') ? 'rounded-lg border border-destructive/30 bg-destructive/5 p-3' : ''}>
                <Label className={user?.role === 'student' && !isRequiredFieldFilled('semester') ? 'text-destructive' : 'text-muted-foreground'}>Semester</Label>
                <p className={`text-lg font-medium ${user?.role === 'student' && !isRequiredFieldFilled('semester') ? 'text-destructive' : ''}`}>{profileData.semester || 'Not set'}</p>
              </div>
              <div className={user?.role === 'student' && !isRequiredFieldFilled('cgpa') ? 'rounded-lg border border-destructive/30 bg-destructive/5 p-3' : ''}>
                <Label className={user?.role === 'student' && !isRequiredFieldFilled('cgpa') ? 'text-destructive' : 'text-muted-foreground'}>CGPA</Label>
                <p className={`text-lg font-medium ${user?.role === 'student' && !isRequiredFieldFilled('cgpa') ? 'text-destructive' : ''}`}>{profileData.cgpa || 'Not set'}</p>
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
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
              <Label htmlFor="sound-effects">Enable Sound Effects</Label>
              <Switch
                id="sound-effects"
                checked={soundEffectsEnabled}
                onCheckedChange={handleSoundEffectsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="glass mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Active Sessions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Devices and locations currently accessing your account. Revoke any unfamiliar sessions.
            </p>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No active sessions found.</p>
            ) : (
              <div className="space-y-4 divide-y divide-border">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between gap-4 pt-4 ${index === 0 ? 'pt-0' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                        {getDeviceIcon(session.device_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{session.device_type}</p>
                          {session.is_current && (
                            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Globe className="h-3.5 w-3.5" />
                          {session.location} • {session.ip_address}
                        </p>
                        <p className="text-xs text-muted-foreground/85 mt-0.5">
                          Last active: {formatLastActive(session.last_active)}
                        </p>
                      </div>
                    </div>

                    {!session.is_current && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        asChild
                      >
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Revoke
                        </motion.button>
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Avatar Crop Modal */}
      {rawImageSrc && (
        <AvatarCropModal
          isOpen={isCropModalOpen}
          imageSrc={rawImageSrc}
          onClose={() => {
            setIsCropModalOpen(false);
            URL.revokeObjectURL(rawImageSrc);
            setRawImageSrc(null);
          }}
          onSave={handleAvatarSave}
        />
      )}

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
              onChange={(e) => {
                setProfileData({ ...profileData, full_name: e.target.value });
                if (editErrors.full_name) {
                  setEditErrors((prev) => {
                    const next = { ...prev };
                    delete next.full_name;
                    return next;
                  });
                }
              }}
              required
              aria-invalid={!!editErrors.full_name}
              aria-describedby={editErrors.full_name ? "edit-fullname-error" : undefined}
              className={editErrors.full_name ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {editErrors.full_name && (
              <p id="edit-fullname-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {editErrors.full_name}
              </p>
            )}
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
                onChange={(e) => {
                  setProfileData({ ...profileData, department: e.target.value });
                  if (editErrors.department) {
                    setEditErrors((prev) => {
                      const next = { ...prev };
                      delete next.department;
                      return next;
                    });
                  }
                }}
                aria-invalid={!!editErrors.department}
                aria-describedby={editErrors.department ? "edit-department-error" : undefined}
                className={editErrors.department ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {editErrors.department && (
                <p id="edit-department-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span> {editErrors.department}
                </p>
              )}
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
                  onChange={(e) => {
                    setProfileData({ ...profileData, semester: e.target.value });
                    if (editErrors.semester) {
                      setEditErrors((prev) => {
                        const next = { ...prev };
                        delete next.semester;
                        return next;
                      });
                    }
                  }}
                  required
                  aria-invalid={!!editErrors.semester}
                  aria-describedby={editErrors.semester ? "edit-semester-error" : undefined}
                  className={editErrors.semester ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {editErrors.semester && (
                  <p id="edit-semester-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                    <span aria-hidden="true">⚠</span> {editErrors.semester}
                  </p>
                )}
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
                onChange={(e) => {
                  setProfileData({ ...profileData, cgpa: e.target.value });
                  if (editErrors.cgpa) {
                    setEditErrors((prev) => {
                      const next = { ...prev };
                      delete next.cgpa;
                      return next;
                    });
                  }
                }}
                required
                aria-invalid={!!editErrors.cgpa}
                aria-describedby={editErrors.cgpa ? "edit-cgpa-error" : undefined}
                className={editErrors.cgpa ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {editErrors.cgpa && (
                <p id="edit-cgpa-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span> {editErrors.cgpa}
                </p>
              )}
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
              onChange={(e) => {
                setPasswordData({ ...passwordData, oldPassword: e.target.value });
                if (passwordErrors.oldPassword) {
                  setPasswordErrors((prev) => {
                    const next = { ...prev };
                    delete next.oldPassword;
                    return next;
                  });
                }
              }}
              required
              aria-invalid={!!passwordErrors.oldPassword}
              aria-describedby={passwordErrors.oldPassword ? "password-old-error" : undefined}
              className={passwordErrors.oldPassword ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {passwordErrors.oldPassword && (
              <p id="password-old-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {passwordErrors.oldPassword}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => {
                setPasswordData({ ...passwordData, newPassword: e.target.value });
                if (passwordErrors.newPassword || passwordErrors.confirmPassword) {
                  setPasswordErrors((prev) => {
                    const next = { ...prev };
                    delete next.newPassword;
                    delete next.confirmPassword;
                    return next;
                  });
                }
              }}
              required
              aria-invalid={!!passwordErrors.newPassword}
              aria-describedby={passwordErrors.newPassword ? "password-new-error" : undefined}
              className={passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {passwordErrors.newPassword && (
              <p id="password-new-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {passwordErrors.newPassword}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => {
                setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                if (passwordErrors.confirmPassword) {
                  setPasswordErrors((prev) => {
                    const next = { ...prev };
                    delete next.confirmPassword;
                    return next;
                  });
                }
              }}
              required
              aria-invalid={!!passwordErrors.confirmPassword}
              aria-describedby={passwordErrors.confirmPassword ? "password-confirm-error" : undefined}
              className={passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {passwordErrors.confirmPassword && (
              <p id="password-confirm-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {passwordErrors.confirmPassword}
              </p>
            )}
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

      {/* Two-Factor Authentication Card */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorStatus?.twoFactorEnabled ? (
                  <span className="text-green-600">Enabled ✓</span>
                ) : (
                  <span className="text-orange-600">Not Enabled</span>
                )}
              </p>
            </div>
            {twoFactorStatus?.backupCodesCount !== undefined && twoFactorStatus.twoFactorEnabled && (
              <div className="text-right">
                <p className="font-medium">{twoFactorStatus.backupCodesCount} Backup Codes</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            )}
          </div>

          {twoFactorStatus?.twoFactorEnabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <p>Your account is protected with two-factor authentication. Great job keeping your account secure!</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <p>Enable two-factor authentication to add an extra layer of security to your account.</p>
            </div>
          )}

          <div className="flex gap-4">
            {!twoFactorStatus?.twoFactorEnabled ? (
              <Button
                onClick={() => setIs2FAModalOpen(true)}
                className="bg-primary text-primary-foreground"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            ) : (
              <Button variant="destructive" onClick={handle2FADisable}>
                <Lock className="h-4 w-4 mr-2" />
                Disable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onSuccess={handle2FASetupSuccess}
      />
    </DashboardLayout>
  );
}


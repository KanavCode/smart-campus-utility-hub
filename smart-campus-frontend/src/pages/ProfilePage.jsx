import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

/**
 * ProfilePage Component
 *
 * User profile page with editable fields, avatar upload, and settings
 * Features: view/edit mode toggle, form validation, profile picture upload
 */
const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock user data (would come from API/auth store in real app)
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@university.edu",
    phone: "+1 (555) 123-4567",
    studentId: "STU-2024-001",
    program: "Computer Science",
    year: "3rd Year",
    semester: "Fall 2024",
    avatar: null,
  });

  const [editedData, setEditedData] = useState({ ...userData });

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast.error("Image must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real app: await api.updateProfile(editedData);
    setUserData(editedData);
    setIsEditing(false);
    setIsSaving(false);

    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditedData({ ...userData });
    setIsEditing(false);
  };

  const InfoField = ({ icon: Icon, label, value, field, editable = false }) => {
    const isCurrentlyEditing = isEditing && editable;

    return (
      <div className="flex items-start gap-4 p-4 glass rounded-lg hover:bg-white/5 transition-colors">
        <div className="p-2 glass rounded-lg">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          {isCurrentlyEditing ? (
            <input
              type="text"
              value={editedData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:border-primary-500 focus:outline-none"
            />
          ) : (
            <p className="text-white font-medium">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-300">
            Manage your personal information and settings
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl overflow-hidden"
        >
          {/* Avatar Section */}
          <div className="relative h-32 bg-gradient-to-r from-primary-600 to-secondary-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full border-4 border-primary-900 overflow-hidden bg-primary-700">
                  {editedData.avatar ? (
                    <img
                      src={editedData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircleIcon className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-primary-500 hover:bg-primary-600 rounded-full cursor-pointer transition-colors shadow-lg">
                    <CameraIcon className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="absolute top-4 right-4">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded-lg text-white font-medium transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 p-8">
            {/* Name and ID */}
            <div className="mb-8">
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-3xl font-bold text-white bg-black/20 border border-white/10 rounded-lg px-4 py-2 mb-2 focus:border-primary-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-3xl font-bold text-white mb-2">
                  {userData.name}
                </h2>
              )}
              <p className="text-gray-400 font-mono">{userData.studentId}</p>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                icon={EnvelopeIcon}
                label="Email"
                value={userData.email}
                field="email"
                editable={true}
              />

              <InfoField
                icon={PhoneIcon}
                label="Phone"
                value={userData.phone}
                field="phone"
                editable={true}
              />

              <InfoField
                icon={AcademicCapIcon}
                label="Program"
                value={userData.program}
                field="program"
                editable={false}
              />

              <InfoField
                icon={CalendarIcon}
                label="Academic Year"
                value={userData.year}
                field="year"
                editable={false}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 glass rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                Current Semester
              </h3>
              <p className="text-gray-300 text-lg">{userData.semester}</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-strong rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Account Settings
          </h3>

          <div className="space-y-4">
            {/* Notification Settings */}
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">
                  Receive updates about events and deadlines
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-400">
                  Get text messages for urgent updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <p className="text-white font-medium">Profile Visibility</p>
                <p className="text-sm text-gray-400">
                  Make your profile visible to other students
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 p-6 border border-red-500/30 rounded-lg bg-red-500/5">
            <h4 className="text-lg font-semibold text-red-400 mb-2">
              Danger Zone
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              These actions cannot be undone. Please be careful.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 rounded-lg font-medium transition-colors">
                Change Password
              </button>
              <button className="px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 rounded-lg font-medium transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;

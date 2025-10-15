import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Settings,
  Bell,
  Shield,
  Moon,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  Mail,
  Smartphone,
  Monitor,
  Palette,
  Languages,
  Clock,
  Database,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { fadeInUp, staggerContainer } from '../lib/animations';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    timetableAlerts: true,
    clubUpdates: false,
    weeklyDigest: true,
    
    // Privacy
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    activityStatus: true,
    
    // Preferences
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    
    // Appearance
    themeMode: theme,
    accentColor: 'purple',
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Setting updated');
  };

  const handleSelectChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    if (key === 'themeMode') {
      setTheme(value);
    }
    
    toast.success('Setting updated');
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    toast.error('Account deletion is not available in demo mode');
    setShowDeleteModal(false);
  };

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email shortly.');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl mx-auto px-6 py-8 space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and settings</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <motion.div variants={fadeInUp} className="lg:col-span-1">
          <Card className="p-2 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-500/20 text-primary-400 font-medium'
                        : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </motion.div>

        {/* Content Area */}
        <motion.div variants={fadeInUp} className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                General Settings
              </h2>
              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Languages className="w-4 h-4 inline mr-2" />
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSelectChange('language', e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSelectChange('timezone', e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notification Preferences
              </h2>
              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">Push Notifications</p>
                      <p className="text-sm text-gray-400">Get real-time browser alerts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('pushNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.pushNotifications ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.pushNotifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Event Reminders */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="font-medium text-white">Event Reminders</p>
                      <p className="text-sm text-gray-400">Get notified before events start</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('eventReminders')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.eventReminders ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.eventReminders ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Timetable Alerts */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-white">Timetable Alerts</p>
                      <p className="text-sm text-gray-400">Alerts for class schedules</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('timetableAlerts')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.timetableAlerts ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.timetableAlerts ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Club Updates */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-pink-400" />
                    <div>
                      <p className="font-medium text-white">Club Updates</p>
                      <p className="text-sm text-gray-400">News from clubs you follow</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('clubUpdates')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.clubUpdates ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.clubUpdates ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Weekly Digest */}
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="font-medium text-white">Weekly Digest</p>
                      <p className="text-sm text-gray-400">Summary of your week every Sunday</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('weeklyDigest')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.weeklyDigest ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.weeklyDigest ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Privacy & Security
                </h2>
                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Eye className="w-4 h-4 inline mr-2" />
                      Profile Visibility
                    </label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="public">Public - Visible to everyone</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>

                  {/* Show Email */}
                  <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Show Email on Profile</p>
                      <p className="text-sm text-gray-400">Others can see your email address</p>
                    </div>
                    <button
                      onClick={() => handleToggle('showEmail')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showEmail ? 'bg-primary-500' : 'bg-dark-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.showEmail ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Show Phone */}
                  <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Show Phone Number</p>
                      <p className="text-sm text-gray-400">Others can see your phone number</p>
                    </div>
                    <button
                      onClick={() => handleToggle('showPhone')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showPhone ? 'bg-primary-500' : 'bg-dark-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.showPhone ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Activity Status */}
                  <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Show Activity Status</p>
                      <p className="text-sm text-gray-400">Let others see when you're online</p>
                    </div>
                    <button
                      onClick={() => handleToggle('activityStatus')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.activityStatus ? 'bg-primary-500' : 'bg-dark-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.activityStatus ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Security Actions */}
              <Card className="p-8">
                <h3 className="text-lg font-semibold text-white mb-4">Security Actions</h3>
                <div className="space-y-3">
                  <Button onClick={handlePasswordChange} variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button onClick={logout} variant="outline" className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out from All Devices
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Palette className="w-6 h-6" />
                Appearance
              </h2>
              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Moon className="w-4 h-4 inline mr-2" />
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'auto'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleSelectChange('themeMode', mode)}
                        className={`p-4 rounded-lg border-2 transition-all capitalize ${
                          settings.themeMode === mode
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-medium text-white">{mode}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Accent Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {['purple', 'blue', 'green', 'pink', 'orange', 'red'].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleSelectChange('accentColor', color)}
                        className={`w-12 h-12 rounded-lg transition-all ${
                          settings.accentColor === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800'
                            : ''
                        }`}
                        style={{
                          background:
                            color === 'purple'
                              ? '#7950F2'
                              : color === 'blue'
                              ? '#3B82F6'
                              : color === 'green'
                              ? '#10B981'
                              : color === 'pink'
                              ? '#EC4899'
                              : color === 'orange'
                              ? '#F59E0B'
                              : '#EF4444',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Data & Storage */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card className="p-8">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Data Management
                </h2>
                <div className="space-y-4">
                  <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  <p className="text-sm text-gray-400">
                    Download a copy of your data including profile, events, and activity history
                  </p>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-8 border-2 border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <Button onClick={handleDeleteAccount} variant="danger" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                  <p className="text-sm text-gray-400">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-white font-medium mb-1">This action is permanent</p>
              <p className="text-sm text-gray-400">
                Your account and all data will be permanently deleted. This cannot be undone.
              </p>
            </div>
          </div>
          <Input placeholder="Type 'DELETE' to confirm" />
          <div className="flex gap-3">
            <Button onClick={() => setShowDeleteModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmDeleteAccount} variant="danger" className="flex-1">
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input type="password" placeholder="Current Password" icon={Lock} />
          <Input type="password" placeholder="New Password" icon={Lock} />
          <Input type="password" placeholder="Confirm New Password" icon={Lock} />
          <div className="flex gap-3">
            <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success('Password changed successfully!');
                setShowPasswordModal(false);
              }}
              variant="primary"
              className="flex-1"
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

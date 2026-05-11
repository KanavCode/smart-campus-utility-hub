import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { settingsService, type AdminSettings } from '@/services/settingsService';

export default function Settings() {
  const [settings, setSettings] = useState<AdminSettings>({
    academic_year: '2024-2025',
    current_semester: 'Fall',
    campus_name: 'Smart Campus University'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsService.get();
        if (response?.data?.settings) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        console.error('Failed to load admin settings', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await settingsService.update(settings);
      if (response?.data?.settings) {
        setSettings(response.data.settings);
      }
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save admin settings', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
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
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and manage users</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading settings...</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Input
                        value={settings.academic_year}
                        onChange={(e) => setSettings((prev) => ({ ...prev, academic_year: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Semester</Label>
                      <select
                        className="w-full p-2 rounded-lg bg-card border border-border"
                        value={settings.current_semester}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            current_semester: e.target.value as AdminSettings['current_semester']
                          }))
                        }
                      >
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Campus Name</Label>
                      <Input
                        value={settings.campus_name}
                        onChange={(e) => setSettings((prev) => ({ ...prev, campus_name: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground font-semibold glow-primary-hover"
              disabled={isLoading || isSaving}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </motion.span>
            </Button>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  User account management is maintained on the dedicated admin users page.
                </p>
                <Button asChild className="bg-primary text-primary-foreground font-semibold">
                  <Link to="/admin/users">Go to Admin Users</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}

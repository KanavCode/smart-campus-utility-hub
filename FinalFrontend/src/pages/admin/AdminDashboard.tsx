import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, BookOpen, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FormModal } from '@/components/modals/FormModal';
import { UserForm } from '@/components/forms/UserForm';
import { EventForm } from '@/components/forms/EventForm';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const quickActions = [
    { 
      label: 'Add User', 
      icon: Users, 
      action: () => setIsUserModalOpen(true)
    },
    { 
      label: 'Create Event', 
      icon: Calendar, 
      action: () => setIsEventModalOpen(true)
    },
    { 
      label: 'Manage Electives', 
      icon: BookOpen, 
      action: () => navigate('/admin/electives')
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="glass glow-accent-hover h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="glass glow-accent-hover h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground mt-1">3 this week</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="glass glow-accent-hover h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Electives</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">Across 6 departments</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="h-full">
            <Card className="glass glow-accent-hover h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">Excellent</div>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                onClick={action.action}
                className="h-20 flex flex-col items-center justify-center gap-2 glow-accent-hover"
                asChild
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.label}</span>
                </motion.button>
              </Button>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <FormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Create New User"
      >
        <UserForm
          onSuccess={() => setIsUserModalOpen(false)}
          onCancel={() => setIsUserModalOpen(false)}
        />
      </FormModal>

      <FormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Create New Event"
      >
        <EventForm
          onSuccess={() => setIsEventModalOpen(false)}
          onCancel={() => setIsEventModalOpen(false)}
        />
      </FormModal>
    </DashboardLayout>
  );
}

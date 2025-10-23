import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { eventsService } from '@/services/eventService';
import { Badge } from '@/components/ui/badge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    try {
      const response = await eventsService.getMySaved();
      // Response has data directly
      const events = response?.data?.events || [];
      setSavedEvents(events.slice(0, 3)); // Show only 3 upcoming
    } catch (error) {
      console.error('Error loading saved events:', error);
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = 75; // TODO: Calculate based on filled fields

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass glow-primary border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                  <p className="text-muted-foreground">Here's what's happening with your campus today</p>
                </div>
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
                  <User className="h-12 w-12 text-primary" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass glow-accent-hover h-full cursor-pointer" onClick={() => navigate('/my-timetable')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5 Classes</div>
                <p className="text-xs text-muted-foreground mt-1">Next: Data Structures at 10:00 AM</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass glow-accent-hover h-full cursor-pointer" onClick={() => navigate('/saved-events')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Saved Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedEvents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {savedEvents.length > 0 ? savedEvents[0]?.title : 'No upcoming events'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass glow-accent-hover h-full cursor-pointer" onClick={() => navigate('/electives')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Elective Status</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">Submitted</div>
                <p className="text-xs text-muted-foreground mt-1">All preferences saved</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass glow-primary-hover h-full cursor-pointer" onClick={() => navigate('/profile')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profileCompletion}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <motion.div 
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Saved Events */}
        {savedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Upcoming Events</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/saved-events')}
                  className="hover:bg-accent/20"
                >
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => navigate('/events')}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {new Date(event.start_time).toLocaleDateString()}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/my-timetable')}
                className="p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors text-left"
              >
                <Calendar className="h-5 w-5 mb-2 text-accent" />
                <div className="font-semibold">View Timetable</div>
                <div className="text-xs text-muted-foreground">Check your weekly schedule</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/electives')}
                className="p-4 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors text-left"
              >
                <BookOpen className="h-5 w-5 mb-2 text-primary" />
                <div className="font-semibold">Manage Electives</div>
                <div className="text-xs text-muted-foreground">Update your preferences</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/events')}
                className="p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors text-left"
              >
                <Calendar className="h-5 w-5 mb-2 text-accent" />
                <div className="font-semibold">Browse Events</div>
                <div className="text-xs text-muted-foreground">Discover campus activities</div>
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

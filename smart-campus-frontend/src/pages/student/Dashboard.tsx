import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, Clock, User, CheckCircle2, ArrowRight, Coffee } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { eventsService } from '@/services/eventService';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { timetableService, Group } from '@/services/timetableService';
import { TimetableSlot } from '@/types';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return month >= 6 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
};

const getSemesterType = () => {
  const month = new Date().getMonth();
  return month >= 0 && month <= 5 ? 'even' : 'odd';
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<TimetableSlot[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [timetableLoading, setTimetableLoading] = useState(true);

  useEffect(() => {
    loadSavedEvents();
    loadTodaySchedule();
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
      setEventsLoading(false);
    }
  };

  const loadTodaySchedule = async () => {
    try {
      const response = await timetableService.getGroups({
        department: user?.department,
        semester: user?.semester ?? undefined,
      });
      const groups: Group[] = response?.data?.groups || [];
      const selectedGroup =
        groups.find((group) => (
          (!user?.department || group.department === user.department) &&
          (!user?.semester || group.semester === user.semester)
        )) || groups[0];

      if (!selectedGroup) {
        setTodayClasses([]);
        return;
      }

      const timetableResponse = await timetableService.getGroupTimetable(
        selectedGroup.id,
        getAcademicYear(),
        getSemesterType()
      );
      const slots: TimetableSlot[] = timetableResponse?.data?.slots || [];
      const today = DAYS[new Date().getDay()];

      setTodayClasses(
        slots
          .filter((slot) => slot.day_of_week === today)
          .sort((a, b) => a.period_number - b.period_number)
      );
    } catch (error) {
      console.error('Error loading today schedule:', error);
      setTodayClasses([]);
    } finally {
      setTimetableLoading(false);
    }
  };

  const dashboardLoading = eventsLoading || timetableLoading;
  const hasEmptyDay = !dashboardLoading && savedEvents.length === 0 && todayClasses.length === 0;
  const calculateProfileCompletion = () => {
    if (!user) return 0;

    const completionChecks: boolean[] = [
      Boolean(user.full_name?.trim()),
      Boolean(user.email?.trim()),
      Boolean(user.department?.trim())
    ];

    if (user.role === 'student') {
      completionChecks.push(user.cgpa !== null && user.cgpa !== undefined);
      completionChecks.push(user.semester !== null && user.semester !== undefined);
    }

    const completedFields = completionChecks.filter(Boolean).length;
    return Math.round((completedFields / completionChecks.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const renderStatCardSkeleton = () => (
    <Card className="glass border-muted">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-3" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  const renderEventsSectionSkeleton = () => (
    <Card className="glass border-muted">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={`event-skeleton-${i}`} className="flex items-center justify-between p-4 rounded-lg bg-accent/10">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
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
          {dashboardLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={`stat-skeleton-${i}`} className="h-full">
                  {renderStatCardSkeleton()}
                </div>
              ))}
            </>
          ) : (
            <>
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
                    <div className="text-2xl font-bold">
                      {todayClasses.length === 0 ? 'No Classes' : `${todayClasses.length} Classes`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {todayClasses.length > 0
                        ? `Next: ${todayClasses[0]?.subject?.subject_name} in ${todayClasses[0]?.room?.room_code}`
                        : 'No classes today. Enjoy a slower day on campus.'}
                    </p>
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
            </>
          )}
        </div>

        {hasEmptyDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="glass overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background to-emerald-500/10">
              <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-4 rounded-full border border-amber-500/20 bg-amber-500/15 p-4">
                  <Coffee className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">No classes today!</h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  Your schedule is clear and there are no upcoming saved events right now. Go enjoy a coffee on campus
                  and check back later for fresh updates.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Saved Events */}
            {eventsLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {renderEventsSectionSkeleton()}
              </motion.div>
            ) : savedEvents.length > 0 ? (
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
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="glass border-dashed border-muted">
                  <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-4 rounded-full bg-accent/10 p-4">
                      <Coffee className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">No upcoming events</h3>
                    <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                      Your saved events list is empty for now. Explore campus activities and bookmark something fun for later.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-5"
                      onClick={() => navigate('/events')}
                    >
                      Browse Events <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ActivityFeed />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

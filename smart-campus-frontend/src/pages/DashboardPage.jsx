import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Bell,
  Clock,
  Star,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  pageTransition,
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "../utils/animations";
import Button from "../components/ui/Button";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import useAuthStore from "../hooks/useAuthStore";
import StatsCard from "../components/dashboard/StatsCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import QuickActions from "../components/dashboard/QuickActions";

/**
 * DashboardPage Component - Phase 2
 * User dashboard with quick stats, upcoming events, and quick actions
 * Shows personalized content after login
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const stats = [
    {
      icon: Calendar,
      label: "Saved Events",
      value: "12",
      color: "text-purple-500",
      bg: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      label: "Electives",
      value: "3",
      color: "text-blue-500",
      bg: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      label: "This Week",
      value: "5",
      color: "text-teal-500",
      bg: "from-teal-500 to-green-500",
    },
    {
      icon: Award,
      label: "Achievements",
      value: "8",
      color: "text-orange-500",
      bg: "from-orange-500 to-red-500",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Workshop: React Advanced Patterns",
      time: "Today, 2:00 PM",
      location: "Engineering Hall, Room 201",
      type: "Workshop",
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Campus Fest 2025 - Registration Open",
      time: "Tomorrow, 10:00 AM",
      location: "Main Auditorium",
      type: "Event",
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Career Fair: Meet Top Recruiters",
      time: "Oct 15, 9:00 AM",
      location: "Sports Complex",
      type: "Career",
      color: "bg-green-500",
    },
  ];

  const quickActions = [
    {
      icon: Calendar,
      label: "Browse Events",
      description: "Discover campus activities",
      action: () => navigate("/events"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      label: "Select Electives",
      description: "Choose your courses",
      action: () => navigate("/electives"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      label: "View Timetable",
      description: "Check your schedule",
      action: () => navigate("/timetable"),
      gradient: "from-teal-500 to-green-500",
    },
  ];

  const recentActivity = [
    {
      action: "Saved event",
      title: "Tech Workshop",
      time: "2 hours ago",
      icon: Star,
    },
    {
      action: "Updated profile",
      title: "Profile information",
      time: "1 day ago",
      icon: Users,
    },
    {
      action: "Registered for",
      title: "Campus Fest 2025",
      time: "3 days ago",
      icon: Calendar,
    },
  ];

  return (
    <motion.div
      className="min-h-screen py-8 px-4 md:px-8 lg:px-12"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Welcome back,{" "}
                <span className="gradient-text">{user?.name || "Student"}</span>
                ! 👋
              </h1>
              <p className="text-text-secondary dark:text-text-secondary-dark text-lg">
                Here's what's happening with your campus life today
              </p>
            </div>
            <Button
              variant="outline"
              leftIcon={<Bell size={20} />}
              onClick={() => navigate("/notifications")}
            >
              Notifications
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                3
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <StatsCard
            title="Saved Events"
            value={12}
            icon={Calendar}
            iconColor="bg-primary"
            change={25}
            isIncrease={true}
          />
          <StatsCard
            title="Electives Selected"
            value={3}
            icon={BookOpen}
            iconColor="bg-accent"
            change={50}
            isIncrease={true}
          />
          <StatsCard
            title="Classes This Week"
            value={24}
            icon={Clock}
            iconColor="bg-blue-500"
            change={-5}
            isIncrease={false}
          />
          <StatsCard
            title="Achievements"
            value={8}
            icon={Award}
            iconColor="bg-orange-500"
            change={33}
            isIncrease={true}
          />
        </motion.div>

        {/* Dashboard Widgets - New */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Feed - Takes 1 column */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <ActivityFeed />
          </motion.div>

          {/* Quick Actions - Takes 2 columns */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <QuickActions columns={4} />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upcoming Events & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Upcoming Events</h2>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                      Don't miss out on these activities
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/events")}
                    rightIcon={<ArrowRight size={16} />}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardBody className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark transition-colors cursor-pointer"
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg ${event.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-text-secondary-dark">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {event.time}
                          </span>
                          <span>📍 {event.location}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {event.type}
                      </span>
                    </motion.div>
                  ))}
                </CardBody>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp}>
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      hover
                      className="h-full cursor-pointer group"
                      onClick={action.action}
                    >
                      <CardBody>
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} p-3 mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <action.icon className="w-full h-full text-white" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">
                          {action.label}
                        </h3>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                          {action.description}
                        </p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Recent Activity & Performance */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                    Your latest actions
                  </p>
                </CardHeader>
                <CardBody className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="text-text-secondary dark:text-text-secondary-dark">
                            {activity.action}
                          </span>{" "}
                          <span className="font-semibold">
                            {activity.title}
                          </span>
                        </p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </motion.div>

            {/* Performance Card */}
            <motion.div variants={fadeInUp}>
              <Card glass className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                <CardBody className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent p-2.5">
                      <TrendingUp className="w-full h-full text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">98%</h3>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        Engagement Score
                      </p>
                    </div>
                  </div>
                  <p className="text-sm mb-4">
                    You're doing great! You're more active than 85% of students
                    on campus.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Insights
                  </Button>
                </CardBody>
              </Card>
            </motion.div>

            {/* Tips Card */}
            <motion.div variants={fadeInUp}>
              <Card className="border-2 border-accent/30">
                <CardBody>
                  <div className="flex items-start gap-3">
                    <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold mb-2">Pro Tip</h3>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        Enable notifications to never miss important campus
                        events and deadlines!
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 px-0"
                        rightIcon={<ArrowRight size={14} />}
                      >
                        Enable Now
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

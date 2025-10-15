import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  BookOpenIcon,
  UserGroupIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

/**
 * ActivityFeed Component
 *
 * Displays recent user activities with icons, timestamps, and descriptions
 * Features auto-update, smooth animations, and empty state
 */

const iconMap = {
  event: CalendarIcon,
  elective: BookOpenIcon,
  club: UserGroupIcon,
  notification: BellIcon,
  timetable: ClockIcon,
  completed: CheckCircleIcon,
};

const ActivityItem = ({ activity, index }) => {
  const Icon = iconMap[activity.type] || BellIcon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-3 p-3 rounded-lg hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark transition-colors duration-200"
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          activity.type === "completed"
            ? "bg-success/20"
            : activity.type === "event"
            ? "bg-primary/20"
            : activity.type === "elective"
            ? "bg-accent/20"
            : "bg-info/20"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${
            activity.type === "completed"
              ? "text-success"
              : activity.type === "event"
              ? "text-primary"
              : activity.type === "elective"
              ? "text-accent"
              : "text-info"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-text dark:text-text-dark font-medium">
          {activity.title}
        </p>
        {activity.description && (
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
            {activity.description}
          </p>
        )}
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
          {activity.timestamp}
        </p>
      </div>
    </motion.div>
  );
};

const ActivityFeed = ({ activities = [], maxItems = 5, showHeader = true }) => {
  // Default sample data if no activities provided
  const defaultActivities = [
    {
      id: 1,
      type: "completed",
      title: "Completed Physics Lab Assignment",
      description: "Submitted on time",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "event",
      title: "Registered for Tech Fest 2025",
      description: "Event starts tomorrow",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      type: "elective",
      title: "Selected Machine Learning Elective",
      description: "Seat confirmed",
      timestamp: "1 day ago",
    },
    {
      id: 4,
      type: "timetable",
      title: "Timetable Updated",
      description: "New class schedule available",
      timestamp: "2 days ago",
    },
    {
      id: 5,
      type: "club",
      title: "Joined Coding Club",
      description: "Welcome to the community!",
      timestamp: "3 days ago",
    },
  ];

  const displayActivities =
    activities.length > 0 ? activities : defaultActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  return (
    <div className="glass-strong rounded-2xl p-6 h-full flex flex-col">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text dark:text-text-dark">
            Recent Activity
          </h3>
          <button className="text-sm text-primary hover:text-primary-light transition-colors">
            View All
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {limitedActivities.length > 0 ? (
            limitedActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <BellIcon className="w-12 h-12 text-text-secondary dark:text-text-secondary-dark opacity-50 mb-3" />
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                No recent activity
              </p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
                Your activities will appear here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
            Live updates enabled
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;

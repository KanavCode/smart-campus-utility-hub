import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BellAlertIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

/**
 * QuickActions Component
 *
 * Grid of quick action buttons for common tasks
 * Features hover effects, icons, and navigation
 */

const quickActionsList = [
  {
    id: 1,
    label: "View Timetable",
    icon: ClockIcon,
    color: "bg-primary",
    hoverColor: "hover:bg-primary-light",
    path: "/timetable",
  },
  {
    id: 2,
    label: "Browse Events",
    icon: CalendarIcon,
    color: "bg-accent",
    hoverColor: "hover:bg-accent-light",
    path: "/events",
  },
  {
    id: 3,
    label: "Select Electives",
    icon: BookOpenIcon,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    path: "/electives",
  },
  {
    id: 4,
    label: "Join Clubs",
    icon: UserGroupIcon,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    path: "/clubs",
  },
  {
    id: 5,
    label: "Academic Progress",
    icon: ChartBarIcon,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    path: "/progress",
  },
  {
    id: 6,
    label: "Notifications",
    icon: BellAlertIcon,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    path: "/notifications",
  },
  {
    id: 7,
    label: "Resources",
    icon: AcademicCapIcon,
    color: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    path: "/resources",
  },
  {
    id: 8,
    label: "Settings",
    icon: Cog6ToothIcon,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    path: "/settings",
  },
];

const QuickActionButton = ({ action, index }) => {
  const navigate = useNavigate();
  const Icon = action.icon;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(action.path)}
      className="glass p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 group"
    >
      <div
        className={`${action.color} ${action.hoverColor} p-3 rounded-lg transition-colors duration-200`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm font-medium text-text dark:text-text-dark text-center group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
        {action.label}
      </span>
    </motion.button>
  );
};

const QuickActions = ({
  actions = quickActionsList,
  columns = 4,
  showHeader = true,
}) => {
  return (
    <div className="glass-strong rounded-2xl p-6">
      {showHeader && (
        <h3 className="text-lg font-bold text-text dark:text-text-dark mb-6">
          Quick Actions
        </h3>
      )}

      <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-4`}>
        {actions.map((action, index) => (
          <QuickActionButton key={action.id} action={action} index={index} />
        ))}
      </div>

      {/* Optional: Add Custom Action Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full mt-4 p-3 border-2 border-dashed border-border dark:border-border-dark rounded-lg hover:border-primary dark:hover:border-primary-light transition-colors duration-200 text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-light text-sm font-medium"
      >
        + Customize Actions
      </motion.button>
    </div>
  );
};

export default QuickActions;

import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  CalendarRange, 
  Settings,
  FileText,
  Clock,
  UserCircle,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const studentLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'My Timetable', path: '/my-timetable' },
    { icon: CalendarRange, label: 'Events', path: '/events' },
    { icon: Bookmark, label: 'Saved Events', path: '/saved-events' },
    { icon: BookOpen, label: 'Elective Choices', path: '/electives' },
    { icon: UserCircle, label: 'My Profile', path: '/profile' },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CalendarRange, label: 'Events', path: '/admin/events' },
    { icon: BookOpen, label: 'Electives', path: '/admin/electives' },
    { icon: Clock, label: 'Timetable', path: '/admin/timetable' },
    { icon: FileText, label: 'Subjects', path: '/admin/subjects' },
    { icon: UserCircle, label: 'My Profile', path: '/admin/profile' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-20 hover:w-64 transition-all duration-300 glass border-r border-border/50 group z-40"
    >
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
              "hover:bg-accent/50 glow-accent-hover",
              isActive && "bg-accent text-accent-foreground glow-accent"
            )}
          >
            {({ isActive }) => (
              <motion.div 
                className="flex items-center gap-3 w-full"
                whileHover={{ x: 2 }}
              >
                <link.icon className="h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  {link.label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
} from 'lucide-react';

import { slideInLeft, fadeIn } from '../../lib/animations';

/**
 * Sidebar Component
 * 
 * Collapsible sidebar navigation with:
 * - Active link highlighting
 * - Smooth collapse/expand animations
 * - Icon-only collapsed state
 * - Tooltips on hover (collapsed state)
 * - Organized navigation sections
 */

const navigationSections = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Timetable', path: '/timetable', icon: BookOpen },
      { name: 'Electives', path: '/electives', icon: Users },
    ],
  },
  {
    title: 'Personal',
    items: [
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
  {
    title: 'Support',
    items: [
      { name: 'Help Center', path: '/help', icon: HelpCircle },
    ],
  },
];

export const Sidebar = ({ className = '' }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.aside
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      className={`fixed left-0 top-16 bottom-0 glass-card border-r border-border-primary transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle Button */}
        <div className="flex items-center justify-end p-4 border-b border-border-primary">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              {/* Section Title */}
              {!isCollapsed && (
                <h3 className="px-6 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  {section.title}
                </h3>
              )}

              {/* Section Items */}
              <div className="space-y-1 px-3">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.path}
                      className="relative"
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link to={item.path}>
                        <motion.div
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActive
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                              : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                          }`}
                        >
                          {/* Icon */}
                          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />

                          {/* Label */}
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-medium whitespace-nowrap overflow-hidden"
                              >
                                {item.name}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.div>
                      </Link>

                      {/* Tooltip for Collapsed State */}
                      {isCollapsed && hoveredItem === item.name && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-bg-primary border border-border-primary rounded-lg shadow-lg whitespace-nowrap z-50"
                        >
                          <span className="text-sm font-medium text-text-primary">
                            {item.name}
                          </span>
                          {/* Arrow */}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-bg-primary" />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section Divider */}
              {sectionIndex < navigationSections.length - 1 && (
                <div className="mx-6 my-4 border-t border-border-primary" />
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section - User Stats or Quick Actions */}
        <div className="p-4 border-t border-border-primary">
          {!isCollapsed ? (
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Premium User</p>
                  <p className="text-xs text-text-tertiary">All features unlocked</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-accent-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-medium">Level 5 Scholar</span>
              </div>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

/**
 * Route configuration with permission metadata
 * Central source of truth for route access control
 */

import { PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types';

export interface RouteMetadata {
  path: string;
  label: string;
  icon?: string;
  requiredPermissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][];
  requiredAnyPermissions?: typeof PERMISSIONS[keyof typeof PERMISSIONS][];
  allowedRoles: UserRole[];
  isPublic?: boolean;
  showInNavigation?: boolean;
  component?: string;
  children?: RouteMetadata[];
}

/**
 * Student routes with permission metadata
 */
export const STUDENT_ROUTES: RouteMetadata[] = [
  {
    path: '/student/dashboard',
    label: 'Dashboard',
    icon: 'LayoutGrid',
    requiredPermissions: [PERMISSIONS.VIEW_STUDENT_DASHBOARD],
    allowedRoles: ['student', 'admin'],
    showInNavigation: true,
    component: 'StudentDashboard',
  },
  {
    path: '/student/my-timetable',
    label: 'My Timetable',
    icon: 'Calendar',
    requiredPermissions: [PERMISSIONS.VIEW_TIMETABLE],
    allowedRoles: ['student', 'admin'],
    showInNavigation: true,
    component: 'Timetable',
  },
  {
    path: '/student/events',
    label: 'Events',
    icon: 'Calendar',
    requiredPermissions: [PERMISSIONS.VIEW_EVENTS],
    allowedRoles: ['student', 'admin'],
    showInNavigation: true,
    component: 'EventsPage',
  },
  {
    path: '/student/electives',
    label: 'Electives',
    icon: 'BookOpen',
    requiredPermissions: [PERMISSIONS.VIEW_ELECTIVES],
    allowedRoles: ['student', 'admin'],
    showInNavigation: true,
    component: 'Electives',
  },
  {
    path: '/student/clubs',
    label: 'Clubs',
    icon: 'Users',
    requiredPermissions: [PERMISSIONS.VIEW_CLUBS],
    allowedRoles: ['student', 'admin'],
    showInNavigation: true,
    component: 'StudentClubs',
  },
  {
    path: '/student/saved-events',
    label: 'Saved Events',
    icon: 'Heart',
    requiredPermissions: [PERMISSIONS.SAVE_EVENT],
    allowedRoles: ['student', 'admin'],
    showInNavigation: true,
    component: 'SavedEvents',
  },
  {
    path: '/student/profile',
    label: 'Profile',
    icon: 'User',
    requiredPermissions: [PERMISSIONS.VIEW_PROFILE],
    allowedRoles: ['student', 'admin'],
    showInNavigation: true,
    component: 'StudentProfile',
  },
];

/**
 * Admin routes with permission metadata
 */
export const ADMIN_ROUTES: RouteMetadata[] = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'LayoutGrid',
    requiredPermissions: [PERMISSIONS.VIEW_ADMIN_DASHBOARD],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'AdminDashboard',
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: 'Users',
    requiredPermissions: [PERMISSIONS.VIEW_USERS],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'Users',
  },
  {
    path: '/admin/events',
    label: 'Events',
    icon: 'Calendar',
    requiredPermissions: [PERMISSIONS.VIEW_ADMIN_EVENTS],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'Events',
  },
  {
    path: '/admin/electives',
    label: 'Electives',
    icon: 'BookOpen',
    requiredPermissions: [PERMISSIONS.VIEW_ADMIN_ELECTIVES],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'AdminElectives',
  },
  {
    path: '/admin/timetable',
    label: 'Timetable',
    icon: 'Calendar',
    requiredPermissions: [PERMISSIONS.VIEW_TIMETABLE_MANAGEMENT],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'TimetableManagement',
  },
  {
    path: '/admin/subjects',
    label: 'Subjects',
    icon: 'BookOpen',
    requiredPermissions: [PERMISSIONS.VIEW_SUBJECTS],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'Subjects',
  },
  {
    path: '/admin/clubs',
    label: 'Clubs',
    icon: 'Users',
    requiredPermissions: [PERMISSIONS.VIEW_ADMIN_CLUBS],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'Clubs',
  },
  {
    path: '/admin/teachers',
    label: 'Teachers',
    icon: 'Users',
    requiredPermissions: [PERMISSIONS.VIEW_TEACHERS],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'Teachers',
  },
  {
    path: '/admin/rooms',
    label: 'Rooms',
    icon: 'Home',
    requiredPermissions: [PERMISSIONS.VIEW_ROOMS],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'Rooms',
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: 'Settings',
    requiredPermissions: [PERMISSIONS.VIEW_SETTINGS],
    allowedRoles: ['admin'],
    showInNavigation: true,
    component: 'Settings',
  },
  {
    path: '/admin/profile',
    label: 'Profile',
    icon: 'User',
    requiredPermissions: [PERMISSIONS.VIEW_ADMIN_DASHBOARD],
    allowedRoles: ['admin'],
    showInNavigation: false,
    component: 'AdminProfile',
  },
];

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES: RouteMetadata[] = [
  {
    path: '/',
    label: 'Home',
    requiredPermissions: [],
    allowedRoles: ['student', 'admin', 'faculty'],
    isPublic: true,
    component: 'Landing',
  },
  {
    path: '/auth',
    label: 'Authentication',
    requiredPermissions: [],
    allowedRoles: ['student', 'admin', 'faculty'],
    isPublic: true,
    component: 'Auth',
  },
  {
    path: '/unauthorized',
    label: 'Unauthorized',
    requiredPermissions: [],
    allowedRoles: ['student', 'admin', 'faculty'],
    isPublic: true,
    component: 'Unauthorized',
  },
  {
    path: '*',
    label: 'Not Found',
    requiredPermissions: [],
    allowedRoles: ['student', 'admin', 'faculty'],
    isPublic: true,
    component: 'NotFound',
  },
];

/**
 * All protected routes
 */
export const PROTECTED_ROUTES: RouteMetadata[] = [...STUDENT_ROUTES, ...ADMIN_ROUTES];

/**
 * All routes
 */
export const ALL_ROUTES: RouteMetadata[] = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES];

/**
 * Find route metadata by path
 */
export const findRouteByPath = (path: string): RouteMetadata | undefined => {
  return ALL_ROUTES.find(route => route.path === path);
};

/**
 * Get navigation routes for a specific role
 */
export const getNavigationRoutes = (userRole: UserRole): RouteMetadata[] => {
  return ALL_ROUTES.filter(
    route =>
      route.showInNavigation &&
      route.allowedRoles.includes(userRole)
  );
};

/**
 * Get all routes accessible by a specific role
 */
export const getAccessibleRoutes = (userRole: UserRole): RouteMetadata[] => {
  return PROTECTED_ROUTES.filter(route => route.allowedRoles.includes(userRole));
};

/**
 * Check if route has public access
 */
export const isPublicRoute = (path: string): boolean => {
  const route = findRouteByPath(path);
  return route?.isPublic === true;
};

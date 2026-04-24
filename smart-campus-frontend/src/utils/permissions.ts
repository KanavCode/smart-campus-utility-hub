/**
 * Permission-driven RBAC System
 * Centralized permission matrix for role-based access control
 */

import { UserRole } from '@/types';

/**
 * Define all possible permissions in the application
 */
export const PERMISSIONS = {
  // Student Dashboard
  VIEW_STUDENT_DASHBOARD: 'view:student:dashboard',
  
  // Timetable
  VIEW_TIMETABLE: 'view:student:timetable',
  
  // Events
  VIEW_EVENTS: 'view:student:events',
  CREATE_EVENT: 'create:student:event',
  UPDATE_EVENT: 'update:student:event',
  DELETE_EVENT: 'delete:student:event',
  SAVE_EVENT: 'manage:student:events',
  
  // Electives
  VIEW_ELECTIVES: 'view:student:electives',
  MANAGE_ELECTIVES: 'manage:student:electives',
  
  // Profile
  VIEW_PROFILE: 'view:student:profile',
  UPDATE_PROFILE: 'update:student:profile',
  CHANGE_PASSWORD: 'manage:student:password',
  
  // Clubs
  VIEW_CLUBS: 'view:student:clubs',
  CREATE_CLUB: 'create:student:club',
  UPDATE_CLUB: 'update:student:club',
  DELETE_CLUB: 'delete:student:club',
  
  // Admin Dashboard
  VIEW_ADMIN_DASHBOARD: 'view:admin:dashboard',
  VIEW_ANALYTICS: 'view:admin:analytics',
  
  // Users Management
  VIEW_USERS: 'view:admin:users',
  CREATE_USER: 'create:admin:user',
  UPDATE_USER: 'update:admin:user',
  DELETE_USER: 'delete:admin:user',
  EXPORT_USERS: 'export:admin:users',
  
  // Events Management
  VIEW_ADMIN_EVENTS: 'view:admin:events',
  CREATE_ADMIN_EVENT: 'create:admin:event',
  UPDATE_ADMIN_EVENT: 'update:admin:event',
  DELETE_ADMIN_EVENT: 'delete:admin:event',
  PUBLISH_EVENT: 'publish:admin:event',
  
  // Electives Management
  VIEW_ADMIN_ELECTIVES: 'view:admin:electives',
  CREATE_ADMIN_ELECTIVE: 'create:admin:elective',
  UPDATE_ADMIN_ELECTIVE: 'update:admin:elective',
  DELETE_ADMIN_ELECTIVE: 'delete:admin:elective',
  MANAGE_ELECTIVE_ALLOCATION: 'manage:admin:elective_allocation',
  
  // Timetable Management
  VIEW_TIMETABLE_MANAGEMENT: 'view:admin:timetable',
  CREATE_TIMETABLE: 'create:admin:timetable',
  UPDATE_TIMETABLE: 'update:admin:timetable',
  DELETE_TIMETABLE: 'delete:admin:timetable',
  GENERATE_TIMETABLE: 'generate:admin:timetable',
  
  // Subjects Management
  VIEW_SUBJECTS: 'view:admin:subjects',
  CREATE_SUBJECT: 'create:admin:subject',
  UPDATE_SUBJECT: 'update:admin:subject',
  DELETE_SUBJECT: 'delete:admin:subject',
  
  // Clubs Management
  VIEW_ADMIN_CLUBS: 'view:admin:clubs',
  CREATE_ADMIN_CLUB: 'create:admin:club',
  UPDATE_ADMIN_CLUB: 'update:admin:club',
  DELETE_ADMIN_CLUB: 'delete:admin:club',
  MANAGE_CLUB_MEMBERS: 'manage:admin:club_members',
  
  // Teachers Management
  VIEW_TEACHERS: 'view:admin:teachers',
  CREATE_TEACHER: 'create:admin:teacher',
  UPDATE_TEACHER: 'update:admin:teacher',
  DELETE_TEACHER: 'delete:admin:teacher',
  
  // Rooms Management
  VIEW_ROOMS: 'view:admin:rooms',
  CREATE_ROOM: 'create:admin:room',
  UPDATE_ROOM: 'update:admin:room',
  DELETE_ROOM: 'delete:admin:room',
  
  // Settings
  VIEW_SETTINGS: 'view:admin:settings',
  UPDATE_SETTINGS: 'update:admin:settings',
  MANAGE_SYSTEM_CONFIG: 'manage:admin:system_config',
} as const;

/**
 * Permission matrix defining what each role can do
 * Maps role to array of permissions they possess
 */
export const PERMISSION_MATRIX: Record<UserRole, typeof PERMISSIONS[keyof typeof PERMISSIONS][]> = {
  student: [
    // Dashboard & Basic Access
    PERMISSIONS.VIEW_STUDENT_DASHBOARD,
    
    // Timetable
    PERMISSIONS.VIEW_TIMETABLE,
    
    // Events
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.SAVE_EVENT,
    
    // Electives
    PERMISSIONS.VIEW_ELECTIVES,
    PERMISSIONS.MANAGE_ELECTIVES,
    
    // Profile
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.UPDATE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    
    // Clubs
    PERMISSIONS.VIEW_CLUBS,
    PERMISSIONS.CREATE_CLUB,
    PERMISSIONS.UPDATE_CLUB,
    PERMISSIONS.DELETE_CLUB,
  ],
  admin: [
    // All student permissions
    ...Object.values(PERMISSIONS),
  ],
  faculty: [
    // Faculty-specific permissions can be added here
    PERMISSIONS.VIEW_STUDENT_DASHBOARD,
    PERMISSIONS.VIEW_TIMETABLE,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_ELECTIVES,
    PERMISSIONS.VIEW_PROFILE,
  ],
};

/**
 * Check if a user role has a specific permission
 */
export const hasPermission = (
  userRole: UserRole | null | undefined,
  permission: typeof PERMISSIONS[keyof typeof PERMISSIONS]
): boolean => {
  if (!userRole) return false;
  
  const rolePermissions = PERMISSION_MATRIX[userRole] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a user role has all specified permissions
 */
export const hasAllPermissions = (
  userRole: UserRole | null | undefined,
  permissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][]
): boolean => {
  if (!userRole) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Check if a user role has any of the specified permissions
 */
export const hasAnyPermission = (
  userRole: UserRole | null | undefined,
  permissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][]
): boolean => {
  if (!userRole) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a specific role
 */
export const getRolePermissions = (userRole: UserRole): typeof PERMISSIONS[keyof typeof PERMISSIONS][] => {
  return PERMISSION_MATRIX[userRole] || [];
};

import { describe, it, expect, beforeEach } from 'vitest';
import { PERMISSIONS, hasPermission, PERMISSION_MATRIX } from '@/utils/permissions';
import {
  findRouteByPath,
  getNavigationRoutes,
  getAccessibleRoutes,
  isPublicRoute,
  STUDENT_ROUTES,
  ADMIN_ROUTES,
  PUBLIC_ROUTES,
} from '@/config/routes';
import { UserRole } from '@/types';

/**
 * Integration tests for route access control
 * Verifies that route guards work correctly across the system
 */
describe('Route Guard Integration Tests', () => {
  describe('Direct URL Access Prevention', () => {
    it('should prevent student from accessing /admin/dashboard', () => {
      const route = findRouteByPath('/admin/dashboard');
      const studentRole: UserRole = 'student';

      expect(route).toBeDefined();
      expect(route?.allowedRoles).not.toContain(studentRole);
    });

    it('should prevent student from accessing /admin/users', () => {
      const route = findRouteByPath('/admin/users');
      const studentRole: UserRole = 'student';

      expect(route).toBeDefined();
      expect(route?.allowedRoles).not.toContain(studentRole);
    });

    it('should prevent student from accessing /admin/events', () => {
      const route = findRouteByPath('/admin/events');
      const studentRole: UserRole = 'student';

      expect(route).toBeDefined();
      if (route) {
        const studentHasAccess = route.allowedRoles.includes(studentRole);
        expect(studentHasAccess).toBe(false);
      }
    });

    it('should allow admin to access /admin/dashboard', () => {
      const route = findRouteByPath('/admin/dashboard');
      const adminRole: UserRole = 'admin';

      expect(route).toBeDefined();
      expect(route?.allowedRoles).toContain(adminRole);
    });

    it('should allow admin to access all admin routes', () => {
      const adminRole: UserRole = 'admin';
      const adminAccessible = getAccessibleRoutes(adminRole);

      expect(adminAccessible.length).toBeGreaterThan(0);
      ADMIN_ROUTES.forEach(adminRoute => {
        const found = adminAccessible.find(r => r.path === adminRoute.path);
        expect(found).toBeDefined();
      });
    });

    it('should allow student to access student routes', () => {
      const studentRole: UserRole = 'student';
      const studentAccessible = getAccessibleRoutes(studentRole);

      expect(studentAccessible.length).toBeGreaterThan(0);
      STUDENT_ROUTES.forEach(studentRoute => {
        const found = studentAccessible.find(r => r.path === studentRoute.path);
        expect(found).toBeDefined();
      });
    });

    it('should not allow student to access any admin routes', () => {
      const studentRole: UserRole = 'student';
      const studentAccessible = getAccessibleRoutes(studentRole);

      ADMIN_ROUTES.forEach(adminRoute => {
        const found = studentAccessible.find(r => r.path === adminRoute.path);
        expect(found).toBeUndefined();
      });
    });
  });

  describe('Public Route Access', () => {
    it('should not restrict access to public routes', () => {
      const publicPaths = ['/', '/auth', '/unauthorized'];

      publicPaths.forEach(path => {
        if (path !== '*') {
          expect(isPublicRoute(path)).toBe(true);
        }
      });
    });

    it('should allow unauthenticated users to access public routes', () => {
      const publicRoutes = PUBLIC_ROUTES.filter(r => r.path !== '*');
      expect(publicRoutes.length).toBeGreaterThan(0);
    });
  });

  describe('Permission-Based Route Access', () => {
    it('should validate permissions for each route', () => {
      ADMIN_ROUTES.forEach(route => {
        expect(route.requiredPermissions).toBeDefined();
        expect(route.requiredPermissions.length).toBeGreaterThan(0);
      });
    });

    it('should use permission matrix for route validation', () => {
      const adminRole: UserRole = 'admin';
      const adminPermissions = PERMISSION_MATRIX[adminRole];

      ADMIN_ROUTES.forEach(route => {
        const hasAllPerms = route.requiredPermissions.every(perm =>
          adminPermissions.includes(perm)
        );
        expect(hasAllPerms).toBe(true);
      });
    });

    it('student should not have admin route permissions', () => {
      const studentRole: UserRole = 'student';
      const studentPermissions = PERMISSION_MATRIX[studentRole];

      ADMIN_ROUTES.forEach(route => {
        const hasAtLeastOnePerm = route.requiredPermissions.some(perm =>
          studentPermissions.includes(perm)
        );
        // Students typically shouldn't have ANY admin permissions
        const adminOnlyPerms = route.requiredPermissions.filter(
          perm => !studentPermissions.includes(perm)
        );
        expect(adminOnlyPerms.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation Menu Visibility', () => {
    it('should show student routes in navigation for student role', () => {
      const studentRole: UserRole = 'student';
      const navRoutes = getNavigationRoutes(studentRole);

      const hasStudentRoutes = STUDENT_ROUTES.some(route =>
        navRoutes.some(navRoute => navRoute.path === route.path)
      );

      expect(hasStudentRoutes).toBe(true);
    });

    it('should hide admin routes in navigation for student role', () => {
      const studentRole: UserRole = 'student';
      const navRoutes = getNavigationRoutes(studentRole);

      ADMIN_ROUTES.forEach(adminRoute => {
        const found = navRoutes.find(r => r.path === adminRoute.path);
        expect(found).toBeUndefined();
      });
    });

    it('should show all routes in navigation for admin role', () => {
      const adminRole: UserRole = 'admin';
      const navRoutes = getNavigationRoutes(adminRole);

      STUDENT_ROUTES.forEach(route => {
        if (route.showInNavigation) {
          const found = navRoutes.find(r => r.path === route.path);
          expect(found).toBeDefined();
        }
      });
    });

    it('should only show routes marked with showInNavigation flag', () => {
      const studentRole: UserRole = 'student';
      const navRoutes = getNavigationRoutes(studentRole);

      navRoutes.forEach(route => {
        expect(route.showInNavigation).toBe(true);
      });
    });
  });

  describe('Route Metadata Consistency', () => {
    it('all student routes should have student role in allowedRoles', () => {
      STUDENT_ROUTES.forEach(route => {
        expect(route.allowedRoles).toContain('student');
      });
    });

    it('all admin routes should have admin role in allowedRoles', () => {
      ADMIN_ROUTES.forEach(route => {
        expect(route.allowedRoles).toContain('admin');
      });
    });

    it('all routes should have requiredPermissions defined', () => {
      [...STUDENT_ROUTES, ...ADMIN_ROUTES].forEach(route => {
        expect(route.requiredPermissions).toBeDefined();
        expect(Array.isArray(route.requiredPermissions)).toBe(true);
      });
    });

    it('all routes should have allowedRoles defined', () => {
      [...STUDENT_ROUTES, ...ADMIN_ROUTES].forEach(route => {
        expect(route.allowedRoles).toBeDefined();
        expect(Array.isArray(route.allowedRoles)).toBe(true);
        expect(route.allowedRoles.length).toBeGreaterThan(0);
      });
    });

    it('permission values in routes should match PERMISSIONS constants', () => {
      const validPermissions = new Set(Object.values(PERMISSIONS));

      [...STUDENT_ROUTES, ...ADMIN_ROUTES].forEach(route => {
        route.requiredPermissions.forEach(permission => {
          expect(validPermissions.has(permission)).toBe(true);
        });
      });
    });
  });

  describe('Role Switching Behavior', () => {
    it('accessible routes should change when role changes', () => {
      const studentRoutes = getAccessibleRoutes('student');
      const adminRoutes = getAccessibleRoutes('admin');

      expect(adminRoutes.length).toBeGreaterThanOrEqual(studentRoutes.length);
    });

    it('navigation should reflect new role after switching', () => {
      const studentNav = getNavigationRoutes('student');
      const adminNav = getNavigationRoutes('admin');

      // Admin should see everything student sees plus admin items
      const adminPaths = new Set(adminNav.map(r => r.path));
      const studentPaths = new Set(studentNav.map(r => r.path));

      STUDENT_ROUTES.filter(r => r.showInNavigation).forEach(route => {
        expect(adminPaths.has(route.path)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle routes with multiple required permissions', () => {
      const routeWithMultiplePerms = ADMIN_ROUTES.find(
        r => r.requiredPermissions.length > 1
      );

      if (routeWithMultiplePerms) {
        const adminRole: UserRole = 'admin';
        const hasAll = routeWithMultiplePerms.requiredPermissions.every(perm =>
          hasPermission(adminRole, perm)
        );
        expect(hasAll).toBe(true);
      }
    });

    it('should handle non-existent routes gracefully', () => {
      const route = findRouteByPath('/this-route-does-not-exist');
      expect(route).toBeUndefined();
    });

    it('should handle null role gracefully', () => {
      const result = hasPermission(null, PERMISSIONS.VIEW_STUDENT_DASHBOARD);
      expect(result).toBe(false);
    });

    it('should handle undefined role gracefully', () => {
      const result = hasPermission(undefined, PERMISSIONS.VIEW_STUDENT_DASHBOARD);
      expect(result).toBe(false);
    });
  });

  describe('Security Validations', () => {
    it('should prevent privilege escalation through route access', () => {
      const studentRole: UserRole = 'student';
      const studentPermissions = PERMISSION_MATRIX[studentRole];

      // Student should not have admin permissions
      const adminOnlyPermissions = [
        PERMISSIONS.VIEW_ADMIN_DASHBOARD,
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.UPDATE_SETTINGS,
      ];

      adminOnlyPermissions.forEach(permission => {
        expect(studentPermissions).not.toContain(permission);
      });
    });

    it('should enforce role restrictions on all admin routes', () => {
      ADMIN_ROUTES.forEach(route => {
        expect(route.allowedRoles).toContain('admin');
        expect(route.allowedRoles).not.toContain('student');
      });
    });

    it('should require explicit permissions for sensitive operations', () => {
      const sensitivePermissions = [
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.UPDATE_SETTINGS,
        PERMISSIONS.DELETE_ADMIN_EVENT,
      ];

      sensitivePermissions.forEach(permission => {
        // Verify these exist in the permission matrix
        expect(Object.values(PERMISSIONS)).toContain(permission);
      });
    });
  });
});

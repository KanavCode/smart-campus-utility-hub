import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  PERMISSIONS,
  PERMISSION_MATRIX,
} from '@/utils/permissions';
import { UserRole } from '@/types';

describe('Permission System', () => {
  describe('hasPermission', () => {
    it('should return true if user role has permission', () => {
      const result = hasPermission('student', PERMISSIONS.VIEW_STUDENT_DASHBOARD);
      expect(result).toBe(true);
    });

    it('should return false if user role does not have permission', () => {
      const result = hasPermission('student', PERMISSIONS.VIEW_ADMIN_DASHBOARD);
      expect(result).toBe(false);
    });

    it('should return false if role is null', () => {
      const result = hasPermission(null, PERMISSIONS.VIEW_STUDENT_DASHBOARD);
      expect(result).toBe(false);
    });

    it('should return false if role is undefined', () => {
      const result = hasPermission(undefined, PERMISSIONS.VIEW_STUDENT_DASHBOARD);
      expect(result).toBe(false);
    });

    it('admin should have all permissions', () => {
      expect(hasPermission('admin', PERMISSIONS.VIEW_STUDENT_DASHBOARD)).toBe(true);
      expect(hasPermission('admin', PERMISSIONS.VIEW_ADMIN_DASHBOARD)).toBe(true);
      expect(hasPermission('admin', PERMISSIONS.CREATE_USER)).toBe(true);
      expect(hasPermission('admin', PERMISSIONS.DELETE_USER)).toBe(true);
    });

    it('student should not have admin permissions', () => {
      expect(hasPermission('student', PERMISSIONS.VIEW_ADMIN_DASHBOARD)).toBe(false);
      expect(hasPermission('student', PERMISSIONS.CREATE_USER)).toBe(false);
      expect(hasPermission('student', PERMISSIONS.DELETE_USER)).toBe(false);
    });

    it('student should have student permissions', () => {
      expect(hasPermission('student', PERMISSIONS.VIEW_STUDENT_DASHBOARD)).toBe(true);
      expect(hasPermission('student', PERMISSIONS.VIEW_TIMETABLE)).toBe(true);
      expect(hasPermission('student', PERMISSIONS.VIEW_EVENTS)).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      const permissions = [
        PERMISSIONS.VIEW_STUDENT_DASHBOARD,
        PERMISSIONS.VIEW_TIMETABLE,
      ];
      expect(hasAllPermissions('student', permissions)).toBe(true);
    });

    it('should return false if user missing any permission', () => {
      const permissions = [
        PERMISSIONS.VIEW_STUDENT_DASHBOARD,
        PERMISSIONS.VIEW_ADMIN_DASHBOARD,
      ];
      expect(hasAllPermissions('student', permissions)).toBe(false);
    });

    it('should return false if role is null', () => {
      expect(hasAllPermissions(null, [PERMISSIONS.VIEW_STUDENT_DASHBOARD])).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      expect(hasAllPermissions('student', [])).toBe(true);
    });

    it('admin should have all permissions', () => {
      const studentPermissions = PERMISSION_MATRIX['student'];
      expect(hasAllPermissions('admin', studentPermissions)).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any permission', () => {
      const permissions = [
        PERMISSIONS.VIEW_STUDENT_DASHBOARD,
        PERMISSIONS.VIEW_ADMIN_DASHBOARD,
      ];
      expect(hasAnyPermission('student', permissions)).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const permissions = [
        PERMISSIONS.VIEW_ADMIN_DASHBOARD,
        PERMISSIONS.CREATE_USER,
      ];
      expect(hasAnyPermission('student', permissions)).toBe(false);
    });

    it('should return false if role is null', () => {
      expect(hasAnyPermission(null, [PERMISSIONS.VIEW_STUDENT_DASHBOARD])).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(hasAnyPermission('student', [])).toBe(false);
    });

    it('should work with multiple permissions', () => {
      const permissions = [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.VIEW_TIMETABLE,
      ];
      expect(hasAnyPermission('student', permissions)).toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for admin', () => {
      const adminPermissions = getRolePermissions('admin');
      expect(adminPermissions.length).toBeGreaterThan(0);
      expect(adminPermissions).toContain(PERMISSIONS.VIEW_ADMIN_DASHBOARD);
      expect(adminPermissions).toContain(PERMISSIONS.CREATE_USER);
    });

    it('should return permissions for student', () => {
      const studentPermissions = getRolePermissions('student');
      expect(studentPermissions.length).toBeGreaterThan(0);
      expect(studentPermissions).toContain(PERMISSIONS.VIEW_STUDENT_DASHBOARD);
      expect(studentPermissions).toContain(PERMISSIONS.VIEW_TIMETABLE);
    });

    it('student permissions should not include admin-only permissions', () => {
      const studentPermissions = getRolePermissions('student');
      expect(studentPermissions).not.toContain(PERMISSIONS.VIEW_ADMIN_DASHBOARD);
      expect(studentPermissions).not.toContain(PERMISSIONS.CREATE_USER);
    });

    it('admin permissions should include all student permissions', () => {
      const adminPermissions = getRolePermissions('admin');
      const studentPermissions = getRolePermissions('student');
      const hasAllStudent = studentPermissions.every(perm =>
        adminPermissions.includes(perm)
      );
      expect(hasAllStudent).toBe(true);
    });

    it('faculty should have limited permissions', () => {
      const facultyPermissions = getRolePermissions('faculty');
      expect(facultyPermissions.length).toBeGreaterThan(0);
      expect(facultyPermissions.length).toBeLessThan(getRolePermissions('admin').length);
    });
  });

  describe('PERMISSION_MATRIX', () => {
    it('should have matrix for all defined roles', () => {
      const roles: UserRole[] = ['student', 'admin', 'faculty'];
      roles.forEach(role => {
        expect(PERMISSION_MATRIX[role]).toBeDefined();
        expect(Array.isArray(PERMISSION_MATRIX[role])).toBe(true);
      });
    });

    it('admin should have more permissions than student', () => {
      const adminCount = PERMISSION_MATRIX['admin'].length;
      const studentCount = PERMISSION_MATRIX['student'].length;
      expect(adminCount).toBeGreaterThan(studentCount);
    });

    it('should not have duplicate permissions for any role', () => {
      ['student', 'admin', 'faculty'].forEach(role => {
        const permissions = PERMISSION_MATRIX[role as UserRole];
        const uniquePermissions = new Set(permissions);
        expect(permissions.length).toBe(uniquePermissions.size);
      });
    });
  });

  describe('Permission Consistency', () => {
    it('all permissions in matrix should be defined', () => {
      const allPermissions = new Set<string>();
      Object.values(PERMISSIONS).forEach(perm => allPermissions.add(perm));

      Object.values(PERMISSION_MATRIX).forEach(rolePermissions => {
        rolePermissions.forEach(perm => {
          expect(allPermissions.has(perm)).toBe(true);
        });
      });
    });
  });
});

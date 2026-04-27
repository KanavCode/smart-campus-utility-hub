/**
 * Custom hook for permission checking in React components
 * Provides an easy way to gate UI elements based on user permissions
 */

import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/utils/permissions';

interface UsePermissionResult {
  can: (permission: typeof PERMISSIONS[keyof typeof PERMISSIONS]) => boolean;
  canAll: (permissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][]) => boolean;
  canAny: (permissions: typeof PERMISSIONS[keyof typeof PERMISSIONS][]) => boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

/**
 * Hook to check permissions and determine if UI elements should be visible/enabled
 * 
 * @returns Object with permission checking methods
 * 
 * @example
 * ```tsx
 * const { can, canAll, isAdmin } = usePermission();
 * 
 * return (
 *   <>
 *     {can(PERMISSIONS.DELETE_USER) && <DeleteButton />}
 *     {canAll([PERMISSIONS.VIEW_USERS, PERMISSIONS.UPDATE_USER]) && <AdminPanel />}
 *   </>
 * );
 * ```
 */
export const usePermission = (): UsePermissionResult => {
  const auth = useAuth();

  return {
    can: (permission) => auth.hasPermission(permission),
    canAll: (permissions) => auth.hasAllPermissions(permissions),
    canAny: (permissions) => auth.hasAnyPermission(permissions),
    isAdmin: auth.isAdmin,
    isStudent: auth.isStudent,
  };
};

/**
 * Component for conditional rendering based on permissions
 * 
 * @example
 * ```tsx
 * <CanAccess permission={PERMISSIONS.DELETE_USER}>
 *   <DeleteButton />
 * </CanAccess>
 * ```
 */
interface CanAccessProps {
  permission?: typeof PERMISSIONS[keyof typeof PERMISSIONS];
  permissions?: typeof PERMISSIONS[keyof typeof PERMISSIONS][];
  allRequired?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const CanAccess = ({
  permission,
  permissions,
  allRequired = true,
  fallback = null,
  children,
}: CanAccessProps) => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <>{fallback}</>;
  }

  if (permission) {
    if (!auth.hasPermission(permission)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  if (permissions && permissions.length > 0) {
    const hasAccess = allRequired
      ? auth.hasAllPermissions(permissions)
      : auth.hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  return <>{children}</>;
};

/**
 * Utility to conditionally apply className based on permissions
 * Useful for styling elements based on accessibility
 * 
 * @example
 * ```tsx
 * const deleteButtonClass = getPermissionClass(
 *   can(PERMISSIONS.DELETE_USER),
 *   'cursor-pointer hover:bg-red-100',
 *   'cursor-not-allowed opacity-50'
 * );
 * ```
 */
export const getPermissionClass = (
  hasPermission: boolean,
  allowedClass: string,
  deniedClass: string
): string => {
  return hasPermission ? allowedClass : deniedClass;
};

/**
 * Utility to conditionally apply attributes based on permissions
 * Useful for disabling buttons/inputs based on permissions
 * 
 * @example
 * ```tsx
 * <button {...getPermissionAttributes(can(PERMISSIONS.DELETE_USER))}>
 *   Delete
 * </button>
 * ```
 */
export const getPermissionAttributes = (
  hasPermission: boolean
): { disabled?: boolean; 'aria-disabled'?: boolean } => {
  if (!hasPermission) {
    return { disabled: true, 'aria-disabled': true };
  }
  return {};
};
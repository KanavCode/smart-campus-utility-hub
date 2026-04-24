/**
 * Example Component: Permission System Usage
 * 
 * This component demonstrates best practices for using the permission-driven RBAC system
 * in real application components.
 */

import { usePermission, CanAccess, getPermissionAttributes } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

/**
 * Example 1: Simple Permission Check with Conditional Rendering
 */
export const SimplePermissionExample = () => {
  const { can } = usePermission();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Conditional Rendering Based on Permissions</h3>

      {/* Only show delete button if user has permission */}
      {can(PERMISSIONS.DELETE_USER) && (
        <Button variant="destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete User
        </Button>
      )}

      {/* Only show if user doesn't have permission */}
      {!can(PERMISSIONS.DELETE_USER) && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            You don't have permission to delete users
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Example 2: Multiple Permission Checks
 */
export const MultiplePermissionsExample = () => {
  const { canAll, canAny } = usePermission();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Multiple Permission Checks</h3>

      {/* Requires ALL specified permissions */}
      {canAll([PERMISSIONS.VIEW_USERS, PERMISSIONS.UPDATE_USER]) && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            ✓ You can view and update users
          </p>
        </div>
      )}

      {/* Requires ANY of the specified permissions */}
      {canAny([PERMISSIONS.CREATE_USER, PERMISSIONS.UPDATE_USER]) && (
        <Button variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Manage Users
        </Button>
      )}
    </div>
  );
};

/**
 * Example 3: Using CanAccess Component
 */
export const CanAccessExample = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">CanAccess Component Examples</h3>

      {/* Single permission */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Delete Permission:</p>
        <CanAccess
          permission={PERMISSIONS.DELETE_USER}
          fallback={<p className="text-sm text-gray-500">No delete permission</p>}
        >
          <Button variant="destructive" size="sm">Delete</Button>
        </CanAccess>
      </div>

      {/* Multiple permissions (all required) */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Admin Panel (all perms required):</p>
        <CanAccess
          permissions={[PERMISSIONS.VIEW_USERS, PERMISSIONS.UPDATE_USER, PERMISSIONS.DELETE_USER]}
          allRequired={true}
          fallback={<p className="text-xs text-gray-500">Insufficient permissions</p>}
        >
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-900 dark:text-purple-300">Full Admin Access</p>
          </div>
        </CanAccess>
      </div>

      {/* Multiple permissions (any one required) */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Edit Access (any perm):</p>
        <CanAccess
          permissions={[PERMISSIONS.UPDATE_USER, PERMISSIONS.UPDATE_ADMIN_EVENT]}
          allRequired={false}
          fallback={<p className="text-xs text-gray-500">No edit permissions</p>}
        >
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CanAccess>
      </div>
    </div>
  );
};

/**
 * Example 4: Using Permission Attributes for Button States
 */
export const PermissionAttributesExample = () => {
  const { can } = usePermission();
  const canDelete = can(PERMISSIONS.DELETE_USER);
  const canUpdate = can(PERMISSIONS.UPDATE_USER);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Button States Based on Permissions</h3>

      <div className="flex gap-2">
        {/* Delete button with conditional disabled state */}
        <Button
          variant="destructive"
          {...getPermissionAttributes(canDelete)}
          title={!canDelete ? 'You do not have permission to delete' : 'Delete user'}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>

        {/* Update button */}
        <Button
          variant="default"
          {...getPermissionAttributes(canUpdate)}
          title={!canUpdate ? 'You do not have permission to update' : 'Update user'}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Visual feedback */}
      <p className="text-xs text-gray-500">
        {canDelete && canUpdate
          ? 'All actions available'
          : `Limited to: ${[canDelete && 'delete', canUpdate && 'update'].filter(Boolean).join(', ') || 'none'}`}
      </p>
    </div>
  );
};

/**
 * Example 5: Role-Based Component Rendering
 */
export const RoleBasedRenderingExample = () => {
  const { isAdmin, isStudent } = useAuth();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Role-Based Rendering</h3>

      {isAdmin && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <p className="font-semibold text-red-900 dark:text-red-300 mb-2">Admin Controls</p>
          <Button variant="outline" size="sm">Manage System Settings</Button>
        </div>
      )}

      {isStudent && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <p className="font-semibold text-green-900 dark:text-green-300 mb-2">Student View</p>
          <Button variant="outline" size="sm">View My Timetable</Button>
        </div>
      )}
    </div>
  );
};

/**
 * Example 6: Complex Permission-Gated UI
 * Shows a realistic user management interface
 */
export const UserManagementInterfaceExample = () => {
  const { can, canAll } = usePermission();

  const canView = can(PERMISSIONS.VIEW_USERS);
  const canCreate = can(PERMISSIONS.CREATE_USER);
  const canUpdate = can(PERMISSIONS.UPDATE_USER);
  const canDelete = can(PERMISSIONS.DELETE_USER);
  const isFullAdmin = canAll([
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
  ]);

  if (!canView) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-900 dark:text-yellow-300">Access Denied: You don't have permission to view users</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">User Management</h3>

        {canCreate && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* User list with action buttons */}
      <div className="space-y-2">
        <div className="p-3 border rounded flex justify-between items-center">
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">john@example.com</p>
          </div>

          <div className="flex gap-2">
            {canUpdate && (
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
            )}

            {canDelete && (
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            {!canUpdate && !canDelete && (
              <span className="text-xs text-gray-500">No actions available</span>
            )}
          </div>
        </div>
      </div>

      {/* Admin-only features */}
      {isFullAdmin && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            ✓ Full admin access - all user management features available
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Main Example Component
 * Demonstrates all usage patterns
 */
export const RBACExampleComponent = () => {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-8">
      <div className="border-b pb-6">
        <h2 className="text-2xl font-bold mb-2">Permission System Examples</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive examples of using the permission-driven RBAC system
        </p>
      </div>

      <SimplePermissionExample />
      <MultiplePermissionsExample />
      <CanAccessExample />
      <PermissionAttributesExample />
      <RoleBasedRenderingExample />
      <UserManagementInterfaceExample />

      {/* Usage Summary */}
      <div className="border-t pt-6 mt-8">
        <h3 className="font-semibold mb-3">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="font-mono text-xs mb-2 text-gray-600 dark:text-gray-400">usePermission()</p>
            <p className="text-gray-700 dark:text-gray-300">
              Hook for checking permissions in components
            </p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="font-mono text-xs mb-2 text-gray-600 dark:text-gray-400">CanAccess</p>
            <p className="text-gray-700 dark:text-gray-300">
              Component for conditional rendering
            </p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="font-mono text-xs mb-2 text-gray-600 dark:text-gray-400">ProtectedRoute</p>
            <p className="text-gray-700 dark:text-gray-300">
              Route guard with permission validation
            </p>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="font-mono text-xs mb-2 text-gray-600 dark:text-gray-400">getPermissionAttributes()</p>
            <p className="text-gray-700 dark:text-gray-300">
              Helper for button disabled states
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RBACExampleComponent;

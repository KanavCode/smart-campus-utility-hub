import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { findRouteByPath } from '@/config/routes';
import { hasPermission } from '@/utils/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  requiredPermissions?: string[];
  requiredAnyPermissions?: string[];
}

/**
 * Enhanced ProtectedRoute component with permission-based access control
 * - Validates authentication
 * - Checks permissions from route metadata
 * - Supports both required and optional permission checks
 * - Falls back to route metadata if no permissions explicitly provided
 */
export const ProtectedRoute = ({ 
  children, 
  adminOnly = false,
  requiredPermissions,
  requiredAnyPermissions,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Legacy adminOnly support
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Try to get route metadata
  const routeMetadata = findRouteByPath(location.pathname);

  // Determine required permissions
  const permissionsToCheck = requiredPermissions || routeMetadata?.requiredPermissions || [];
  const anyPermissionsToCheck = requiredAnyPermissions || routeMetadata?.requiredAnyPermissions;

  // Check if user has all required permissions
  if (permissionsToCheck.length > 0) {
    const hasAllRequired = permissionsToCheck.every(permission =>
      hasPermission(user?.role, permission)
    );

    if (!hasAllRequired) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check if user has any of the required permissions
  if (anyPermissionsToCheck && anyPermissionsToCheck.length > 0) {
    const hasAny = anyPermissionsToCheck.some(permission =>
      hasPermission(user?.role, permission)
    );

    if (!hasAny) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check route-level role restrictions
  if (routeMetadata && !routeMetadata.allowedRoles.includes(user?.role || 'student')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};


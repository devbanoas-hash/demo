import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { canRoleAccessRoute, ADMIN_ROLE } from '@/config/routePermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

/**
 * ProtectedRoute component
 * Checks if user is authenticated and has permission to access the route
 * Redirects to login if not authenticated
 * Redirects to unauthorized if role doesn't have permission
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no role specified, allow access (authenticated users)
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Get user's role
  const userRole = user?.role_name || '';

  // Admin has access to everything
  if (userRole === ADMIN_ROLE) {
    return <>{children}</>;
  }

  // Check if user's role can access this route
  const canAccess = canRoleAccessRoute(userRole, location.pathname);

  if (!canAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

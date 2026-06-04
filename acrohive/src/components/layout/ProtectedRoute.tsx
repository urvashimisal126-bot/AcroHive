import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin';
  redirectTo?: string;
}

/**
 * Route guard component that checks auth state and role.
 *
 * - No session → redirect to /auth (or custom redirectTo)
 * - Wrong role → redirect to role-specific auth page
 * - Loading → shows spinner
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo,
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted font-mono">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    const fallback = redirectTo || '/auth';
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Role mismatch
  if (requiredRole && role !== requiredRole) {
    if (requiredRole === 'admin') {
      return <Navigate to="/auth/admin" state={{ from: location }} replace />;
    }
    if (requiredRole === 'student') {
      return <Navigate to="/auth/student" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

// ===========================================
// PROTECTED ROUTE COMPONENT
// ===========================================

import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState } = useAuth();

  // Show loading while checking auth state
  if (authState.isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  // If not authenticated, don't render children
  // App.tsx will handle showing login page
  if (!authState.isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

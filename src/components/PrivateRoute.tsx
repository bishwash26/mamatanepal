import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // New prop to make auth optional
}

export default function PrivateRoute({ children, requireAuth = true }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show loading indicator
  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  // If authentication is not required or user is authenticated, render children
  if (!requireAuth || user) {
    return <>{children}</>;
  }

  // Redirect to login while saving the attempted location
  return <Navigate to="/login" state={{ from: location }} replace />;
} 
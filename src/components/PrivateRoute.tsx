import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // New prop to make auth optional
}

export default function PrivateRoute({ children, requireAuth = true }: PrivateRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or your loading component
  }

  // If authentication is not required or user is authenticated, render children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // Redirect to login while saving the attempted location
  return <Navigate to="/login" state={{ from: location }} replace />;
} 
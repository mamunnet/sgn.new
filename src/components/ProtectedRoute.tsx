import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/sgnadminpanel" replace />;
  }

  if (user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    // Not admin, redirect to login page
    return <Navigate to="/sgnadminpanel" replace />;
  }

  // Authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute;
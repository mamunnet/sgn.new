import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

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
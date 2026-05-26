import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.isAdmin) {
    // If they are logged in but not an admin, kick them to the normal app shell
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default AdminRoute;

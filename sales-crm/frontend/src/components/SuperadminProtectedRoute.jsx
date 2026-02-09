import React from 'react';
import { Navigate } from 'react-router-dom';

const SuperadminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== 'SUPERADMIN') {
    return <Navigate to="/crm" replace />;
  }

  return children;
};

export default SuperadminProtectedRoute;

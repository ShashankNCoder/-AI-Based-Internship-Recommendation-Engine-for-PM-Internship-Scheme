import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  return currentUser ? children : (
    <Navigate 
      to="/signin" 
      state={{ from: location }} 
      replace 
    />
  );
};

export default ProtectedRoute;

// ProtectedRoute.js - Enhanced with role-based protection
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Spinner } from "Atoms";

export const ProtectedRoute = ({
  children,
  requiresAuth = true,
  requiredRole = null, // 'admin' or 'super-admin'
  redirectTo = "/admin/login",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const auth = getAuth();
  const location = useLocation();

  // Super admin email from environment
  const SUPER_ADMIN_EMAIL = process.env.REACT_APP_SUPER_ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Determine user role
        const role = currentUser.email === SUPER_ADMIN_EMAIL ? 'super-admin' : 'admin';
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, SUPER_ADMIN_EMAIL]);

  if (loading) return <Spinner />;

  // If authentication is required but user is not logged in
  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is logged in, redirect based on role
  if (!requiresAuth && user) {
    if (userRole === 'super-admin') {
      return <Navigate to="/super-admin/dashboard" replace />;
    } else {
      return <Navigate to="/admin/hotel-select" replace />;
    }
  }

  // If specific role is required, check if user has that role
  if (requiredRole && userRole !== requiredRole) {
    const redirectPath = userRole === 'super-admin' ? '/super-admin/dashboard' : '/admin/hotel-select';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
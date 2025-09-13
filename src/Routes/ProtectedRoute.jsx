// Components/ProtectedRoutes.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from "../atoms/LoadingSpinner";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;

// Protected Route Component for Admin
export const ProtectedAdminRoute = ({
  children,
  requiresAuth = true,
  redirectTo = "/admin/login",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  if (loading) return <LoadingSpinner />;

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    if (user.email === SUPER_ADMIN_EMAIL) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    return <Navigate to="/admin/hotel-select" replace />;
  }

  if (user && user.email === SUPER_ADMIN_EMAIL) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  return children;
};

// Protected Route Component for Super Admin
export const ProtectedSuperAdminRoute = ({
  children,
  requiresAuth = true,
  redirectTo = "/super-admin/login",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  if (loading) return <LoadingSpinner />;

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    if (user.email === SUPER_ADMIN_EMAIL) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    return <Navigate to="/admin/hotel-select" replace />;
  }

  if (user && user.email !== SUPER_ADMIN_EMAIL) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

// Protected Route Component for Captain
export const ProtectedCaptainRoute = ({
  children,
  requiresAuth = true,
  redirectTo = "/admin/login",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  if (loading) return <LoadingSpinner />;

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    if (user.email === SUPER_ADMIN_EMAIL) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    return <Navigate to="/admin/hotel-select" replace />;
  }

  // Captain routes are available for both admin and super admin
  return children;
};

// Public Route Component
export const PublicRoute = ({ children }) => {
  return children;
};

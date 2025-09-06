import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Spinner } from "Atoms";

export const ProtectedRoute = ({
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

  if (loading) return <Spinner />;

  if (requiresAuth && !user) return <Navigate to={redirectTo} replace />;

  if (!requiresAuth && user) return <Navigate to="/admin/hotel-select" replace />;

  return children;
};

// hooks/useUIState.js
import { useState, useEffect, useCallback } from "react";

export const useUIState = (location) => {
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(location.pathname.includes("admin"));
  }, [location.pathname]);

  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  return {
    viewMode,
    isAdmin,
    changeViewMode,
  };
};

// context/HotelSelectionContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const HotelSelectionContext = createContext();

export const useHotelSelection = () => {
  const context = useContext(HotelSelectionContext);
  if (!context) {
    throw new Error(
      "useHotelSelection must be used within a HotelSelectionProvider",
    );
  }
  return context;
};

export const HotelSelectionProvider = ({ children }) => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { userHotels, refreshUserHotels, isSuperAdmin, adminData } = useAuth();

  // Sync availableHotels from auth context
  useEffect(() => {
    setAvailableHotels(userHotels || []);
    // Auto-select first if none or invalid
    if (userHotels && userHotels.length > 0) {
      setSelectedHotel(userHotels[0]);
    } else {
      setSelectedHotel(null);
    }
  }, [userHotels]);

  // Allow manual refresh
  const refreshHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshUserHotels();
    } catch {
      setError("Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  const selectHotel = (hotel) => setSelectedHotel(hotel);

  const canAccessHotel = (hotelId) =>
    isSuperAdmin() ||
    availableHotels.some((h) => h.id === hotelId || h.hotelId === hotelId);

  const value = {
    selectedHotel,
    availableHotels,
    loading,
    error,
    selectHotel,
    refreshHotels,
    canAccessHotel,
    hasHotels: availableHotels.length > 0,
  };

  return (
    <HotelSelectionContext.Provider value={value}>
      {children}
    </HotelSelectionContext.Provider>
  );
};

export default HotelSelectionContext;

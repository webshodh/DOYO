// context/HotelContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const HotelContext = createContext();

export const useHotelContext = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotelContext must be used within a HotelProvider");
  }
  return context;
};

export const HotelProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { userHotels, userRole, adminData, refreshUserHotels, isSuperAdmin } =
    useAuth();

  // Whenever enhanced adminData or role changes, refresh hotels
  useEffect(() => {
    if (adminData || userRole === "admin" || userRole === "superadmin") {
      setLoading(true);
      refreshUserHotels()
        .catch(() => setError("Failed to refresh hotels"))
        .finally(() => setLoading(false));
    }
  }, [adminData, userRole, refreshUserHotels]);

  // Sync with auth context when userHotels change
  useEffect(() => {
    if (userHotels && userHotels.length > 0) {
      setHotels(userHotels);
      // Auto-select first if none or invalid
      if (
        !selectedHotel ||
        !userHotels.find(
          (h) => h.id === selectedHotel.id || h.hotelId === selectedHotel.id,
        )
      ) {
        setSelectedHotel(userHotels[0]);
      }
    } else {
      setHotels([]);
      setSelectedHotel(null);
    }
  }, [userHotels]);

  const updateHotels = (list) => {
    setHotels(list);
    if (list.length > 0) {
      const valid =
        selectedHotel &&
        list.find(
          (h) => h.id === selectedHotel.id || h.hotelId === selectedHotel.id,
        );
      if (!valid) setSelectedHotel(list[0]);
    } else {
      setSelectedHotel(null);
    }
  };

  const selectHotel = (hotel) => setSelectedHotel(hotel);
  const clearSelection = () => {
    setHotels([]);
    setSelectedHotel(null);
  };

  const canAccessHotel = (hotelId) => {
    if (isSuperAdmin()) return true;
    return hotels.some((h) => h.id === hotelId || h.hotelId === hotelId);
  };

  const getHotelById = (hotelId) =>
    hotels.find((h) => h.id === hotelId || h.hotelId === hotelId) || null;

  const isHotelSelected = (hotelId) =>
    !!selectedHotel &&
    (selectedHotel.id === hotelId || selectedHotel.hotelId === hotelId);

  const getSelectedHotelId = () =>
    selectedHotel?.hotelId || selectedHotel?.id || null;

  const getSelectedHotelName = () =>
    selectedHotel?.businessName ||
    selectedHotel?.hotelName ||
    selectedHotel?.name ||
    null;

  const switchToHotel = (hotelId) => {
    const h = getHotelById(hotelId);
    if (h && canAccessHotel(hotelId)) {
      selectHotel(h);
      return true;
    }
    return false;
  };

  const getHotelStats = () => ({
    totalHotels: hotels.length,
    hasSelectedHotel: !!selectedHotel,
    selectedHotelId: getSelectedHotelId(),
    selectedHotelName: getSelectedHotelName(),
    userRole,
    isEnhancedAdmin: !!adminData,
    linkedHotelId: adminData?.linkedHotelId || null,
  });

  return (
    <HotelContext.Provider
      value={{
        hotels,
        selectedHotel,
        loading,
        error,
        updateHotels,
        selectHotel,
        clearSelection,
        canAccessHotel,
        getHotelById,
        isHotelSelected,
        getSelectedHotelId,
        getSelectedHotelName,
        switchToHotel,
        getHotelStats,
        hasHotels: hotels.length > 0,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export default HotelContext;

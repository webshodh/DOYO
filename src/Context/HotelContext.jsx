// src/Context/HotelContext.jsx
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
  const { userHotels, userRole, loading: authLoading } = useAuth();
  const [hotels, setHotels] = useState([]); // list of hotels for admin
  const [selectedHotel, setSelectedHotel] = useState(null); // currently active hotel
  const [loading, setLoading] = useState(false);

  // ✅ ENHANCED: Auto-sync with userHotels from AuthContext
  useEffect(() => {
    if (!authLoading && userHotels) {
      updateHotels(userHotels);
    }
  }, [userHotels, authLoading]);

  // ✅ ENHANCED: Persist selected hotel to localStorage
  useEffect(() => {
    const savedHotelId = localStorage.getItem("selectedHotelId");
    if (savedHotelId && hotels.length > 0) {
      const savedHotel = hotels.find(
        (hotel) => hotel.id === savedHotelId || hotel.name === savedHotelId
      );
      if (savedHotel) {
        setSelectedHotel(savedHotel);
      }
    }
  }, [hotels]);

  // ✅ ENHANCED: Save to localStorage when hotel changes
  useEffect(() => {
    if (selectedHotel) {
      localStorage.setItem(
        "selectedHotelId",
        selectedHotel.id || selectedHotel.name
      );
    }
  }, [selectedHotel]);

  // Set hotels list + default selection (first hotel)
  const updateHotels = (hotelList) => {
    setHotels(hotelList || []);

    // Try to restore previously selected hotel, otherwise pick first
    const savedHotelId = localStorage.getItem("selectedHotelId");
    let hotelToSelect = null;

    if (savedHotelId && hotelList?.length > 0) {
      hotelToSelect = hotelList.find(
        (hotel) => hotel.id === savedHotelId || hotel.name === savedHotelId
      );
    }

    // Fallback to first hotel if no saved selection or saved hotel not found
    if (!hotelToSelect && hotelList?.length > 0) {
      hotelToSelect = hotelList[0];
    }

    setSelectedHotel(hotelToSelect);
  };

  const clearSelection = () => {
    setHotels([]);
    setSelectedHotel(null);
    localStorage.removeItem("selectedHotelId");
  };

  // ✅ NEW: Select hotel by ID or name
  const selectHotelById = (hotelId) => {
    const hotel = hotels.find((h) => h.id === hotelId || h.name === hotelId);
    if (hotel) {
      setSelectedHotel(hotel);
      return true;
    }
    return false;
  };

  // ✅ NEW: Get hotel by ID or name
  const getHotelById = (hotelId) => {
    return hotels.find((h) => h.id === hotelId || h.name === hotelId);
  };

  // ✅ NEW: Check if user has access to specific hotel
  const hasAccessToHotel = (hotelId) => {
    if (userRole === "superadmin") return true;
    return hotels.some((h) => h.id === hotelId || h.name === hotelId);
  };

  // ✅ NEW: Get hotel names for dropdowns/selects
  const getHotelOptions = () => {
    return hotels.map((hotel) => ({
      value: hotel.id || hotel.name,
      label: hotel.businessName || hotel.hotelName || hotel.name,
      hotel: hotel,
    }));
  };

  // ✅ NEW: Switch to next/previous hotel (useful for navigation)
  const switchToNextHotel = () => {
    if (hotels.length <= 1) return false;

    const currentIndex = hotels.findIndex(
      (h) => h.id === selectedHotel?.id || h.name === selectedHotel?.name
    );

    const nextIndex = (currentIndex + 1) % hotels.length;
    setSelectedHotel(hotels[nextIndex]);
    return true;
  };

  const switchToPreviousHotel = () => {
    if (hotels.length <= 1) return false;

    const currentIndex = hotels.findIndex(
      (h) => h.id === selectedHotel?.id || h.name === selectedHotel?.name
    );

    const prevIndex = currentIndex === 0 ? hotels.length - 1 : currentIndex - 1;
    setSelectedHotel(hotels[prevIndex]);
    return true;
  };

  // ✅ NEW: Validate hotel selection
  const isValidHotelSelected = () => {
    return (
      selectedHotel &&
      hotels.some(
        (h) => h.id === selectedHotel.id || h.name === selectedHotel.name
      )
    );
  };

  // ✅ NEW: Get current hotel's full path for Firestore operations
  const getCurrentHotelPath = () => {
    if (!selectedHotel) return null;
    return selectedHotel.name || selectedHotel.id;
  };

  // ✅ NEW: Get hotel display name
  const getHotelDisplayName = (hotel = selectedHotel) => {
    if (!hotel) return "";
    return hotel.businessName || hotel.hotelName || hotel.name || hotel.id;
  };

  // ✅ NEW: Refresh hotels from auth context
  const refreshHotels = async () => {
    setLoading(true);
    try {
      // This will trigger the useEffect above to update hotels
      // You could also call refreshUserHotels from AuthContext here
      // await refreshUserHotels?.();
    } catch (error) {
      console.error("Error refreshing hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Search/filter hotels
  const searchHotels = (searchTerm) => {
    if (!searchTerm.trim()) return hotels;

    const term = searchTerm.toLowerCase();
    return hotels.filter(
      (hotel) =>
        (hotel.name || "").toLowerCase().includes(term) ||
        (hotel.businessName || "").toLowerCase().includes(term) ||
        (hotel.hotelName || "").toLowerCase().includes(term) ||
        (hotel.address || "").toLowerCase().includes(term)
    );
  };

  const value = {
    // Original functionality
    hotels,
    setHotels,
    selectedHotel,
    setSelectedHotel,
    updateHotels,
    clearSelection,

    // ✅ NEW: Enhanced functionality
    loading,
    selectHotelById,
    getHotelById,
    hasAccessToHotel,
    getHotelOptions,
    switchToNextHotel,
    switchToPreviousHotel,
    isValidHotelSelected,
    getCurrentHotelPath,
    getHotelDisplayName,
    refreshHotels,
    searchHotels,

    // ✅ NEW: Computed values
    hasHotels: hotels.length > 0,
    hotelCount: hotels.length,
    hasMultipleHotels: hotels.length > 1,
    selectedHotelId: selectedHotel?.id || selectedHotel?.name,
    selectedHotelName: getHotelDisplayName(),

    // ✅ NEW: Role-based helpers
    canManageMultipleHotels:
      userRole === "superadmin" || (userRole === "admin" && hotels.length > 1),
    isSingleHotelUser: hotels.length === 1,
  };

  return (
    <HotelContext.Provider value={value}>{children}</HotelContext.Provider>
  );
};

// ✅ NEW: Custom hook for hotel selection with validation
export const useHotelSelection = () => {
  const {
    selectedHotel,
    setSelectedHotel,
    hasHotels,
    isValidHotelSelected,
    selectHotelById,
    getCurrentHotelPath,
  } = useHotelContext();

  const ensureHotelSelected = () => {
    if (!isValidHotelSelected()) {
      throw new Error("No valid hotel selected. Please select a hotel first.");
    }
    return selectedHotel;
  };

  const getSelectedHotelOrThrow = () => {
    const hotel = ensureHotelSelected();
    return hotel;
  };

  const withHotelCheck = (callback) => {
    return (...args) => {
      ensureHotelSelected();
      return callback(...args);
    };
  };

  return {
    selectedHotel,
    setSelectedHotel,
    selectHotelById,
    hasHotels,
    isValidHotelSelected,
    ensureHotelSelected,
    getSelectedHotelOrThrow,
    withHotelCheck,
    getCurrentHotelPath,
  };
};

// ✅ NEW: Custom hook for multi-hotel operations (for super admin/admin with multiple hotels)
export const useMultiHotelOperations = () => {
  const {
    hotels,
    getHotelOptions,
    hasMultipleHotels,
    canManageMultipleHotels,
    switchToNextHotel,
    switchToPreviousHotel,
    searchHotels,
  } = useHotelContext();

  const { userRole } = useAuth();

  if (!canManageMultipleHotels) {
    console.warn(
      "useMultiHotelOperations should only be used by users with access to multiple hotels"
    );
  }

  return {
    hotels,
    getHotelOptions,
    hasMultipleHotels,
    canManageMultipleHotels,
    switchToNextHotel,
    switchToPreviousHotel,
    searchHotels,
    isSuperAdmin: userRole === "superadmin",
  };
};

export default HotelProvider;

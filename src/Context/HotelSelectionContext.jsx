// src/Context/HotelSelectionContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
// ✅ FIRESTORE IMPORTS (replacing Realtime Database)
import { db } from "../services/firebase/firebaseConfig";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const HotelSelectionContext = createContext();

export const useHotelSelection = () => {
  const context = useContext(HotelSelectionContext);
  if (!context) {
    throw new Error(
      "useHotelSelection must be used within a HotelSelectionProvider"
    );
  }
  return context;
};

export const HotelSelectionProvider = ({ children }) => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const auth = getAuth();

  // ✅ FIRESTORE: Fetch user's hotels
  const fetchUserHotels = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Get admin document to get assigned hotels
      const adminDoc = await getDoc(doc(db, `admins/${userId}`));

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const hotelsData = adminData.hotels || {};

        // Get detailed hotel information for each assigned hotel
        const hotelsList = [];

        for (const [hotelName, hotelInfo] of Object.entries(hotelsData)) {
          try {
            // Get hotel details from hotels/{hotelName}/info
            const hotelInfoDoc = await getDoc(
              doc(db, `hotels/${hotelName}/info`)
            );

            if (hotelInfoDoc.exists()) {
              const hotelDetails = hotelInfoDoc.data();
              hotelsList.push({
                id: hotelName,
                name: hotelName,
                data: hotelInfo, // Assignment info (uuid, assignedAt, etc.)
                details: hotelDetails, // Full hotel information
                displayName:
                  hotelDetails.businessName ||
                  hotelDetails.hotelName ||
                  hotelName,
                address: hotelDetails.address || "",
                phone: hotelDetails.primaryContact || hotelDetails.phone || "",
                email: hotelDetails.businessEmail || hotelDetails.email || "",
                status: hotelDetails.status || "active",
              });
            } else {
              // Hotel info not found, create basic entry
              hotelsList.push({
                id: hotelName,
                name: hotelName,
                data: hotelInfo,
                details: null,
                displayName: hotelName,
                address: "",
                phone: "",
                email: "",
                status: "unknown",
              });
            }
          } catch (hotelError) {
            console.error(
              `Error fetching details for hotel ${hotelName}:`,
              hotelError
            );
            // Add basic hotel info even if details fetch fails
            hotelsList.push({
              id: hotelName,
              name: hotelName,
              data: hotelInfo,
              details: null,
              displayName: hotelName,
              address: "",
              phone: "",
              email: "",
              status: "error",
            });
          }
        }

        setAvailableHotels(hotelsList);
        return hotelsList;
      } else {
        // Check if user might be a captain instead
        const captainData = await findCaptainByAuthId(userId);
        if (captainData) {
          const captainHotel = await getHotelByName(captainData.hotelName);
          const hotelsList = captainHotel ? [captainHotel] : [];
          setAvailableHotels(hotelsList);
          return hotelsList;
        }

        setAvailableHotels([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setError(error.message);
      setAvailableHotels([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIRESTORE: Helper function to find captain by auth ID
  const findCaptainByAuthId = async (authId) => {
    try {
      const hotelsSnapshot = await getDocs(collection(db, "hotels"));

      for (const hotelDoc of hotelsSnapshot.docs) {
        const hotelName = hotelDoc.id;
        const captainsSnapshot = await getDocs(
          collection(db, `hotels/${hotelName}/captains`)
        );

        for (const captainDoc of captainsSnapshot.docs) {
          const captainData = captainDoc.data();
          if (captainData.firebaseAuthId === authId) {
            return {
              ...captainData,
              hotelName,
              captainId: captainDoc.id,
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error finding captain:", error);
      return null;
    }
  };

  // ✅ FIRESTORE: Helper function to get hotel by name
  const getHotelByName = async (hotelName) => {
    try {
      const hotelInfoDoc = await getDoc(doc(db, `hotels/${hotelName}/info`));

      if (hotelInfoDoc.exists()) {
        const hotelDetails = hotelInfoDoc.data();
        return {
          id: hotelName,
          name: hotelName,
          data: {},
          details: hotelDetails,
          displayName:
            hotelDetails.businessName || hotelDetails.hotelName || hotelName,
          address: hotelDetails.address || "",
          phone: hotelDetails.primaryContact || hotelDetails.phone || "",
          email: hotelDetails.businessEmail || hotelDetails.email || "",
          status: hotelDetails.status || "active",
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching hotel by name:", error);
      return null;
    }
  };

  // Initialize user and hotels
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const hotels = await fetchUserHotels(currentUser.uid);

        // Auto-select first hotel if available and no hotel is selected
        if (hotels.length > 0 && !selectedHotel) {
          // Try to restore from localStorage first
          const savedHotelId = localStorage.getItem("selectedHotelId");
          const savedHotel = savedHotelId
            ? hotels.find(
                (h) => h.id === savedHotelId || h.name === savedHotelId
              )
            : null;

          setSelectedHotel(savedHotel || hotels[0]);
        }
      } else {
        setUser(null);
        setAvailableHotels([]);
        setSelectedHotel(null);
        setError(null);
      }
    });

    return unsubscribe;
  }, []); // Remove selectedHotel dependency to avoid infinite loops

  // Save selected hotel to localStorage
  useEffect(() => {
    if (selectedHotel) {
      localStorage.setItem(
        "selectedHotelId",
        selectedHotel.id || selectedHotel.name
      );
    }
  }, [selectedHotel]);

  const selectHotel = (hotel) => {
    setSelectedHotel(hotel);
  };

  const refreshHotels = async () => {
    if (user) {
      await fetchUserHotels(user.uid);
    }
  };

  // ✅ NEW: Clear selection
  const clearSelection = () => {
    setSelectedHotel(null);
    localStorage.removeItem("selectedHotelId");
  };

  // ✅ NEW: Get hotel by ID
  const getHotelById = (hotelId) => {
    return availableHotels.find((h) => h.id === hotelId || h.name === hotelId);
  };

  // ✅ NEW: Check if user has access to hotel
  const hasAccessToHotel = (hotelId) => {
    return availableHotels.some((h) => h.id === hotelId || h.name === hotelId);
  };

  // ✅ NEW: Get hotel options for dropdowns
  const getHotelOptions = () => {
    return availableHotels.map((hotel) => ({
      value: hotel.id,
      label: hotel.displayName,
      hotel: hotel,
    }));
  };

  // ✅ NEW: Validate current selection
  const isValidSelection = () => {
    return (
      selectedHotel &&
      availableHotels.some(
        (h) => h.id === selectedHotel.id || h.name === selectedHotel.name
      )
    );
  };

  // ✅ NEW: Get user role based on available hotels
  const getUserRole = () => {
    if (!user) return null;

    // Simple role detection based on email or hotel access
    const superAdminEmails = [
      "webshodhteam@gmail.com",
      "superadmin1@example.com",
      "admin@company.com",
    ];

    if (superAdminEmails.includes(user.email?.toLowerCase())) {
      return "superadmin";
    }

    if (availableHotels.length > 0) {
      // Check if user has captain data
      return "admin"; // Could be enhanced to detect captain vs admin
    }

    return "user";
  };

  // ✅ NEW: Search hotels
  const searchHotels = (searchTerm) => {
    if (!searchTerm.trim()) return availableHotels;

    const term = searchTerm.toLowerCase();
    return availableHotels.filter(
      (hotel) =>
        hotel.displayName.toLowerCase().includes(term) ||
        hotel.name.toLowerCase().includes(term) ||
        hotel.address.toLowerCase().includes(term)
    );
  };

  const value = {
    // Original functionality
    selectedHotel,
    availableHotels,
    loading,
    user,
    selectHotel,
    fetchUserHotels,
    refreshHotels,

    // ✅ NEW: Enhanced functionality
    error,
    clearSelection,
    getHotelById,
    hasAccessToHotel,
    getHotelOptions,
    isValidSelection,
    getUserRole,
    searchHotels,

    // ✅ NEW: Computed values
    hasHotels: availableHotels.length > 0,
    hotelCount: availableHotels.length,
    hasMultipleHotels: availableHotels.length > 1,
    selectedHotelId: selectedHotel?.id,
    selectedHotelName: selectedHotel?.displayName || selectedHotel?.name,
    userRole: getUserRole(),

    // ✅ NEW: Helper functions
    findCaptainByAuthId,
    getHotelByName,
  };

  return (
    <HotelSelectionContext.Provider value={value}>
      {children}
    </HotelSelectionContext.Provider>
  );
};

// ✅ NEW: Enhanced hook with validation
export const useHotelSelectionWithValidation = () => {
  const context = useHotelSelection();

  const ensureHotelSelected = () => {
    if (!context.selectedHotel) {
      throw new Error("No hotel selected. Please select a hotel first.");
    }
    if (!context.isValidSelection()) {
      throw new Error("Invalid hotel selection. Please select a valid hotel.");
    }
    return context.selectedHotel;
  };

  const withHotelValidation = (callback) => {
    return (...args) => {
      ensureHotelSelected();
      return callback(...args);
    };
  };

  return {
    ...context,
    ensureHotelSelected,
    withHotelValidation,
  };
};

// ✅ NEW: Hook for admin-specific operations
export const useAdminHotelSelection = () => {
  const context = useHotelSelection();

  if (context.userRole !== "admin" && context.userRole !== "superadmin") {
    console.warn("useAdminHotelSelection should only be used by admins");
  }

  return {
    ...context,
    canManageMultipleHotels: context.hasMultipleHotels,
    isAdmin: context.userRole === "admin" || context.userRole === "superadmin",
    isSuperAdmin: context.userRole === "superadmin",
  };
};

export default HotelSelectionProvider;

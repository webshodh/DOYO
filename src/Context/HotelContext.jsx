// src/Context/HotelContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const HotelContext = createContext();

export const useHotelContext = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotelContext must be used within a HotelProvider");
  }
  return context;
};

// ✅ Super admin email constant
const SUPER_ADMIN_EMAIL =
  process.env.REACT_APP_SUPER_ADMIN_EMAIL || "webshodhteam@gmail.com";

export const HotelProvider = ({ children }) => {
  const { currentUser, userRole, loading: authLoading } = useAuth();

  // State management
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NEW: Load all hotels for super admin
  const loadAllHotels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Loading all hotels for super admin...");

      const hotelsRef = collection(db, "hotels");
      const hotelsQuery = query(
        hotelsRef,
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );

      const hotelsSnapshot = await getDocs(hotelsQuery);

      if (hotelsSnapshot.empty) {
        console.log("No hotels found in database");
        setHotels([]);
        return;
      }

      const hotelsData = hotelsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
      }));

      console.log("Loaded hotels for super admin:", hotelsData.length);
      setHotels(hotelsData);
    } catch (error) {
      console.error("Error loading all hotels:", error);
      setError(`Failed to load hotels: ${error.message}`);
      toast.error("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NEW: Load hotels for regular admin
  const loadAdminHotels = useCallback(
    async (adminUid) => {
      if (!adminUid) {
        console.warn("No admin UID provided");
        setHotels([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Loading hotels for admin:", adminUid);

        // ✅ FIX: Get admin document using UID as document ID
        const adminDocRef = doc(db, "admins", adminUid);
        const adminDoc = await getDoc(adminDocRef);

        if (!adminDoc.exists()) {
          console.error("Admin document not found for UID:", adminUid);

          // ✅ FALLBACK: Try to find admin by email query
          const adminsRef = collection(db, "admins");
          const emailQuery = query(
            adminsRef,
            where("email", "==", currentUser.email)
          );
          const emailSnapshot = await getDocs(emailQuery);

          if (emailSnapshot.empty) {
            setError("Admin profile not found. Please contact support.");
            setHotels([]);
            return;
          }

          // Use the found admin document
          const foundAdminDoc = emailSnapshot.docs[0];
          const adminData = foundAdminDoc.data();
          console.log("Found admin by email:", adminData);

          await loadHotelsByAdminData(adminData, foundAdminDoc.id);
          return;
        }

        const adminData = adminDoc.data();
        console.log("Admin data:", adminData);

        await loadHotelsByAdminData(adminData, adminUid);
      } catch (error) {
        console.error("Error loading admin hotels:", error);
        setError(`Failed to load hotels: ${error.message}`);
        toast.error("Failed to load your hotels");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // ✅ NEW: Helper function to load hotels by admin data
  const loadHotelsByAdminData = useCallback(async (adminData, adminUid) => {
    const hotelsRef = collection(db, "hotels");
    let hotelDocs = [];

    // Method 1: Query by adminId field
    console.log("Trying Method 1: Query by adminId");
    const adminIdQuery = query(hotelsRef, where("adminId", "==", adminUid));
    let hotelsSnapshot = await getDocs(adminIdQuery);

    if (!hotelsSnapshot.empty) {
      console.log("Found hotels by adminId:", hotelsSnapshot.docs.length);
      hotelDocs = hotelsSnapshot.docs;
    } else {
      // Method 2: Query by adminUid field
      console.log("Trying Method 2: Query by adminUid");
      const adminUidQuery = query(hotelsRef, where("adminUid", "==", adminUid));
      hotelsSnapshot = await getDocs(adminUidQuery);

      if (!hotelsSnapshot.empty) {
        console.log("Found hotels by adminUid:", hotelsSnapshot.docs.length);
        hotelDocs = hotelsSnapshot.docs;
      } else {
        // Method 3: Query by email
        console.log("Trying Method 3: Query by adminEmail");
        if (adminData.email) {
          const emailQuery = query(
            hotelsRef,
            where("adminEmail", "==", adminData.email)
          );
          hotelsSnapshot = await getDocs(emailQuery);

          if (!hotelsSnapshot.empty) {
            console.log(
              "Found hotels by adminEmail:",
              hotelsSnapshot.docs.length
            );
            hotelDocs = hotelsSnapshot.docs;
          }
        }
      }
    }

    // Method 4: Use managedHotels array if available
    if (
      hotelDocs.length === 0 &&
      adminData.managedHotels &&
      adminData.managedHotels.length > 0
    ) {
      console.log(
        "Trying Method 4: Using managedHotels array:",
        adminData.managedHotels
      );

      const hotelPromises = adminData.managedHotels.map((hotelId) => {
        console.log("Fetching hotel:", hotelId);
        return getDoc(doc(db, "hotels", hotelId));
      });

      const hotelDocsArray = await Promise.all(hotelPromises);
      hotelDocs = hotelDocsArray.filter((doc) => {
        const exists = doc.exists();
        console.log(`Hotel ${doc.id} exists:`, exists);
        return exists;
      });

      console.log("Found hotels from managedHotels:", hotelDocs.length);
    }

    if (hotelDocs.length === 0) {
      console.warn("No hotels found for admin:", adminUid);
      setHotels([]);
      setError("No hotels assigned to your account. Please contact support.");
      return;
    }

    // Convert to hotel objects
    const hotelsData = hotelDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    }));

    console.log("Final processed hotels data:", hotelsData);
    setHotels(hotelsData);
    setError(null);
  }, []);

  // ✅ ENHANCED: Load hotels based on user role
  useEffect(() => {
    const loadHotelsForUser = async () => {
      if (!currentUser || authLoading) {
        console.log("Waiting for auth...");
        setHotels([]);
        return;
      }

      console.log("Loading hotels for user:", {
        uid: currentUser.uid,
        email: currentUser.email,
        role: userRole,
      });

      // Check if super admin
      if (
        currentUser.email === SUPER_ADMIN_EMAIL ||
        userRole === "superadmin"
      ) {
        console.log("User is super admin, loading all hotels");
        await loadAllHotels();
      } else {
        console.log("User is regular admin, loading assigned hotels");
        await loadAdminHotels(currentUser.uid);
      }
    };

    loadHotelsForUser();
  }, [currentUser, authLoading, userRole, loadAllHotels, loadAdminHotels]);

  // ✅ ENHANCED: Persist selected hotel to localStorage
  useEffect(() => {
    const savedHotelId = localStorage.getItem("selectedHotelId");
    if (savedHotelId && hotels.length > 0) {
      const savedHotel = hotels.find(
        (hotel) => hotel.id === savedHotelId || hotel.name === savedHotelId
      );
      if (savedHotel) {
        console.log(
          "Restored selected hotel from storage:",
          savedHotel.businessName
        );
        setSelectedHotel(savedHotel);
      } else if (hotels.length > 0) {
        // Select first hotel if saved hotel not found
        console.log("Saved hotel not found, selecting first hotel");
        setSelectedHotel(hotels[0]);
      }
    } else if (hotels.length > 0 && !selectedHotel) {
      // Auto-select first hotel
      console.log("Auto-selecting first hotel:", hotels[0].businessName);
      setSelectedHotel(hotels[0]);
    }
  }, [hotels, selectedHotel]);

  // ✅ ENHANCED: Save to localStorage when hotel changes
  useEffect(() => {
    if (selectedHotel) {
      localStorage.setItem(
        "selectedHotelId",
        selectedHotel.id || selectedHotel.name
      );
      console.log(
        "Saved selected hotel to storage:",
        selectedHotel.businessName
      );
    }
  }, [selectedHotel]);

  // ✅ ENHANCED: Refresh hotels function
  const refreshHotels = useCallback(async () => {
    console.log("Refreshing hotels...");

    if (!currentUser) {
      console.log("No current user, cannot refresh hotels");
      return;
    }

    if (currentUser.email === SUPER_ADMIN_EMAIL || userRole === "superadmin") {
      await loadAllHotels();
    } else {
      await loadAdminHotels(currentUser.uid);
    }
  }, [currentUser, userRole, loadAllHotels, loadAdminHotels]);

  // Set hotels list + default selection (first hotel)
  const updateHotels = useCallback((hotelList) => {
    console.log("Updating hotels list:", hotelList?.length || 0);
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
  }, []);

  const clearSelection = useCallback(() => {
    console.log("Clearing hotel selection");
    setHotels([]);
    setSelectedHotel(null);
    setError(null);
    localStorage.removeItem("selectedHotelId");
  }, []);

  // ✅ NEW: Select hotel by ID or name
  const selectHotelById = useCallback(
    (hotelId) => {
      const hotel = hotels.find((h) => h.id === hotelId || h.name === hotelId);
      if (hotel) {
        console.log("Selected hotel by ID:", hotel.businessName);
        setSelectedHotel(hotel);
        return true;
      }
      console.warn("Hotel not found:", hotelId);
      return false;
    },
    [hotels]
  );

  // ✅ NEW: Get hotel by ID or name
  const getHotelById = useCallback(
    (hotelId) => {
      return hotels.find((h) => h.id === hotelId || h.name === hotelId);
    },
    [hotels]
  );

  // ✅ NEW: Check if user has access to specific hotel
  const hasAccessToHotel = useCallback(
    (hotelId) => {
      if (userRole === "superadmin" || currentUser?.email === SUPER_ADMIN_EMAIL)
        return true;
      return hotels.some((h) => h.id === hotelId || h.name === hotelId);
    },
    [userRole, currentUser, hotels]
  );

  // ✅ NEW: Get hotel names for dropdowns/selects
  const getHotelOptions = useCallback(() => {
    return hotels.map((hotel) => ({
      value: hotel.id || hotel.name,
      label: hotel.businessName || hotel.hotelName || hotel.name,
      hotel: hotel,
    }));
  }, [hotels]);

  // ✅ NEW: Switch to next/previous hotel (useful for navigation)
  const switchToNextHotel = useCallback(() => {
    if (hotels.length <= 1) return false;

    const currentIndex = hotels.findIndex(
      (h) => h.id === selectedHotel?.id || h.name === selectedHotel?.name
    );

    const nextIndex = (currentIndex + 1) % hotels.length;
    setSelectedHotel(hotels[nextIndex]);
    return true;
  }, [hotels, selectedHotel]);

  const switchToPreviousHotel = useCallback(() => {
    if (hotels.length <= 1) return false;

    const currentIndex = hotels.findIndex(
      (h) => h.id === selectedHotel?.id || h.name === selectedHotel?.name
    );

    const prevIndex = currentIndex === 0 ? hotels.length - 1 : currentIndex - 1;
    setSelectedHotel(hotels[prevIndex]);
    return true;
  }, [hotels, selectedHotel]);

  // ✅ NEW: Validate hotel selection
  const isValidHotelSelected = useCallback(() => {
    return (
      selectedHotel &&
      hotels.some(
        (h) => h.id === selectedHotel.id || h.name === selectedHotel.name
      )
    );
  }, [selectedHotel, hotels]);

  // ✅ NEW: Get current hotel's full path for Firestore operations
  const getCurrentHotelPath = useCallback(() => {
    if (!selectedHotel) return null;
    return selectedHotel.name || selectedHotel.id;
  }, [selectedHotel]);

  // ✅ NEW: Get hotel display name
  const getHotelDisplayName = useCallback(
    (hotel = selectedHotel) => {
      if (!hotel) return "";
      return hotel.businessName || hotel.hotelName || hotel.name || hotel.id;
    },
    [selectedHotel]
  );

  // ✅ NEW: Search/filter hotels
  const searchHotels = useCallback(
    (searchTerm) => {
      if (!searchTerm.trim()) return hotels;

      const term = searchTerm.toLowerCase();
      return hotels.filter(
        (hotel) =>
          (hotel.name || "").toLowerCase().includes(term) ||
          (hotel.businessName || "").toLowerCase().includes(term) ||
          (hotel.hotelName || "").toLowerCase().includes(term) ||
          (hotel.address || "").toLowerCase().includes(term)
      );
    },
    [hotels]
  );

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
    error,
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

    // ✅ NEW: Data loading functions
    loadAllHotels,
    loadAdminHotels,

    // ✅ NEW: Computed values
    hasHotels: hotels.length > 0,
    hotelCount: hotels.length,
    hasMultipleHotels: hotels.length > 1,
    selectedHotelId: selectedHotel?.id || selectedHotel?.name,
    selectedHotelName: getHotelDisplayName(),

    // ✅ NEW: Role-based helpers
    canManageMultipleHotels:
      userRole === "superadmin" ||
      currentUser?.email === SUPER_ADMIN_EMAIL ||
      (userRole === "admin" && hotels.length > 1),
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

// ✅ NEW: Custom hook for multi-hotel operations
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

  const { userRole, currentUser } = useAuth();

  return {
    hotels,
    getHotelOptions,
    hasMultipleHotels,
    canManageMultipleHotels,
    switchToNextHotel,
    switchToPreviousHotel,
    searchHotels,
    isSuperAdmin:
      userRole === "superadmin" || currentUser?.email === SUPER_ADMIN_EMAIL,
  };
};

export default HotelProvider;

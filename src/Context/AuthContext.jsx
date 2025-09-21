// src/Context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();

// Define super admin email list
const SUPER_ADMIN_EMAILS = [
  "superadmin1@example.com",
  "superadmin2@example.com", 
  "admin@company.com",
  "webshodhteam@gmail.com", // Your main super admin email
  // Add more super admin emails as needed
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthError(null);

      if (user) {
        try {
          setCurrentUser(user);

          const userEmail = user.email.toLowerCase();
          let role = "user";
          let hotels = [];

          if (SUPER_ADMIN_EMAILS.includes(userEmail)) {
            // Super admin - can access all hotels
            role = "superadmin";
            hotels = await getAllHotels();
          } else {
            // Check if user is a hotel admin
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              role = "admin";
              
              // ✅ IMPROVED: Get hotels from admin's hotels object (matching your hotel services structure)
              const hotelData = adminData.hotels || {};
              hotels = await getHotelsByNames(Object.keys(hotelData));
            } else {
              // ✅ IMPROVED: Check if user is a captain in any hotel (matching your captain services structure)
              const captainData = await findCaptainByAuthId(user.uid);
              if (captainData) {
                role = "captain";
                const hotel = await getHotelByName(captainData.hotelName);
                if (hotel) {
                  hotels = [hotel];
                }
              }
              // If neither admin nor captain, keep as "user" with no hotels
            }
          }

          setUserRole(role);
          setUserHotels(hotels);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthError("Failed to load user data");
          setCurrentUser(null);
          setUserRole(null);
          setUserHotels([]);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setUserRole(null);
        setUserHotels([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ IMPROVED: Helper function to get all hotels (matching your hotel structure)
  const getAllHotels = async () => {
    try {
      const hotelsSnapshot = await getDocs(collection(db, "hotels"));
      const hotels = [];
      
      for (const hotelDoc of hotelsSnapshot.docs) {
        const hotelName = hotelDoc.id;
        const infoDoc = await getDoc(doc(db, `hotels/${hotelName}/info`));
        
        if (infoDoc.exists()) {
          hotels.push({
            id: hotelName,
            name: hotelName,
            ...infoDoc.data(),
          });
        }
      }
      
      return hotels;
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return [];
    }
  };

  // ✅ NEW: Helper function to get hotels by hotel names (not IDs)
  const getHotelsByNames = async (hotelNames) => {
    try {
      const hotels = [];
      for (const hotelName of hotelNames) {
        const hotel = await getHotelByName(hotelName);
        if (hotel) {
          hotels.push(hotel);
        }
      }
      return hotels;
    } catch (error) {
      console.error("Error fetching hotels by names:", error);
      return [];
    }
  };

  // ✅ IMPROVED: Helper function to get single hotel by name (matching your structure)
  const getHotelByName = async (hotelName) => {
    try {
      const hotelDoc = await getDoc(doc(db, `hotels/${hotelName}/info`));
      if (hotelDoc.exists()) {
        return {
          id: hotelName,
          name: hotelName,
          ...hotelDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching hotel by name:", error);
      return null;
    }
  };

  // ✅ NEW: Helper function to find captain by Firebase Auth ID (matching captain services)
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
      console.error("Error finding captain by auth ID:", error);
      return null;
    }
  };

  // ✅ DEPRECATED: Keep for backward compatibility but not used
  const getHotelsByIds = async (hotelIds) => {
    console.warn("getHotelsByIds is deprecated, use getHotelsByNames instead");
    return getHotelsByNames(hotelIds);
  };

  // ✅ DEPRECATED: Keep for backward compatibility but not used  
  const getHotelById = async (hotelId) => {
    console.warn("getHotelById is deprecated, use getHotelByName instead");
    return getHotelByName(hotelId);
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserHotels([]);
      setAuthError(null);
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError("Failed to logout");
      throw error;
    }
  };

  // Role checking functions
  const isSuperAdmin = () => userRole === "superadmin";
  const isAdmin = () => userRole === "admin" || userRole === "superadmin";
  const isCaptain = () => userRole === "captain";
  const isAuthenticated = () => !!currentUser;

  const canAccessHotel = (hotelIdentifier) => {
    if (userRole === "superadmin") return true;
    if (userRole === "admin" || userRole === "captain") {
      return userHotels.some(
        (hotel) => hotel.id === hotelIdentifier || 
                  hotel.name === hotelIdentifier ||
                  hotel === hotelIdentifier
      );
    }
    return false;
  };

  // ✅ IMPROVED: Function to create hotel and admin (matching hotel services structure)
  const createHotelWithAdmin = async (hotelData, adminData) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can create hotels and admins");
    }

    try {
      // 1. Create admin user with Firebase Auth
      const adminUserCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );

      const adminId = adminUserCredential.user.uid;
      const hotelName = hotelData.name;

      // 2. Create hotel info document (matching your hotel services structure)
      await setDoc(doc(db, `hotels/${hotelName}/info`), {
        uuid: hotelData.uuid || `hotel_${Date.now()}`,
        hotelName: hotelName,
        businessName: hotelData.businessName || hotelName,
        address: hotelData.address || "",
        phone: hotelData.phone || "",
        email: hotelData.email || "",
        admin: {
          adminId: adminId,
          name: adminData.name,
          email: adminData.email,
          contact: adminData.phone || "",
          role: "admin",
          assignedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
        status: "active",
      });

      // 3. Store admin details in Firestore (matching your admin structure)
      await setDoc(doc(db, "admins", adminId), {
        name: adminData.name,
        email: adminData.email,
        contact: adminData.phone || "",
        role: "admin",
        hotels: {
          [hotelName]: {
            hotelName: hotelName,
            hotelUuid: hotelData.uuid || `hotel_${Date.now()}`,
            assignedAt: serverTimestamp(),
          }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });

      return {
        hotel: { 
          id: hotelName, 
          name: hotelName,
          ...hotelData 
        },
        admin: { 
          id: adminId, 
          ...adminData 
        },
      };
    } catch (error) {
      console.error("Error creating hotel and admin:", error);
      throw error;
    }
  };

  // ✅ IMPROVED: Function to assign hotel to admin (matching your admin structure)
  const assignHotelToAdmin = async (adminId, hotelName) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can assign hotels to admins");
    }

    try {
      // Get hotel info to get UUID
      const hotelDoc = await getDoc(doc(db, `hotels/${hotelName}/info`));
      if (!hotelDoc.exists()) {
        throw new Error("Hotel not found");
      }

      const hotelData = hotelDoc.data();
      const adminRef = doc(db, "admins", adminId);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const currentHotels = adminData.hotels || {};
        
        // Add hotel to admin's hotels object
        const updatedHotels = {
          ...currentHotels,
          [hotelName]: {
            hotelName: hotelName,
            hotelUuid: hotelData.uuid,
            assignedAt: serverTimestamp(),
          }
        };

        await updateDoc(adminRef, {
          hotels: updatedHotels,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid,
        });
      } else {
        throw new Error("Admin not found");
      }
    } catch (error) {
      console.error("Error assigning hotel to admin:", error);
      throw error;
    }
  };

  // Function to refresh user hotels
  const refreshUserHotels = async () => {
    if (!currentUser) return;

    try {
      let hotels = [];

      if (userRole === "superadmin") {
        hotels = await getAllHotels();
      } else if (userRole === "admin") {
        const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          const hotelNames = Object.keys(adminData.hotels || {});
          hotels = await getHotelsByNames(hotelNames);
        }
      } else if (userRole === "captain") {
        const captainData = await findCaptainByAuthId(currentUser.uid);
        if (captainData && captainData.hotelName) {
          const hotel = await getHotelByName(captainData.hotelName);
          if (hotel) {
            hotels = [hotel];
          }
        }
      }

      setUserHotels(hotels);
      return hotels;
    } catch (error) {
      console.error("Error refreshing user hotels:", error);
      return [];
    }
  };

  // ✅ NEW: Get current user's captain data (if they are a captain)
  const getCurrentCaptainData = async () => {
    if (userRole !== "captain" || !currentUser) return null;
    return await findCaptainByAuthId(currentUser.uid);
  };

  // ✅ NEW: Check if user can manage specific hotel (more granular than canAccessHotel)
  const canManageHotel = (hotelName) => {
    if (userRole === "superadmin") return true;
    if (userRole === "admin") {
      return userHotels.some(hotel => 
        hotel.name === hotelName || hotel.id === hotelName
      );
    }
    return false;
  };

  const value = {
    currentUser,
    userRole,
    userHotels,
    loading,
    authError,
    login,
    logout,
    isSuperAdmin,
    isAdmin,
    isCaptain,
    isAuthenticated,
    canAccessHotel,
    canManageHotel, // ✅ NEW
    createHotelWithAdmin,
    assignHotelToAdmin,
    refreshUserHotels,
    getCurrentCaptainData, // ✅ NEW
    // Helper functions for other components
    findCaptainByAuthId,
    getHotelByName,
    getAllHotels,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ✅ NEW: Additional hook for captain-specific functionality
export const useCaptainAuth = () => {
  const { userRole, getCurrentCaptainData, ...otherAuth } = useAuth();
  
  if (userRole !== "captain") {
    console.warn("useCaptainAuth should only be used by captains");
  }

  return {
    ...otherAuth,
    userRole,
    isCaptain: userRole === "captain",
    getCurrentCaptainData,
  };
};

// ✅ NEW: Additional hook for admin-specific functionality
export const useAdminAuth = () => {
  const { userRole, isAdmin, canManageHotel, ...otherAuth } = useAuth();
  
  if (!isAdmin()) {
    console.warn("useAdminAuth should only be used by admins");
  }

  return {
    ...otherAuth,
    userRole,
    isAdmin: isAdmin(),
    canManageHotel,
  };
};

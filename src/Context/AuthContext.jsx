import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../data/firebase/firebaseConfig";
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
} from "firebase/firestore";

const AuthContext = createContext();

// Define super admin email list
const SUPER_ADMIN_EMAILS = [
  "superadmin1@example.com",
  "superadmin2@example.com",
  "admin@company.com",
  "webshodhteam@gmail.com", // Added the existing super admin email
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
              hotels = adminData.assignedHotels || [];

              // If assignedHotels contains IDs, fetch hotel details
              if (hotels.length > 0 && typeof hotels[0] === "string") {
                hotels = await getHotelsByIds(hotels);
              }
            } else {
              // Check if user is a captain
              const captainDoc = await getDoc(doc(db, "captains", user.uid));
              if (captainDoc.exists()) {
                const captainData = captainDoc.data();
                role = "captain";
                // For captains, get the hotel they're assigned to
                if (captainData.hotelId) {
                  const hotel = await getHotelById(captainData.hotelId);
                  if (hotel) {
                    hotels = [hotel];
                  }
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

  // Helper function to get all hotels (for super admin)
  const getAllHotels = async () => {
    try {
      const hotelsSnapshot = await getDocs(collection(db, "hotels"));
      return hotelsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return [];
    }
  };

  // Helper function to get hotels by IDs
  const getHotelsByIds = async (hotelIds) => {
    try {
      const hotels = [];
      for (const hotelId of hotelIds) {
        const hotelDoc = await getDoc(doc(db, "hotels", hotelId));
        if (hotelDoc.exists()) {
          hotels.push({
            id: hotelDoc.id,
            ...hotelDoc.data(),
          });
        }
      }
      return hotels;
    } catch (error) {
      console.error("Error fetching hotels by IDs:", error);
      return [];
    }
  };

  // Helper function to get single hotel by ID
  const getHotelById = async (hotelId) => {
    try {
      const hotelDoc = await getDoc(doc(db, "hotels", hotelId));
      if (hotelDoc.exists()) {
        return {
          id: hotelDoc.id,
          ...hotelDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching hotel by ID:", error);
      return null;
    }
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

  const canAccessHotel = (hotelId) => {
    if (userRole === "superadmin") return true;
    if (userRole === "admin" || userRole === "captain") {
      return userHotels.some(
        (hotel) => hotel.id === hotelId || hotel === hotelId
      );
    }
    return false;
  };

  // Function to create hotel and admin (super admin only)
  const createHotelWithAdmin = async (hotelData, adminData) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can create hotels and admins");
    }

    try {
      // 1. Create the hotel in Firestore
      const hotelRef = await addDoc(collection(db, "hotels"), {
        name: hotelData.name,
        address: hotelData.address,
        phone: hotelData.phone,
        email: hotelData.email,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        active: true,
      });

      // 2. Create admin user with Firebase Auth
      const adminUserCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );

      // 3. Store admin details in Firestore
      await setDoc(doc(db, "admins", adminUserCredential.user.uid), {
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: "admin",
        assignedHotels: [hotelRef.id],
        createdAt: new Date(),
        createdBy: currentUser.uid,
        active: true,
      });

      return {
        hotel: { id: hotelRef.id, ...hotelData },
        admin: { id: adminUserCredential.user.uid, ...adminData },
      };
    } catch (error) {
      console.error("Error creating hotel and admin:", error);
      throw error;
    }
  };

  // Function to assign hotel to admin (super admin only)
  const assignHotelToAdmin = async (adminId, hotelId) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can assign hotels to admins");
    }

    try {
      const adminRef = doc(db, "admins", adminId);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const currentHotels = adminDoc.data().assignedHotels || [];
        if (!currentHotels.includes(hotelId)) {
          await updateDoc(adminRef, {
            assignedHotels: [...currentHotels, hotelId],
            updatedAt: new Date(),
            updatedBy: currentUser.uid,
          });
        }
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
          const hotelIds = adminData.assignedHotels || [];
          hotels = await getHotelsByIds(hotelIds);
        }
      } else if (userRole === "captain") {
        const captainDoc = await getDoc(doc(db, "captains", currentUser.uid));
        if (captainDoc.exists()) {
          const captainData = captainDoc.data();
          if (captainData.hotelId) {
            const hotel = await getHotelById(captainData.hotelId);
            if (hotel) {
              hotels = [hotel];
            }
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
    createHotelWithAdmin,
    assignHotelToAdmin,
    refreshUserHotels,
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

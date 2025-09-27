// Updated AuthContext with Enhanced Admin System - context/AuthContext.js

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
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();

// Define super admin email list
const SUPER_ADMIN_EMAILS = [
  "superadmin1@example.com",
  "superadmin2@example.com",
  "admin@company.com",
  "webshodhteam@gmail.com", // Your existing super admin email
  // Add more super admin emails as needed
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [adminData, setAdminData] = useState(null); // Enhanced admin data

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthError(null);

      if (user) {
        try {
          setCurrentUser(user);
          console.log("Auth state changed - user found:", user.uid);

          const userEmail = user.email.toLowerCase();
          let role = "user";
          let hotels = [];
          let adminInfo = null;

          // Check if user is in super admin emails list
          if (SUPER_ADMIN_EMAILS.includes(userEmail)) {
            console.log("User is super admin via email list");
            role = "superadmin";
            hotels = await getAllHotels();

            // Create/update super admin record in enhanced admin system
            adminInfo = await ensureSuperAdminRecord(user);
          } else {
            // Check enhanced admin system first
            try {
              adminInfo = await getAdminByFirebaseUid(user.uid);

              if (adminInfo) {
                console.log("User found in enhanced admin system:", adminInfo);

                // Map enhanced admin roles to existing role system
                if (adminInfo.role === "super_admin") {
                  role = "superadmin";
                  hotels = await getAllHotels();
                } else {
                  role = "admin";

                  // Get hotels for this admin
                  if (adminInfo.linkedHotelId) {
                    const hotel = await getHotelById(adminInfo.linkedHotelId);
                    if (hotel) {
                      hotels = [hotel];
                    }
                  }
                }
              } else {
                // Fallback to old admin system
                console.log("Checking old admin system...");
                const adminDoc = await getDoc(doc(db, "admins", user.uid));

                if (adminDoc.exists()) {
                  const oldAdminData = adminDoc.data();
                  console.log("User found in old admin system:", oldAdminData);

                  role = "admin";
                  hotels = oldAdminData.assignedHotels || [];

                  // If assignedHotels contains IDs, fetch hotel details
                  if (hotels.length > 0 && typeof hotels[0] === "string") {
                    hotels = await getHotelsByIds(hotels);
                  }

                  // Auto-migrate to enhanced system on login
                  adminInfo = await migrateOldAdminToEnhanced(
                    user,
                    oldAdminData
                  );
                } else {
                  // Check if user is a captain
                  const captainDoc = await getDoc(
                    doc(db, "captains", user.uid)
                  );
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
            } catch (error) {
              console.error("Error checking enhanced admin system:", error);
              // Continue with old system check
            }
          }

          setUserRole(role);
          setUserHotels(hotels);
          setAdminData(adminInfo);

          console.log("User authentication complete:", {
            role,
            hotelsCount: hotels.length,
            hasAdminData: !!adminInfo,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthError("Failed to load user data");
          setCurrentUser(null);
          setUserRole(null);
          setUserHotels([]);
          setAdminData(null);
        }
      } else {
        // User is signed out
        console.log("No authenticated user");
        setCurrentUser(null);
        setUserRole(null);
        setUserHotels([]);
        setAdminData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get admin by Firebase UID (enhanced system)
  const getAdminByFirebaseUid = async (firebaseUid) => {
    try {
      const q = query(
        collection(db, "admins"),
        where("firebaseUid", "==", firebaseUid)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const adminDoc = snapshot.docs[0];
      const adminData = adminDoc.data();

      // Get hotel info if linked
      if (adminData.linkedHotelId) {
        const hotelInfo = await getHotelInfo(adminData.linkedHotelId);
        adminData.hotelInfo = hotelInfo;
      }

      return {
        ...adminData,
        adminId: adminDoc.id,
      };
    } catch (error) {
      console.error("Error getting admin by Firebase UID:", error);
      return null;
    }
  };

  // Get hotel info for enhanced admin system
  const getHotelInfo = async (hotelId) => {
    try {
      const hotelDoc = await getDoc(doc(db, "hotels", hotelId));

      if (!hotelDoc.exists()) {
        return null;
      }

      const hotelData = hotelDoc.data();
      return {
        hotelId,
        businessName: hotelData.businessName || hotelData.name,
        status: hotelData.status || (hotelData.active ? "active" : "inactive"),
        businessType: hotelData.businessType,
        city: hotelData.city,
        state: hotelData.state,
      };
    } catch (error) {
      console.error("Error getting hotel info:", error);
      return null;
    }
  };

  // Ensure super admin record exists in enhanced system
  const ensureSuperAdminRecord = async (user) => {
    try {
      let adminInfo = await getAdminByEmail(user.email);

      if (!adminInfo) {
        console.log("Creating super admin record in enhanced system");

        // Create super admin record
        const superAdminData = {
          fullName: user.displayName || "Super Admin",
          email: user.email,
          firebaseUid: user.uid,
          role: "super_admin",
          status: "active",
          permissions: {
            canManageMenu: true,
            canManageOrders: true,
            canManageCaptains: true,
            canViewReports: true,
            canManageCategories: true,
            canManageStaff: true,
            canAccessSettings: true,
            canManageInventory: true,
          },
          createdAt: serverTimestamp(),
          isActive: true,
        };

        const adminRef = await addDoc(collection(db, "admins"), superAdminData);
        await updateDoc(adminRef, { adminId: adminRef.id });

        adminInfo = await getAdminByFirebaseUid(user.uid);
      }

      return adminInfo;
    } catch (error) {
      console.error("Error ensuring super admin record:", error);
      return null;
    }
  };

  // Get admin by email
  const getAdminByEmail = async (email) => {
    try {
      const q = query(collection(db, "admins"), where("email", "==", email));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const adminDoc = snapshot.docs[0];
      const adminData = adminDoc.data();

      // Get hotel info if linked
      if (adminData.linkedHotelId) {
        const hotelInfo = await getHotelInfo(adminData.linkedHotelId);
        adminData.hotelInfo = hotelInfo;
      }

      return {
        ...adminData,
        adminId: adminDoc.id,
      };
    } catch (error) {
      console.error("Error getting admin by email:", error);
      return null;
    }
  };

  // Migrate old admin to enhanced system
  const migrateOldAdminToEnhanced = async (user, oldAdminData) => {
    try {
      console.log("Migrating old admin to enhanced system:", oldAdminData);

      const enhancedAdminData = {
        fullName: oldAdminData.name || user.displayName || "Admin User",
        email: user.email,
        phone: oldAdminData.phone || null,
        firebaseUid: user.uid,
        role: "admin",
        status: oldAdminData.active ? "active" : "inactive",
        linkedHotelId: oldAdminData.assignedHotels?.[0] || null, // Take first hotel
        permissions: {
          canManageMenu: true,
          canManageOrders: true,
          canManageCaptains: true,
          canViewReports: true,
          canManageCategories: true,
          canManageStaff: false,
          canAccessSettings: false,
          canManageInventory: false,
        },
        createdAt: oldAdminData.createdAt || serverTimestamp(),
        isActive: oldAdminData.active || true,
        // Migration metadata
        migratedFrom: "oldAdminSystem",
        migratedAt: serverTimestamp(),
      };

      const adminRef = await addDoc(
        collection(db, "admins"),
        enhancedAdminData
      );
      await updateDoc(adminRef, { adminId: adminRef.id });

      console.log("Migration completed for admin:", adminRef.id);
      return await getAdminByFirebaseUid(user.uid);
    } catch (error) {
      console.error("Error migrating old admin:", error);
      return null;
    }
  };

  // Helper function to get all hotels (for super admin)
  const getAllHotels = async () => {
    try {
      const hotelsSnapshot = await getDocs(collection(db, "hotels"));
      return hotelsSnapshot.docs.map((doc) => ({
        id: doc.id,
        hotelId: doc.id, // Add hotelId for consistency
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
            hotelId: hotelDoc.id,
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
          hotelId: hotelDoc.id,
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

      // Enhanced login with improved error handling
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful for:", email);
      return result;
    } catch (error) {
      console.error("Login error:", error);

      // Enhanced error messages
      let errorMessage = "Login failed. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      setAuthError(errorMessage);
      throw new Error(errorMessage);
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
      setAdminData(null);
      setAuthError(null);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError("Failed to logout");
      throw error;
    }
  };

  // Enhanced role checking functions
  const isSuperAdmin = () => {
    return userRole === "superadmin" || adminData?.role === "super_admin";
  };

  const isAdmin = () => {
    return (
      userRole === "admin" ||
      userRole === "superadmin" ||
      adminData?.role === "admin" ||
      adminData?.role === "super_admin"
    );
  };

  const isCaptain = () => userRole === "captain";
  const isAuthenticated = () => !!currentUser;

  const canAccessHotel = (hotelId) => {
    if (isSuperAdmin()) return true;

    if (userRole === "admin" || userRole === "captain") {
      return userHotels.some(
        (hotel) =>
          hotel.id === hotelId || hotel.hotelId === hotelId || hotel === hotelId
      );
    }

    // Check enhanced admin system
    if (adminData?.linkedHotelId === hotelId) return true;

    return false;
  };

  // Check if user has specific permission (enhanced admin system)
  const hasPermission = (permission) => {
    if (isSuperAdmin()) return true;
    if (!adminData?.permissions) return false;
    return adminData.permissions[permission] || false;
  };

  // Enhanced hotel creation using new admin system
  const createHotelWithAdmin = async (hotelData, adminData) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can create hotels and admins");
    }

    try {
      console.log("Creating hotel with admin via enhanced system...");

      // 1. Create the hotel in Firestore with enhanced structure
      const hotelRef = await addDoc(collection(db, "hotels"), {
        businessName: hotelData.businessName || hotelData.name,
        hotelName: hotelData.hotelName || hotelData.name,
        name: hotelData.name, // Keep for backward compatibility
        address: hotelData.address,
        phone: hotelData.phone,
        email: hotelData.email,
        city: hotelData.city,
        state: hotelData.state,
        businessType: hotelData.businessType || "restaurant",
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        isActive: true,
        active: true, // Keep for backward compatibility
        status: "active",
        metrics: {
          totalAdmins: 0,
          totalMenuItems: 0,
          totalOrders: 0,
        },
      });

      const hotelId = hotelRef.id;
      await updateDoc(hotelRef, { hotelId });

      // 2. Create admin with Firebase Auth (enhanced system)
      const adminUserCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );

      // 3. Store admin details in enhanced admin system
      const enhancedAdminData = {
        fullName: adminData.fullName || adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        firebaseUid: adminUserCredential.user.uid,
        role: "admin",
        status: "active",
        linkedHotelId: hotelId,
        permissions: {
          canManageMenu: true,
          canManageOrders: true,
          canManageCaptains: true,
          canViewReports: true,
          canManageCategories: true,
          canManageStaff: false,
          canAccessSettings: false,
          canManageInventory: false,
        },
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        isActive: true,
        forcePasswordChange: true,
      };

      const newAdminRef = await addDoc(
        collection(db, "admins"),
        enhancedAdminData
      );
      await updateDoc(newAdminRef, { adminId: newAdminRef.id });

      // 4. Also create in old system for backward compatibility
      await setDoc(doc(db, "admins", adminUserCredential.user.uid), {
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        role: "admin",
        assignedHotels: [hotelRef.id],
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        active: true,
      });

      console.log("Hotel and admin created successfully");

      // Refresh user hotels if current user is super admin
      await refreshUserHotels();

      return {
        hotel: { id: hotelId, hotelId, ...hotelData },
        admin: {
          id: adminUserCredential.user.uid,
          adminId: newAdminRef.id,
          ...adminData,
        },
      };
    } catch (error) {
      console.error("Error creating hotel and admin:", error);
      throw error;
    }
  };

  // Function to assign hotel to admin (enhanced system)
  const assignHotelToAdmin = async (adminId, hotelId) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can assign hotels to admins");
    }

    try {
      // Update in enhanced admin system
      const enhancedAdminQuery = query(
        collection(db, "admins"),
        where("firebaseUid", "==", adminId)
      );

      const enhancedSnapshot = await getDocs(enhancedAdminQuery);

      if (!enhancedSnapshot.empty) {
        const enhancedAdminRef = enhancedSnapshot.docs[0].ref;
        await updateDoc(enhancedAdminRef, {
          linkedHotelId: hotelId,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid,
        });
      }

      // Update in old system for backward compatibility
      const adminRef = doc(db, "admins", adminId);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const currentHotels = adminDoc.data().assignedHotels || [];
        if (!currentHotels.includes(hotelId)) {
          await updateDoc(adminRef, {
            assignedHotels: [...currentHotels, hotelId],
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid,
          });
        }
      } else {
        throw new Error("Admin not found");
      }

      console.log("Hotel assigned to admin successfully");
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

      if (isSuperAdmin()) {
        hotels = await getAllHotels();
      } else if (adminData?.linkedHotelId) {
        // Enhanced admin system - get linked hotel
        const hotel = await getHotelById(adminData.linkedHotelId);
        if (hotel) {
          hotels = [hotel];
        }
      } else if (userRole === "admin") {
        // Old admin system fallback
        const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
        if (adminDoc.exists()) {
          const oldAdminData = adminDoc.data();
          const hotelIds = oldAdminData.assignedHotels || [];
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
      console.log("User hotels refreshed:", hotels.length);
      return hotels;
    } catch (error) {
      console.error("Error refreshing user hotels:", error);
      return [];
    }
  };

  // Get redirect path based on user role and hotel assignment
  const getRedirectPath = () => {
    if (isSuperAdmin()) {
      return "/super-admin/dashboard";
    } else if (adminData?.linkedHotelId && adminData.hotelInfo) {
      // Redirect to hotel-specific admin dashboard
      const hotelSlug =
        adminData.hotelInfo.businessName
          ?.toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "_") || adminData.linkedHotelId;
      return `/${hotelSlug}/admin/dashboard`;
    } else if (userHotels.length > 0) {
      // Fallback to first hotel
      const hotelSlug = (
        userHotels[0].businessName ||
        userHotels[0].name ||
        userHotels[0].id
      )
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "_");
      return `/${hotelSlug}/admin/dashboard`;
    } else {
      return "/admin/dashboard";
    }
  };

  const value = {
    // Original properties
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

    // Enhanced properties for new admin system
    adminData,
    hasPermission,
    getRedirectPath,

    // User info shortcuts
    linkedHotelId: adminData?.linkedHotelId,
    hotelInfo: adminData?.hotelInfo,
    permissions: adminData?.permissions || {},

    // Role shortcuts for enhanced system
    isEnhancedAdmin: !!adminData,
    userPermissions: adminData?.permissions || {},
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

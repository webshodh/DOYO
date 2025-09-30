import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
  "webshodhteam@gmail.com",
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // Ref to prevent multiple simultaneous refreshes
  const isRefreshing = useRef(false);

  // Helper function to get all hotels (for super admin)
  const getAllHotels = useCallback(async () => {
    try {
      const hotelsSnapshot = await getDocs(collection(db, "hotels"));
      return hotelsSnapshot.docs.map((doc) => ({
        id: doc.id,
        hotelId: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return [];
    }
  }, []);

  // Helper function to get hotels by IDs
  const getHotelsByIds = useCallback(async (hotelIds) => {
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
  }, []);

  // Helper function to get single hotel by ID
  const getHotelById = useCallback(async (hotelId) => {
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
  }, []);

  // Get hotel info for enhanced admin system
  const getHotelInfo = useCallback(async (hotelId) => {
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
  }, []);

  // Get admin by Firebase UID (enhanced system)
  const getAdminByFirebaseUid = useCallback(
    async (firebaseUid) => {
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
    },
    [getHotelInfo]
  );

  // Get admin by email
  const getAdminByEmail = useCallback(
    async (email) => {
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
    },
    [getHotelInfo]
  );

  // Ensure super admin record exists in enhanced system
  const ensureSuperAdminRecord = useCallback(
    async (user) => {
      try {
        let adminInfo = await getAdminByEmail(user.email);

        if (!adminInfo) {
          console.log("Creating super admin record in enhanced system");

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

          const adminRef = await addDoc(
            collection(db, "admins"),
            superAdminData
          );
          await updateDoc(adminRef, { adminId: adminRef.id });

          adminInfo = await getAdminByFirebaseUid(user.uid);
        }

        return adminInfo;
      } catch (error) {
        console.error("Error ensuring super admin record:", error);
        return null;
      }
    },
    [getAdminByEmail, getAdminByFirebaseUid]
  );

  // Migrate old admin to enhanced system
  const migrateOldAdminToEnhanced = useCallback(
    async (user, oldAdminData) => {
      try {
        console.log("Migrating old admin to enhanced system:", oldAdminData);

        const enhancedAdminData = {
          fullName: oldAdminData.name || user.displayName || "Admin User",
          email: user.email,
          phone: oldAdminData.phone || null,
          firebaseUid: user.uid,
          role: "admin",
          status: oldAdminData.active ? "active" : "inactive",
          linkedHotelId: oldAdminData.assignedHotels?.[0] || null,
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
    },
    [getAdminByFirebaseUid]
  );

  // Main auth state change effect
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
            adminInfo = await ensureSuperAdminRecord(user);
          } else {
            // Check enhanced admin system first
            try {
              adminInfo = await getAdminByFirebaseUid(user.uid);

              if (adminInfo) {
                console.log("User found in enhanced admin system:", adminInfo);

                if (adminInfo.role === "super_admin") {
                  role = "superadmin";
                  hotels = await getAllHotels();
                } else {
                  role = "admin";

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

                  if (hotels.length > 0 && typeof hotels[0] === "string") {
                    hotels = await getHotelsByIds(hotels);
                  }

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

                    if (captainData.hotelId) {
                      const hotel = await getHotelById(captainData.hotelId);
                      if (hotel) {
                        hotels = [hotel];
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error checking enhanced admin system:", error);
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
        console.log("No authenticated user");
        setCurrentUser(null);
        setUserRole(null);
        setUserHotels([]);
        setAdminData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [
    getAllHotels,
    getHotelById,
    getHotelsByIds,
    getAdminByFirebaseUid,
    ensureSuperAdminRecord,
    migrateOldAdminToEnhanced,
  ]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful for:", email);
      return result;
    } catch (error) {
      console.error("Login error:", error);

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
  const isSuperAdmin = useCallback(() => {
    return userRole === "superadmin" || adminData?.role === "super_admin";
  }, [userRole, adminData]);

  const isAdmin = useCallback(() => {
    return (
      userRole === "admin" ||
      userRole === "superadmin" ||
      adminData?.role === "admin" ||
      adminData?.role === "super_admin"
    );
  }, [userRole, adminData]);

  const isCaptain = useCallback(() => userRole === "captain", [userRole]);

  const isAuthenticated = useCallback(() => !!currentUser, [currentUser]);

  const canAccessHotel = useCallback(
    (hotelId) => {
      if (userRole === "superadmin" || adminData?.role === "super_admin")
        return true;

      if (userRole === "admin" || userRole === "captain") {
        return userHotels.some(
          (hotel) =>
            hotel.id === hotelId ||
            hotel.hotelId === hotelId ||
            hotel === hotelId
        );
      }

      if (adminData?.linkedHotelId === hotelId) return true;

      return false;
    },
    [userRole, adminData, userHotels]
  );

  // Check if user has specific permission
  const hasPermission = useCallback(
    (permission) => {
      if (userRole === "superadmin" || adminData?.role === "super_admin")
        return true;
      if (!adminData?.permissions) return false;
      return adminData.permissions[permission] || false;
    },
    [userRole, adminData]
  );

  // Enhanced hotel creation using new admin system
  const createHotelWithAdmin = async (hotelData, adminDataInput) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can create hotels and admins");
    }

    try {
      console.log("Creating hotel with admin via enhanced system...");

      const hotelRef = await addDoc(collection(db, "hotels"), {
        businessName: hotelData.businessName || hotelData.name,
        hotelName: hotelData.hotelName || hotelData.name,
        name: hotelData.name,
        address: hotelData.address,
        phone: hotelData.phone,
        email: hotelData.email,
        city: hotelData.city,
        state: hotelData.state,
        businessType: hotelData.businessType || "restaurant",
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        isActive: true,
        active: true,
        status: "active",
        metrics: {
          totalAdmins: 0,
          totalMenuItems: 0,
          totalOrders: 0,
        },
      });

      const hotelId = hotelRef.id;
      await updateDoc(hotelRef, { hotelId });

      const adminUserCredential = await createUserWithEmailAndPassword(
        auth,
        adminDataInput.email,
        adminDataInput.password
      );

      const enhancedAdminData = {
        fullName: adminDataInput.fullName || adminDataInput.name,
        email: adminDataInput.email,
        phone: adminDataInput.phone,
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

      await setDoc(doc(db, "admins", adminUserCredential.user.uid), {
        name: adminDataInput.name,
        email: adminDataInput.email,
        phone: adminDataInput.phone,
        role: "admin",
        assignedHotels: [hotelRef.id],
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        active: true,
      });

      console.log("Hotel and admin created successfully");

      // Manually refresh hotels without using refreshUserHotels
      if (isSuperAdmin()) {
        const updatedHotels = await getAllHotels();
        setUserHotels(updatedHotels);
      }

      return {
        hotel: { id: hotelId, hotelId, ...hotelData },
        admin: {
          id: adminUserCredential.user.uid,
          adminId: newAdminRef.id,
          ...adminDataInput,
        },
      };
    } catch (error) {
      console.error("Error creating hotel and admin:", error);
      throw error;
    }
  };

  // Function to assign hotel to admin
  const assignHotelToAdmin = async (adminId, hotelId) => {
    if (!isSuperAdmin()) {
      throw new Error("Only super admins can assign hotels to admins");
    }

    try {
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

  // Fixed refresh function with guard against multiple calls
  const refreshUserHotels = useCallback(async () => {
    if (!currentUser || isRefreshing.current) {
      console.log("Skipping refresh - already in progress or no user");
      return userHotels;
    }

    isRefreshing.current = true;

    try {
      let hotels = [];

      if (userRole === "superadmin" || adminData?.role === "super_admin") {
        hotels = await getAllHotels();
      } else if (adminData?.linkedHotelId) {
        const hotel = await getHotelById(adminData.linkedHotelId);
        if (hotel) {
          hotels = [hotel];
        }
      } else if (userRole === "admin") {
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
    } finally {
      isRefreshing.current = false;
    }
  }, [
    currentUser,
    userRole,
    adminData,
    getAllHotels,
    getHotelById,
    getHotelsByIds,
  ]); // userHotels removed to prevent infinite loops

  // Get redirect path based on user role and hotel assignment
  const getRedirectPath = useCallback(() => {
    if (userRole === "superadmin" || adminData?.role === "super_admin") {
      return "/super-admin/dashboard";
    } else if (adminData?.linkedHotelId && adminData.hotelInfo) {
      const hotelSlug =
        adminData.hotelInfo.businessName
          ?.toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "_") || adminData.linkedHotelId;
      return `/${hotelSlug}/admin/dashboard`;
    } else if (userHotels.length > 0) {
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
  }, [userRole, adminData, userHotels]);

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
    adminData,
    hasPermission,
    getRedirectPath,
    linkedHotelId: adminData?.linkedHotelId,
    hotelInfo: adminData?.hotelInfo,
    permissions: adminData?.permissions || {},
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

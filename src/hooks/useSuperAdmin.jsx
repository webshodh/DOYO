// src/hooks/useSuperAdmin.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../services/firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export const useSuperAdmin = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [lastAction, setLastAction] = useState(null);

  // Search and selection state
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const { currentUser, isSuperAdmin } = useAuth();

  // ✅ Check permissions
  const hasPermissions = useMemo(() => {
    return isSuperAdmin();
  }, [isSuperAdmin]);

  const canCreateHotel = useMemo(() => {
    return hasPermissions;
  }, [hasPermissions]);

  // ✅ Search admin by email
  const searchAdminByEmail = useCallback(async (email) => {
    if (!email.trim()) {
      throw new Error("Email is required");
    }

    setSearching(true);
    setError(null);

    try {
      const adminsRef = collection(db, "admins");
      const q = query(adminsRef, where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setSearchResults(results);
      setLastAction(`Searched for admin: ${email}`);
      return results;
    } catch (err) {
      console.error("Error searching admin:", err);
      setError(err);
      throw err;
    } finally {
      setSearching(false);
    }
  }, []);

  // ✅ Select admin from search results
  const selectAdmin = useCallback((admin) => {
    setSelectedAdmin(admin);
    setLastAction(`Selected admin: ${admin.email}`);
  }, []);

  // ✅ Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSelectedAdmin(null);
    setLastAction("Cleared admin search");
  }, []);

  // ✅ Create new admin
  const createNewAdmin = useCallback(
    async (adminData) => {
      if (!adminData.email || !adminData.firstName || !adminData.lastName) {
        throw new Error("Admin email, first name, and last name are required");
      }

      try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          adminData.email,
          adminData.tempPassword || "TempPass123!" // Should be changed on first login
        );

        const uid = userCredential.user.uid;

        // Create admin document
        const adminDocData = {
          uid,
          email: adminData.email.toLowerCase(),
          firstName: adminData.firstName.trim(),
          lastName: adminData.lastName.trim(),
          phone: adminData.phone || "",
          role: adminData.role || "admin",
          permissions: adminData.permissions || {
            canManageOrders: true,
            canManageMenu: true,
            canViewAnalytics: true,
            canManageUsers: false,
          },
          isActive: true,
          createdBy: currentUser?.uid,
          createdAt: serverTimestamp(),
          managedHotels: [],
          profile: {
            avatar: "",
            bio: "",
            preferences: {},
          },
        };

        const adminDocRef = await addDoc(
          collection(db, "admins"),
          adminDocData
        );

        return {
          id: adminDocRef.id,
          uid,
          ...adminDocData,
        };
      } catch (error) {
        console.error("Error creating admin:", error);
        throw error;
      }
    },
    [currentUser]
  );

  // ✅ Create hotel with admin
  const createHotelWithAdmin = useCallback(
    async (hotelData, adminData, useExistingAdmin = false) => {
      if (!hasPermissions) {
        throw new Error("Insufficient permissions to create hotel");
      }

      setSubmitting(true);
      setError(null);

      try {
        const batch = writeBatch(db);
        let adminRef;
        let adminId;

        // Handle admin creation/selection
        if (useExistingAdmin && selectedAdmin) {
          adminId = selectedAdmin.id;
          adminRef = doc(db, "admins", adminId);
        } else {
          // Create new admin
          const newAdmin = await createNewAdmin(adminData);
          adminId = newAdmin.id;
          adminRef = doc(db, "admins", adminId);
        }

        // Create hotel document
        const hotelDocRef = doc(collection(db, "hotels"));
        const hotelDocData = {
          // Basic info
          name: hotelData.name,
          businessName: hotelData.businessName || hotelData.name,
          description: hotelData.description || "",
          category: hotelData.category,
          businessType: hotelData.businessType || "restaurant",

          // Contact info
          email: hotelData.email,
          phone: hotelData.contact,
          website: hotelData.website || "",

          // Location
          address: {
            street: hotelData.address,
            city: hotelData.city,
            district: hotelData.district,
            state: hotelData.state,
            pincode: hotelData.pincode,
            country: "India",
          },

          // Business details
          gstNumber: hotelData.gstNumber || "",
          fssaiNumber: hotelData.fssaiNumber || "",
          avgCostForTwo: parseFloat(hotelData.avgCostForTwo) || 0,

          // Operations
          operatingHours: hotelData.operatingHours,
          cuisineTypes: hotelData.cuisineTypes || [],
          features: hotelData.features || [],
          paymentMethods: hotelData.paymentMethods || ["cash", "card", "upi"],

          // Financial
          taxRate: hotelData.taxRate || 0.18,
          serviceCharge: hotelData.serviceCharge || 0,

          // Delivery
          deliveryRadius: hotelData.deliveryRadius || 5,
          minOrderAmount: hotelData.minOrderAmount || 0,

          // Social media
          socialMedia: hotelData.socialMedia || {},

          // System fields
          adminId,
          createdBy: currentUser?.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          status: "active",

          // Stats
          stats: {
            totalOrders: 0,
            totalRevenue: 0,
            rating: 0,
            reviewCount: 0,
          },
        };

        batch.set(hotelDocRef, hotelDocData);

        // Update admin's managed hotels
        if (useExistingAdmin && selectedAdmin) {
          const updatedManagedHotels = [
            ...(selectedAdmin.managedHotels || []),
            hotelDocRef.id,
          ];
          batch.update(adminRef, {
            managedHotels: updatedManagedHotels,
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.update(adminRef, {
            managedHotels: [hotelDocRef.id],
            updatedAt: serverTimestamp(),
          });
        }

        // Commit the batch
        await batch.commit();

        setLastAction(`Created hotel: ${hotelData.name}`);

        return {
          success: true,
          hotelId: hotelDocRef.id,
          adminId,
          message: "Hotel and admin created successfully",
        };
      } catch (err) {
        console.error("Error creating hotel with admin:", err);
        setError(err);
        return {
          success: false,
          error: err.message,
        };
      } finally {
        setSubmitting(false);
      }
    },
    [hasPermissions, selectedAdmin, currentUser, createNewAdmin]
  );

  // ✅ Refresh data
  const refreshData = useCallback(() => {
    setError(null);
    setConnectionStatus("connected");
    setLastAction("Data refreshed");
  }, []);

  return {
    // Hotel creation
    createHotelWithAdmin,
    searchAdminByEmail,
    createNewAdmin,

    // State management
    loading,
    submitting,
    searching,
    error,
    connectionStatus,
    lastAction,

    // Admin search results
    searchResults,
    selectedAdmin,

    // Actions
    clearSearchResults,
    selectAdmin,
    refreshData,

    // Computed values
    canCreateHotel,
    hasPermissions,
  };
};

export default useSuperAdmin;

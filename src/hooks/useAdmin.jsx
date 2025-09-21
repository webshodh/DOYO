// src/hooks/useAdmin.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export const useAdmin = (adminId) => {
  // State management
  const [admin, setAdmin] = useState(null);
  const [adminHotels, setAdminHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { currentUser } = useAuth();
  const activeAdminId = adminId || currentUser?.uid;

  // ✅ Fetch admin data
  const fetchAdminData = useCallback(async () => {
    if (!activeAdminId) {
      setLoading(false);
      setConnectionStatus("error");
      setError(new Error("No admin ID provided"));
      return;
    }

    try {
      setConnectionStatus("connecting");
      setError(null);

      // Fetch admin document
      const adminDocRef = doc(db, "admins", activeAdminId);
      const adminSnapshot = await getDoc(adminDocRef);

      if (adminSnapshot.exists()) {
        const adminData = {
          id: adminSnapshot.id,
          ...adminSnapshot.data(),
        };
        setAdmin(adminData);

        // Fetch hotels managed by this admin
        if (adminData.managedHotels && adminData.managedHotels.length > 0) {
          const hotelsQuery = query(
            collection(db, "hotels"),
            where("__name__", "in", adminData.managedHotels)
          );

          const hotelsSnapshot = await getDocs(hotelsQuery);
          const hotels = hotelsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setAdminHotels(hotels);
        } else {
          // If no specific hotels, fetch all hotels where admin is owner
          const allHotelsQuery = query(
            collection(db, "hotels"),
            where("createdBy", "==", activeAdminId)
          );

          const allHotelsSnapshot = await getDocs(allHotelsQuery);
          const allHotels = allHotelsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setAdminHotels(allHotels);
        }

        setConnectionStatus("connected");
        setLastFetch(Date.now());
        setRetryCount(0);
      } else {
        throw new Error("Admin not found");
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err);
      setConnectionStatus("error");
      setRetryCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [activeAdminId]);

  // ✅ Set up real-time listener for admin data
  useEffect(() => {
    if (!activeAdminId) return;

    const adminDocRef = doc(db, "admins", activeAdminId);

    const unsubscribe = onSnapshot(
      adminDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const adminData = {
            id: snapshot.id,
            ...snapshot.data(),
          };
          setAdmin(adminData);
          setConnectionStatus("connected");
          setLastFetch(Date.now());

          // Refetch hotels if managedHotels changed
          if (adminData.managedHotels) {
            fetchAdminData();
          }
        } else {
          setError(new Error("Admin not found"));
          setConnectionStatus("error");
        }
      },
      (error) => {
        console.error("Admin listener error:", error);
        setError(error);
        setConnectionStatus("error");
        setRetryCount((prev) => prev + 1);
      }
    );

    return () => unsubscribe();
  }, [activeAdminId, fetchAdminData]);

  // ✅ Initial data fetch
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // ✅ Refresh admin data
  const refreshAdmin = useCallback(async () => {
    setLoading(true);
    await fetchAdminData();
  }, [fetchAdminData]);

  // ✅ Update admin data
  const updateAdmin = useCallback(
    async (updates) => {
      if (!activeAdminId) return false;

      try {
        const adminDocRef = doc(db, "admins", activeAdminId);
        await updateDoc(adminDocRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
        return true;
      } catch (error) {
        console.error("Error updating admin:", error);
        setError(error);
        return false;
      }
    },
    [activeAdminId]
  );

  // ✅ Check if admin can manage a specific hotel
  const canManageHotel = useCallback(
    (hotelId) => {
      if (!admin || !hotelId) return false;

      // Admin can manage if hotel is in managedHotels or if admin created it
      return (
        admin.managedHotels?.includes(hotelId) ||
        adminHotels.some(
          (hotel) => hotel.id === hotelId && hotel.createdBy === activeAdminId
        ) ||
        admin.role === "superadmin"
      );
    },
    [admin, adminHotels, activeAdminId]
  );

  // ✅ Get admin permissions
  const getPermissions = useCallback(() => {
    if (!admin) return {};

    return {
      canCreateHotels: admin.permissions?.canCreateHotels !== false,
      canManageUsers: admin.permissions?.canManageUsers === true,
      canViewAnalytics: admin.permissions?.canViewAnalytics !== false,
      canManageOrders: admin.permissions?.canManageOrders !== false,
      canManageMenu: admin.permissions?.canManageMenu !== false,
      isSuperAdmin: admin.role === "superadmin",
      ...admin.permissions,
    };
  }, [admin]);

  // ✅ Computed values
  const computedValues = useMemo(() => {
    return {
      hasAdminData: !!admin,
      hasHotels: adminHotels.length > 0,
      hotelCount: adminHotels.length,
      isActive: admin?.isActive !== false,
      lastLogin: admin?.lastLogin,
      dataAge: lastFetch ? Date.now() - lastFetch : null,
      canRetry: retryCount < 3,
      isRetrying: loading && retryCount > 0,
    };
  }, [admin, adminHotels, lastFetch, retryCount, loading]);

  return {
    // Data
    admin,
    adminHotels,

    // State
    loading,
    error,
    connectionStatus,
    lastFetch,
    retryCount,

    // Actions
    refreshAdmin,
    updateAdmin,

    // Utilities
    canManageHotel,
    getPermissions,

    // Computed values
    ...computedValues,
  };
};

export default useAdmin;

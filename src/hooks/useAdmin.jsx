// useAdmin Hook - hooks/useAdmin.js (OPTIMIZED)

import { useState, useEffect, useCallback, useMemo } from "react";
import { adminServices } from "../services/api/adminServices";

export const useAdmin = ({ hotelId = null, onAdminAdded } = {}) => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Memoize subscription setup to prevent re-subscriptions
  useEffect(() => {
    let unsubscribe;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      if (hotelId) {
        // Subscribe to admins for specific hotel
        unsubscribe = adminServices.subscribeToHotelAdmins(hotelId, (data) => {
          setAdmins(data);
          setLoading(false);
        });
      } else {
        // Subscribe to all admins across all hotels
        unsubscribe = adminServices.subscribeToAllAdmins((data) => {
          setAdmins(data);
          setLoading(false);
        });
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [hotelId]); // Only re-subscribe if hotelId changes

  // Memoize filtered admins to prevent re-computation on every render
  const filteredAdmins = useMemo(() => {
    return adminServices.filterAdmins(admins, searchTerm);
  }, [admins, searchTerm]);

  // Optimize addAdmin with stable dependencies
  const addAdmin = useCallback(
    async (adminData, linkedHotelId = hotelId) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await adminServices.addAdmin(
          adminData,
          linkedHotelId,
          admins
        );
        if (success && onAdminAdded) {
          onAdminAdded(adminData);
        }
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error adding admin";
        setError(errorMessage);
        console.error("Error in addAdmin:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, onAdminAdded, hotelId] // Removed admins to prevent unnecessary re-renders
  );

  const updateAdmin = useCallback(
    async (adminData, adminId) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await adminServices.updateAdmin(adminId, adminData);
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error updating admin";
        setError(errorMessage);
        console.error("Error in updateAdmin:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const deleteAdmin = useCallback(
    async (admin) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await adminServices.deleteAdmin(admin);
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error deleting admin";
        setError(errorMessage);
        console.error("Error in deleteAdmin:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const linkAdminToHotel = useCallback(
    async (adminId, hotelId) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await adminServices.linkAdminToHotel(adminId, hotelId);
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error linking admin to hotel";
        setError(errorMessage);
        console.error("Error in linkAdminToHotel:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const unlinkAdminFromHotel = useCallback(
    async (adminId, hotelId) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await adminServices.unlinkAdminFromHotel(
          adminId,
          hotelId
        );
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error unlinking admin from hotel";
        setError(errorMessage);
        console.error("Error in unlinkAdminFromHotel:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const prepareForEdit = useCallback(async (admin) => {
    try {
      return await adminServices.prepareForEdit(admin);
    } catch (err) {
      const errorMessage = err.message || "Error preparing admin for edit";
      setError(errorMessage);
      console.error("Error in prepareForEdit:", err);
      return null;
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (adminData, adminId = null, linkedHotelId = hotelId) => {
      if (adminId) {
        return await updateAdmin(adminData, adminId);
      } else {
        return await addAdmin(adminData, linkedHotelId);
      }
    },
    [addAdmin, updateAdmin, hotelId]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize computed values to prevent recalculation
  const computedValues = useMemo(
    () => ({
      adminCount: admins.length,
      filteredCount: filteredAdmins.length,
      hasAdmins: admins.length > 0,
      hasSearchResults: filteredAdmins.length > 0,
    }),
    [admins.length, filteredAdmins.length]
  );

  return {
    // Data
    admins,
    filteredAdmins,
    searchTerm,

    // State
    loading,
    submitting,
    error,

    // Actions
    addAdmin,
    updateAdmin,
    deleteAdmin,
    linkAdminToHotel,
    unlinkAdminFromHotel,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    clearError,

    // Computed values (memoized)
    ...computedValues,

    // Setters for advanced usage
    setSearchTerm,
    setAdmins,
    setError,
  };
};

// Hook for getting available hotels for admin linking (OPTIMIZED)
export const useHotelsForAdmin = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    let isMounted = true; // Prevent state updates if component unmounted

    const setupHotelSubscription = async () => {
      try {
        // Import hotelServices dynamically to avoid circular dependency
        const { hotelServices } = await import("../services/api/hotelServices");

        if (!isMounted) return; // Component unmounted during import

        unsubscribe = hotelServices.subscribeToHotels((data) => {
          if (!isMounted) return; // Component unmounted during callback

          // Only get active hotels for admin linking
          const activeHotels = data.filter(
            (hotel) => hotel.status === "active" || hotel.isActive === "active"
          );
          setHotels(activeHotels);
          setLoading(false);
        });
      } catch (err) {
        if (isMounted) {
          console.error("Error setting up hotel subscription:", err);
          setError(err.message || "Error loading hotels");
          setLoading(false);
        }
      }
    };

    setupHotelSubscription();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-subscriptions

  // Memoize filtered hotels to avoid recalculation
  const activeHotels = useMemo(() => hotels, [hotels]);

  return {
    hotels: activeHotels,
    loading,
    error,
    hotelCount: hotels.length,
    hasHotels: hotels.length > 0,
  };
};

// useAdmin Hook - hooks/useAdmin.js

import { useState, useEffect, useCallback } from "react";
import { adminServices } from "../services/api/adminServices";

export const useAdmin = ({ hotelId = null, onAdminAdded } = {}) => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let unsubscribe;

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

    return () => unsubscribe();
  }, [hotelId]);

  const filteredAdmins = adminServices.filterAdmins(admins, searchTerm);

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
        if (success) {
          // Call the onAdminAdded callback if provided
          if (onAdminAdded) {
            onAdminAdded(adminData);
          }
        }
        return success;
      } catch (err) {
        setError(err.message || "Error adding admin");
        console.error("Error in addAdmin:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [admins, submitting, onAdminAdded, hotelId]
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
        setError(err.message || "Error updating admin");
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
        setError(err.message || "Error deleting admin");
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
        setError(err.message || "Error linking admin to hotel");
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
        setError(err.message || "Error unlinking admin from hotel");
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
      setError(err.message || "Error preparing admin for edit");
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

    // Computed values
    adminCount: admins.length,
    filteredCount: filteredAdmins.length,
    hasAdmins: admins.length > 0,
    hasSearchResults: filteredAdmins.length > 0,

    // Setters for advanced usage
    setSearchTerm,
    setAdmins,
    setError,
  };
};

// Hook for getting available hotels for admin linking
export const useHotelsForAdmin = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import hotelServices dynamically to avoid circular dependency
    import("../services/api/hotelServices").then(({ hotelServices }) => {
      const unsubscribe = hotelServices.subscribeToHotels((data) => {
        // Only get active hotels for admin linking
        const activeHotels = data.filter(
          (hotel) => hotel.status === "active" || hotel.isActive === "active"
        );
        setHotels(activeHotels);
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);

  return { hotels, loading };
};

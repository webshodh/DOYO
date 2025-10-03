// useCaptain.js - FIXED VERSION
import { useState, useEffect, useCallback, useMemo } from "react";
import { captainServices } from "../services/api/captainServices";

export const useCaptain = (hotelName) => {
  const [captains, setCaptains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to captains data
  useEffect(() => {
    if (!hotelName) {
      setCaptains([]);
      setLoading(false);
      setError("Hotel name is required");
      return;
    }

    let unsubscribe;
    let mounted = true;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      try {
        unsubscribe = captainServices.subscribeToCaptains(hotelName, (data) => {
          if (mounted) {
            setCaptains(data);
            setLoading(false);
            setError(null);
          }
        });
      } catch (err) {
        console.error("Error setting up subscription:", err);
        if (mounted) {
          setError("Failed to load captains");
          setLoading(false);
        }
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing:", err);
        }
      }
    };
  }, [hotelName]);

  // Memoize filtered captains
  const filteredCaptains = useMemo(() => {
    if (!Array.isArray(captains)) return [];
    return captainServices.filterCaptains(captains, searchTerm);
  }, [captains, searchTerm]);

  // Add captain
  const addCaptain = useCallback(
    async (captainData) => {
      if (submitting) {
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.addCaptain(
          hotelName,
          captainData,
          captains,
        );
        return success;
      } catch (error) {
        console.error("Error in addCaptain:", error);
        const errorMessage = error.message || "Failed to add captain";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, captains, submitting],
  );

  // Update captain
  const updateCaptain = useCallback(
    async (captainId, captainData) => {
      if (submitting) {
        return false;
      }

      if (!captainId) {
        setError("Captain ID is required");
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.updateCaptain(
          hotelName,
          captainId,
          captainData,
          captains,
        );
        return success;
      } catch (error) {
        console.error("Error in updateCaptain:", error);
        const errorMessage = error.message || "Failed to update captain";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, captains, submitting],
  );

  // Delete captain
  const deleteCaptain = useCallback(
    async (captain) => {
      if (submitting) {
        return false;
      }

      if (!captain || !captain.captainId) {
        setError("Invalid captain data");
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.deleteCaptain(hotelName, captain);
        return success;
      } catch (error) {
        console.error("Error in deleteCaptain:", error);
        const errorMessage = error.message || "Failed to delete captain";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting],
  );

  // Toggle captain status
  const toggleCaptainStatus = useCallback(
    async (captainId, currentStatus) => {
      if (submitting) {
        return false;
      }

      if (!captainId) {
        setError("Captain ID is required");
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.toggleCaptainStatus(
          hotelName,
          captainId,
          currentStatus,
        );
        return success;
      } catch (error) {
        console.error("Error in toggleCaptainStatus:", error);
        const errorMessage = error.message || "Failed to update captain status";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting],
  );

  // Prepare captain for editing
  const prepareForEdit = useCallback(
    async (captain) => {
      if (!captain) {
        setError("Captain data is required");
        return null;
      }

      try {
        const captainToEdit = await captainServices.prepareForEdit(
          hotelName,
          captain,
        );
        return captainToEdit;
      } catch (error) {
        console.error("Error in prepareForEdit:", error);
        const errorMessage =
          error.message || "Failed to prepare captain for editing";
        setError(errorMessage);
        return null;
      }
    },
    [hotelName],
  );

  // Handle form submit (add or update)
  const handleFormSubmit = useCallback(
    async (captainData, captainId = null) => {
      try {
        if (captainId) {
          return await updateCaptain(captainId, captainData);
        } else {
          return await addCaptain(captainData);
        }
      } catch (error) {
        console.error("Error in handleFormSubmit:", error);
        return false;
      }
    },
    [addCaptain, updateCaptain],
  );

  // Handle search change
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term || "");
  }, []);

  // Refresh captains
  const refreshCaptains = useCallback(() => {
    setError(null);
    // Real-time subscription auto-refreshes data
  }, []);

  // Get captain stats
  const getCaptainStats = useCallback(async () => {
    try {
      const stats = await captainServices.getCaptainStats(hotelName);
      return stats;
    } catch (error) {
      console.error("Error getting captain stats:", error);
      const errorMessage = error.message || "Failed to get captain stats";
      setError(errorMessage);
      return {
        totalCaptains: 0,
        activeCaptains: 0,
        inactiveCaptains: 0,
        recentCaptains: 0,
      };
    }
  }, [hotelName]);

  // Memoize duplicate check functions
  const duplicateChecks = useMemo(
    () => ({
      checkDuplicateEmail: (email, excludeId = null) => {
        if (!email || !Array.isArray(captains)) return false;
        return captains.some(
          (captain) =>
            captain.email?.toLowerCase() === email.toLowerCase() &&
            captain.captainId !== excludeId,
        );
      },

      checkDuplicateMobile: (mobileNo, excludeId = null) => {
        if (!mobileNo || !Array.isArray(captains)) return false;
        return captains.some(
          (captain) =>
            captain.mobileNo === mobileNo && captain.captainId !== excludeId,
        );
      },

      checkDuplicateAdhar: (adharNo, excludeId = null) => {
        if (!adharNo || !Array.isArray(captains)) return false;
        return captains.some(
          (captain) =>
            captain.adharNo === adharNo && captain.captainId !== excludeId,
        );
      },

      checkDuplicatePan: (panNo, excludeId = null) => {
        if (!panNo || !Array.isArray(captains)) return false;
        return captains.some(
          (captain) =>
            captain.panNo?.toUpperCase() === panNo.toUpperCase() &&
            captain.captainId !== excludeId,
        );
      },
    }),
    [captains],
  );

  // Memoize computed values
  const computedValues = useMemo(() => {
    const safeList = Array.isArray(captains) ? captains : [];
    const safeFiltered = Array.isArray(filteredCaptains)
      ? filteredCaptains
      : [];

    const activeCaptains = safeList.filter((c) => c.status === "active");
    const inactiveCaptains = safeList.filter((c) => c.status === "inactive");

    return {
      captainCount: safeList.length,
      filteredCount: safeFiltered.length,
      hasCaptains: safeList.length > 0,
      hasSearchResults: safeFiltered.length > 0,
      activeCaptains: activeCaptains.length,
      inactiveCaptains: inactiveCaptains.length,
    };
  }, [captains, filteredCaptains]);

  return {
    // Data
    captains,
    filteredCaptains,
    searchTerm,

    // State
    loading,
    submitting,
    error,

    // Actions
    addCaptain,
    updateCaptain,
    deleteCaptain,
    toggleCaptainStatus,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    refreshCaptains,
    getCaptainStats,

    // Duplicate checks (memoized)
    ...duplicateChecks,

    // Computed values (memoized)
    ...computedValues,

    // Setters for advanced usage
    setSearchTerm,
    setCaptains,
    setError,
  };
};

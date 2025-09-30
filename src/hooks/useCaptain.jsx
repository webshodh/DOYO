// useCaptain.js (OPTIMIZED)
import { useState, useEffect, useCallback, useMemo } from "react";
import { captainServices } from "../services/api/captainServices";

export const useCaptain = (hotelName) => {
  const [captains, setCaptains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelName) {
      setCaptains([]);
      setLoading(false);
      return;
    }

    let unsubscribe;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      unsubscribe = captainServices.subscribeToCaptains(hotelName, (data) => {
        setCaptains(data);
        setLoading(false);
        setError(null);
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [hotelName]); // Only re-subscribe if hotelName changes

  // Memoize filtered captains to prevent re-computation on every render
  const filteredCaptains = useMemo(() => {
    return captainServices.filterCaptains(captains, searchTerm);
  }, [captains, searchTerm]);

  // Optimize addCaptain with stable dependencies
  const addCaptain = useCallback(
    async (captainData) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const success = await captainServices.addCaptain(
          hotelName,
          captainData,
          captains
        );
        return success;
      } catch (error) {
        console.error("Error in addCaptain:", error);
        const errorMessage = error.message || error;
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting] // Removed captains to prevent unnecessary re-renders
  );

  const updateCaptain = useCallback(
    async (captainId, captainData) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const success = await captainServices.updateCaptain(
          hotelName,
          captainId,
          captainData,
          captains
        );
        return success;
      } catch (error) {
        console.error("Error in updateCaptain:", error);
        const errorMessage = error.message || error;
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting] // Removed captains to prevent unnecessary re-renders
  );

  const deleteCaptain = useCallback(
    async (captain) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const success = await captainServices.deleteCaptain(hotelName, captain);
        return success;
      } catch (error) {
        console.error("Error in deleteCaptain:", error);
        const errorMessage = error.message || error;
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const toggleCaptainStatus = useCallback(
    async (captainId, currentStatus) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const success = await captainServices.toggleCaptainStatus(
          hotelName,
          captainId,
          currentStatus
        );
        return success;
      } catch (error) {
        console.error("Error in toggleCaptainStatus:", error);
        const errorMessage = error.message || error;
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const prepareForEdit = useCallback(
    async (captain) => {
      try {
        const captainToEdit = await captainServices.prepareForEdit(
          hotelName,
          captain
        );
        return captainToEdit;
      } catch (error) {
        console.error("Error in prepareForEdit:", error);
        const errorMessage = error.message || error;
        setError(errorMessage);
        return null;
      }
    },
    [hotelName]
  );

  const handleFormSubmit = useCallback(
    async (captainData, captainId = null) => {
      if (captainId) {
        return await updateCaptain(captainId, captainData);
      } else {
        return await addCaptain(captainData);
      }
    },
    [addCaptain, updateCaptain]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const refreshCaptains = useCallback(() => {
    setError(null);
    // Real-time subscription auto refreshes data
  }, []);

  const getCaptainStats = useCallback(async () => {
    try {
      return await captainServices.getCaptainStats(hotelName);
    } catch (error) {
      console.error("Error getting captain stats:", error);
      const errorMessage = error.message || error;
      setError(errorMessage);
      return null;
    }
  }, [hotelName]);

  // Memoize duplicate check functions to prevent recalculation
  const duplicateChecks = useMemo(
    () => ({
      checkDuplicateEmail: (email, excludeId = null) =>
        captains.some(
          (captain) =>
            captain.email?.toLowerCase() === email.toLowerCase() &&
            captain.captainId !== excludeId
        ),

      checkDuplicateMobile: (mobileNo, excludeId = null) =>
        captains.some(
          (captain) =>
            captain.mobileNo === mobileNo && captain.captainId !== excludeId
        ),

      checkDuplicateAdhar: (adharNo, excludeId = null) =>
        captains.some(
          (captain) =>
            captain.adharNo === adharNo && captain.captainId !== excludeId
        ),

      checkDuplicatePan: (panNo, excludeId = null) =>
        captains.some(
          (captain) =>
            captain.panNo?.toUpperCase() === panNo.toUpperCase() &&
            captain.captainId !== excludeId
        ),
    }),
    [captains]
  );

  // Memoize computed values to prevent recalculation on every render
  const computedValues = useMemo(() => {
    const activeCaptains = captains.filter((c) => c.status === "active");
    const inactiveCaptains = captains.filter((c) => c.status === "inactive");

    return {
      captainCount: captains.length,
      filteredCount: filteredCaptains.length,
      hasCaptains: captains.length > 0,
      hasSearchResults: filteredCaptains.length > 0,
      activeCaptains: activeCaptains.length,
      inactiveCaptains: inactiveCaptains.length,
    };
  }, [captains.length, filteredCaptains.length, captains]);

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

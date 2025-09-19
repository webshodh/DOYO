import { useState, useEffect, useCallback } from "react";
import { captainServices } from "../services/captainServices";

export const useCaptain = (hotelName) => {
  // State management
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
      return;
    }

    setLoading(true);
    setError(null);
    
    const unsubscribe = captainServices.subscribeToCaptains(
      hotelName,
      (data) => {
        setCaptains(data);
        setLoading(false);
        setError(null);
      }
    );

    // Handle potential connection errors
    // const errorTimeout = setTimeout(() => {
    //   if (loading) {
    //     setError(new Error("Taking longer than expected to load captains"));
    //     setLoading(false);
    //   }
    // }, 50000);

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      unsubscribe();
      // clearTimeout(errorTimeout);
    };
  }, [hotelName]);

  // Filter captains based on search term
  const filteredCaptains = captainServices.filterCaptains(captains, searchTerm);

  // Add new captain
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
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, captains, submitting]
  );

  // Update existing captain
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
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, captains, submitting]
  );

  // Delete captain
  const deleteCaptain = useCallback(
    async (captain) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await captainServices.deleteCaptain(hotelName, captain);
        return success;
      } catch (error) {
        console.error("Error in deleteCaptain:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Toggle captain status
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
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Prepare captain for editing
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
        setError(error);
        return null;
      }
    },
    [hotelName]
  );

  // Handle form submission (both add and edit)
  const handleFormSubmit = useCallback(
    async (captainData, captainId = null) => {
      if (captainId) {
        // Edit mode
        return await updateCaptain(captainId, captainData);
      } else {
        // Add mode
        return await addCaptain(captainData);
      }
    },
    [addCaptain, updateCaptain]
  );

  // Handle search change
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Refresh captains data
  const refreshCaptains = useCallback(() => {
    setError(null);
    // The real-time subscription will automatically refresh the data
    // This function exists for UI consistency
  }, []);

  // Get captain statistics
  const getCaptainStats = useCallback(async () => {
    try {
      return await captainServices.getCaptainStats(hotelName);
    } catch (error) {
      console.error("Error getting captain stats:", error);
      setError(error);
      return null;
    }
  }, [hotelName]);

  // Check if captain email already exists
  const checkDuplicateEmail = useCallback(
    (email, excludeId = null) => {
      return captains.some(
        (captain) =>
          captain.email?.toLowerCase() === email.toLowerCase() &&
          captain.captainId !== excludeId
      );
    },
    [captains]
  );

  // Check if captain mobile already exists
  const checkDuplicateMobile = useCallback(
    (mobileNo, excludeId = null) => {
      return captains.some(
        (captain) =>
          captain.mobileNo === mobileNo &&
          captain.captainId !== excludeId
      );
    },
    [captains]
  );

  // Check if captain Aadhar already exists
  const checkDuplicateAdhar = useCallback(
    (adharNo, excludeId = null) => {
      return captains.some(
        (captain) =>
          captain.adharNo === adharNo &&
          captain.captainId !== excludeId
      );
    },
    [captains]
  );

  // Check if captain PAN already exists
  const checkDuplicatePan = useCallback(
    (panNo, excludeId = null) => {
      return captains.some(
        (captain) =>
          captain.panNo?.toUpperCase() === panNo.toUpperCase() &&
          captain.captainId !== excludeId
      );
    },
    [captains]
  );

  return {
    // State
    captains,
    filteredCaptains,
    searchTerm,
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

    // Utilities
    getCaptainStats,
    checkDuplicateEmail,
    checkDuplicateMobile,
    checkDuplicateAdhar,
    checkDuplicatePan,

    // Computed values
    captainCount: captains.length,
    filteredCount: filteredCaptains.length,
    hasCaptains: captains.length > 0,
    hasSearchResults: filteredCaptains.length > 0,
    activeCaptains: captains.filter(c => c.status === 'active').length,
    inactiveCaptains: captains.filter(c => c.status === 'inactive').length,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setCaptains,
    setError,
  };
};
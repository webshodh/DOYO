// useCaptain.js
import { useState, useEffect, useCallback } from "react";
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

    return () => unsubscribe();
  }, [hotelName]);

  const filteredCaptains = captainServices.filterCaptains(captains, searchTerm);

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
      setError(error);
      return null;
    }
  }, [hotelName]);

  const checkDuplicateEmail = useCallback(
    (email, excludeId = null) =>
      captains.some(
        (captain) =>
          captain.email?.toLowerCase() === email.toLowerCase() &&
          captain.captainId !== excludeId
      ),
    [captains]
  );

  const checkDuplicateMobile = useCallback(
    (mobileNo, excludeId = null) =>
      captains.some(
        (captain) =>
          captain.mobileNo === mobileNo && captain.captainId !== excludeId
      ),
    [captains]
  );

  const checkDuplicateAdhar = useCallback(
    (adharNo, excludeId = null) =>
      captains.some(
        (captain) =>
          captain.adharNo === adharNo && captain.captainId !== excludeId
      ),
    [captains]
  );

  const checkDuplicatePan = useCallback(
    (panNo, excludeId = null) =>
      captains.some(
        (captain) =>
          captain.panNo?.toUpperCase() === panNo.toUpperCase() &&
          captain.captainId !== excludeId
      ),
    [captains]
  );

  return {
    captains,
    filteredCaptains,
    searchTerm,
    loading,
    submitting,
    error,
    addCaptain,
    updateCaptain,
    deleteCaptain,
    toggleCaptainStatus,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    refreshCaptains,
    getCaptainStats,
    checkDuplicateEmail,
    checkDuplicateMobile,
    checkDuplicateAdhar,
    checkDuplicatePan,
    captainCount: captains.length,
    filteredCount: filteredCaptains.length,
    hasCaptains: captains.length > 0,
    hasSearchResults: filteredCaptains.length > 0,
    activeCaptains: captains.filter((c) => c.status === "active").length,
    inactiveCaptains: captains.filter((c) => c.status === "inactive").length,
    setSearchTerm,
    setCaptains,
    setError,
  };
};

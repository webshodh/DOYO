// src/hooks/useCaptain.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { captainServices } from "../services/api/captainServices";
import { useAuth } from "../context/AuthContext";
import { useHotelContext } from "../context/HotelContext";

export const useCaptain = (hotelName) => {
  // State management
  const [captains, setCaptains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // ✅ NEW: Additional state for better UX
  const [retryCount, setRetryCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");

  // Refs for cleanup
  const unsubscribeRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // Context hooks for enhanced functionality
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // ✅ ENHANCED: Auto-use selected hotel if no hotelName provided
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Subscribe to captains data
  useEffect(() => {
    if (!activeHotelName) {
      setCaptains([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Clear previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Clear previous error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    const unsubscribe = captainServices.subscribeToCaptains(
      activeHotelName,
      (data) => {
        setCaptains(data || []);
        setLoading(false);
        setError(null);
        setLastFetch(new Date());
        setRetryCount(0);
      },
      (error) => {
        console.error("Captain subscription error:", error);
        setError(error);
        setLoading(false);
        setRetryCount((prev) => prev + 1);
      }
    );

    unsubscribeRef.current = unsubscribe;

    // ✅ ENHANCED: Connection timeout with retry logic
    errorTimeoutRef.current = setTimeout(() => {
      if (loading && retryCount < 3) {
        setError(
          new Error("Taking longer than expected to load captains. Retrying...")
        );
        setRetryCount((prev) => prev + 1);
      } else if (retryCount >= 3) {
        setError(new Error("Failed to load captains after multiple attempts"));
        setLoading(false);
      }
    }, 15000);

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, [activeHotelName, retryCount]);

  // ✅ ENHANCED: Filter and sort captains
  const getFilteredAndSortedCaptains = useCallback(() => {
    let filtered = captainServices.filterCaptains(captains, searchTerm);

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((captain) => captain.status === filterStatus);
    }

    // Apply sorting
    switch (sortOrder) {
      case "name_asc":
        filtered.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        );
        break;
      case "name_desc":
        filtered.sort((a, b) =>
          `${b.firstName} ${b.lastName}`.localeCompare(
            `${a.firstName} ${a.lastName}`
          )
        );
        break;
      case "email_asc":
        filtered.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        break;
      case "status":
        filtered.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt || 0);
          return dateA - dateB;
        });
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [captains, searchTerm, filterStatus, sortOrder]);

  const filteredCaptains = getFilteredAndSortedCaptains();

  // ✅ ENHANCED: Add new captain with validation
  const addCaptain = useCallback(
    async (captainData) => {
      if (submitting) return false;

      // Additional client-side validation
      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.addCaptain(
          activeHotelName,
          captainData,
          captains
        );

        if (success) {
          // Clear search to show new captain
          setSearchTerm("");
        }

        return success;
      } catch (error) {
        console.error("Error in addCaptain:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, captains, submitting]
  );

  // Update existing captain
  const updateCaptain = useCallback(
    async (captainId, captainData) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.updateCaptain(
          activeHotelName,
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
    [activeHotelName, captains, submitting]
  );

  // Delete captain
  const deleteCaptain = useCallback(
    async (captain) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.deleteCaptain(
          activeHotelName,
          captain
        );
        return success;
      } catch (error) {
        console.error("Error in deleteCaptain:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // Toggle captain status
  const toggleCaptainStatus = useCallback(
    async (captainId, currentStatus) => {
      if (submitting) return false;

      setSubmitting(true);
      setError(null);

      try {
        const success = await captainServices.toggleCaptainStatus(
          activeHotelName,
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
    [activeHotelName, submitting]
  );

  // Prepare captain for editing
  const prepareForEdit = useCallback(
    async (captain) => {
      try {
        const captainToEdit = await captainServices.prepareForEdit(
          activeHotelName,
          captain
        );
        return captainToEdit;
      } catch (error) {
        console.error("Error in prepareForEdit:", error);
        setError(error);
        return null;
      }
    },
    [activeHotelName]
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

  // ✅ NEW: Handle sorting change
  const handleSortChange = useCallback((order) => {
    setSortOrder(order);
  }, []);

  // ✅ NEW: Handle filter change
  const handleFilterChange = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  // ✅ NEW: Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterStatus("all");
    setSortOrder("newest");
  }, []);

  // ✅ ENHANCED: Refresh captains data with retry logic
  const refreshCaptains = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setLastFetch(new Date());
    // The real-time subscription will automatically refresh the data
  }, []);

  // Get captain statistics
  const getCaptainStats = useCallback(async () => {
    try {
      return await captainServices.getCaptainStats(activeHotelName);
    } catch (error) {
      console.error("Error getting captain stats:", error);
      setError(error);
      return null;
    }
  }, [activeHotelName]);

  // Check if captain email already exists
  const checkDuplicateEmail = useCallback(
    (email, excludeId = null) => {
      return captains.some(
        (captain) =>
          captain.email?.toLowerCase() === email.toLowerCase() &&
          captain.captainId !== excludeId &&
          captain.id !== excludeId
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
          captain.captainId !== excludeId &&
          captain.id !== excludeId
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
          captain.captainId !== excludeId &&
          captain.id !== excludeId
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
          captain.captainId !== excludeId &&
          captain.id !== excludeId
      );
    },
    [captains]
  );

  // ✅ NEW: Get captain by ID
  const getCaptainById = useCallback(
    (captainId) => {
      return captains.find(
        (c) => c.captainId === captainId || c.id === captainId
      );
    },
    [captains]
  );

  // ✅ NEW: Get captain by email
  const getCaptainByEmail = useCallback(
    (email) => {
      return captains.find(
        (c) => c.email?.toLowerCase() === email.toLowerCase()
      );
    },
    [captains]
  );

  // ✅ NEW: Bulk operations
  const bulkUpdateStatus = useCallback(
    async (captainIds, status) => {
      if (submitting) return false;

      setSubmitting(true);
      setError(null);

      try {
        const promises = captainIds.map((id) =>
          captainServices.toggleCaptainStatus(
            activeHotelName,
            id,
            status === "active" ? "inactive" : "active"
          )
        );

        const results = await Promise.allSettled(promises);
        const failures = results.filter((r) => r.status === "rejected");

        if (failures.length > 0) {
          console.warn("Some bulk operations failed:", failures);
        }

        return failures.length === 0;
      } catch (error) {
        console.error("Error in bulk update:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // ✅ NEW: Export captains data
  const exportCaptains = useCallback(() => {
    const dataToExport = filteredCaptains.map((captain) => ({
      Name: `${captain.firstName} ${captain.lastName}`,
      Email: captain.email,
      Mobile: captain.mobileNo,
      Status: captain.status,
      "Created Date": captain.createdAt?.toDate
        ? captain.createdAt.toDate().toLocaleDateString()
        : new Date(captain.createdAt).toLocaleDateString(),
    }));

    return dataToExport;
  }, [filteredCaptains]);

  return {
    // State
    captains,
    filteredCaptains,
    searchTerm,
    loading,
    submitting,
    error,
    lastFetch,
    retryCount,
    sortOrder,
    filterStatus,

    // Actions
    addCaptain,
    updateCaptain,
    deleteCaptain,
    toggleCaptainStatus,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    refreshCaptains,
    clearFilters,

    // Utilities
    getCaptainStats,
    checkDuplicateEmail,
    checkDuplicateMobile,
    checkDuplicateAdhar,
    checkDuplicatePan,
    getCaptainById,
    getCaptainByEmail,
    bulkUpdateStatus,
    exportCaptains,

    // Computed values
    captainCount: captains.length,
    filteredCount: filteredCaptains.length,
    hasCaptains: captains.length > 0,
    hasSearchResults: filteredCaptains.length > 0,
    activeCaptains: captains.filter((c) => c.status === "active").length,
    inactiveCaptains: captains.filter((c) => c.status === "inactive").length,
    hasFiltersApplied:
      searchTerm || filterStatus !== "all" || sortOrder !== "newest",

    // ✅ NEW: Additional computed values
    connectionStatus: error ? "error" : loading ? "connecting" : "connected",
    isRetrying: retryCount > 0 && loading,
    canRetry: retryCount < 3 && error,
    dataAge: lastFetch ? Date.now() - lastFetch.getTime() : null,

    // Meta info
    activeHotelName,
    currentUser,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setCaptains,
    setError,
    setSortOrder,
    setFilterStatus,
  };
};

// ✅ NEW: Hook for current user's captain data (if they are a captain)
export const useCurrentCaptain = () => {
  const { currentUser } = useAuth();
  const [captainData, setCaptainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setCaptainData(null);
      setLoading(false);
      return;
    }

    const fetchCaptainData = async () => {
      try {
        setLoading(true);
        const data = await captainServices.getCaptainByAuthId(currentUser.uid);
        setCaptainData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaptainData();
  }, [currentUser]);

  return {
    captainData,
    loading,
    error,
    isCaptain: !!captainData,
    hotelName: captainData?.hotelName,
  };
};

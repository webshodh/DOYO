// useHotel.js (OPTIMIZED)

import { useState, useEffect, useCallback, useMemo } from "react";
import { hotelServices } from "../services/api/hotelServices";

export const useHotel = ({ onHotelAdded, includeMetrics = true } = {}) => {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    businessType: "all",
    city: "all",
    state: "all",
    subscriptionPlan: "all",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHotels, setSelectedHotels] = useState([]);

  // Subscribe to hotels with real-time updates
  useEffect(() => {
    let unsubscribe;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      unsubscribe = hotelServices.subscribeToHotels((data) => {
        setHotels(data);
        setLoading(false);
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-subscriptions

  // Filter options derived from hotels data (memoized)
  const filterOptions = useMemo(() => {
    return hotelServices.getFilterOptions(hotels);
  }, [hotels]);

  // Filtered hotels based on search and filters (memoized)
  const filteredHotels = useMemo(() => {
    return hotelServices.filterHotels(hotels, searchTerm, filters);
  }, [hotels, searchTerm, filters]);

  // Hotel analytics (memoized)
  const analytics = useMemo(() => {
    return hotelServices.getHotelAnalytics(hotels);
  }, [hotels]);

  // Enhanced stats (memoized and optimized)
  const hotelStats = useMemo(() => {
    const stats = {
      total: hotels.length,
      active: 0,
      inactive: 0,
      revenue: 0,
      businessTypes: 0,
      avgAdminsPerHotel: 0,
      avgMenuItemsPerHotel: 0,
      subscriptionBreakdown: {},
    };

    if (hotels.length === 0) return stats;

    let totalAdmins = 0;
    let totalMenuItems = 0;
    const subscriptionCounts = {};
    const businessTypeSet = new Set();

    hotels.forEach((hotel) => {
      // Status counts
      const status = hotel.status || hotel.isActive || "active";
      if (status === "active" || status === "Active") {
        stats.active++;
      } else {
        stats.inactive++;
      }

      // Revenue calculation
      stats.revenue += hotel.totalRevenue || hotel.monthlyRevenue || 0;

      // Business types tracking
      if (hotel.businessType) {
        businessTypeSet.add(hotel.businessType);
      }

      // Metrics aggregation
      if (hotel.metrics) {
        totalAdmins += hotel.metrics.totalAdmins || 0;
        totalMenuItems += hotel.metrics.totalMenuItems || 0;

        const planName = hotel.metrics.subscription?.planName || "Free";
        subscriptionCounts[planName] = (subscriptionCounts[planName] || 0) + 1;
      }
    });

    stats.avgAdminsPerHotel =
      stats.total > 0 ? Math.round((totalAdmins / stats.total) * 10) / 10 : 0;
    stats.avgMenuItemsPerHotel =
      stats.total > 0
        ? Math.round((totalMenuItems / stats.total) * 10) / 10
        : 0;
    stats.businessTypes = businessTypeSet.size;
    stats.subscriptionBreakdown = subscriptionCounts;

    return stats;
  }, [hotels]);

  // Add hotel (optimized dependencies)
  const addHotel = useCallback(
    async (hotelData) => {
      if (submitting) return { success: false, error: "Already processing" };
      setSubmitting(true);
      setError(null);

      try {
        const result = await hotelServices.addHotel(hotelData, hotels);
        if (result.success && onHotelAdded) {
          onHotelAdded({ ...hotelData, hotelId: result.hotelId });
        }
        return result;
      } catch (err) {
        const errorMsg = err.message || "Error adding hotel";
        setError(errorMsg);
        console.error("Error in addHotel:", err);
        return { success: false, error: errorMsg };
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, onHotelAdded] // Removed hotels to prevent unnecessary re-renders
  );

  // Update hotel (optimized dependencies)
  const updateHotel = useCallback(
    async (hotelData, hotelId) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await hotelServices.updateHotel(
          hotelId,
          hotelData,
          hotels
        );
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error updating hotel";
        setError(errorMessage);
        console.error("Error in updateHotel:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting] // Removed hotels to prevent unnecessary re-renders
  );

  // Delete hotel
  const deleteHotel = useCallback(
    async (hotel) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await hotelServices.deleteHotel(hotel);
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error deleting hotel";
        setError(errorMessage);
        console.error("Error in deleteHotel:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  // Bulk operations
  const bulkUpdateHotels = useCallback(
    async (hotelIds, updateData) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await hotelServices.bulkUpdateHotels(
          hotelIds,
          updateData
        );
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error bulk updating hotels";
        setError(errorMessage);
        console.error("Error in bulkUpdateHotels:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  // Prepare for edit
  const prepareForEdit = useCallback(async (hotel) => {
    try {
      return await hotelServices.prepareForEdit(hotel);
    } catch (err) {
      const errorMessage = err.message || "Error preparing hotel for edit";
      setError(errorMessage);
      console.error("Error in prepareForEdit:", err);
      return null;
    }
  }, []);

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (hotelData, hotelId = null) => {
      if (hotelId) {
        return await updateHotel(hotelData, hotelId);
      } else {
        const result = await addHotel(hotelData);
        return result.success;
      }
    },
    [addHotel, updateHotel]
  );

  // Search handling
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Filter handling
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({
      status: "all",
      businessType: "all",
      city: "all",
      state: "all",
      subscriptionPlan: "all",
    });
  }, []);

  // Export data (memoized)
  const exportHotels = useMemo(() => {
    return (format = "csv") => {
      return hotelServices.exportHotelsData(filteredHotels, format);
    };
  }, [filteredHotels]);

  // Get hotel by ID with full details
  const getHotelById = useCallback(async (hotelId) => {
    try {
      return await hotelServices.getHotelById(hotelId);
    } catch (err) {
      const errorMessage = err.message || "Error fetching hotel details";
      setError(errorMessage);
      console.error("Error in getHotelById:", err);
      return null;
    }
  }, []);

  // Error clearing
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Selection handling for bulk operations (memoized)
  const selectionHandlers = useMemo(
    () => ({
      handleHotelSelection: (hotelId, isSelected) => {
        setSelectedHotels((prev) => {
          if (isSelected) {
            return [...prev, hotelId];
          } else {
            return prev.filter((id) => id !== hotelId);
          }
        });
      },

      handleSelectAllHotels: (isSelected) => {
        if (isSelected) {
          setSelectedHotels(filteredHotels.map((hotel) => hotel.hotelId));
        } else {
          setSelectedHotels([]);
        }
      },

      clearSelection: () => {
        setSelectedHotels([]);
      },
    }),
    [filteredHotels]
  );

  // Memoize computed values to prevent recalculation
  const computedValues = useMemo(() => {
    const hasFiltersApplied =
      searchTerm || Object.values(filters).some((f) => f !== "all");

    return {
      hotelCount: hotels.length,
      filteredCount: filteredHotels.length,
      selectedCount: selectedHotels.length,
      hasHotels: hotels.length > 0,
      hasSearchResults: filteredHotels.length > 0,
      hasFiltersApplied,
    };
  }, [
    hotels.length,
    filteredHotels.length,
    selectedHotels.length,
    searchTerm,
    filters,
  ]);

  return {
    // Data
    hotels,
    filteredHotels,
    searchTerm,
    filters,
    filterOptions,
    analytics,

    // State
    loading,
    submitting,
    error,

    // Enhanced Stats
    hotelStats,

    // Actions
    addHotel,
    updateHotel,
    deleteHotel,
    bulkUpdateHotels,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    handleFilterChange,
    clearAllFilters,
    exportHotels,
    getHotelById,
    clearError,

    // Selection (memoized)
    selectedHotels,
    ...selectionHandlers,

    // Computed values (memoized)
    ...computedValues,

    // Setters for advanced usage
    setSearchTerm,
    setFilters,
    setHotels,
    setError,
    setSelectedHotels,
  };
};

// Hook for getting hotels list (lightweight version without metrics) - OPTIMIZED
export const useHotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    let isMounted = true; // Prevent state updates if component unmounted

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      // Use a simpler subscription without metrics for better performance
      unsubscribe = hotelServices.subscribeToHotels((data) => {
        if (!isMounted) return; // Component unmounted during callback

        // Map to simpler format
        const simpleHotels = data.map((hotel) => ({
          hotelId: hotel.hotelId,
          businessName: hotel.businessName,
          hotelName: hotel.hotelName,
          status: hotel.status,
          city: hotel.city,
          state: hotel.state,
          businessType: hotel.businessType,
        }));
        setHotels(simpleHotels);
        setLoading(false);
      });
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array prevents re-subscriptions

  const activeHotels = useMemo(() => {
    return hotels.filter(
      (hotel) => hotel.status === "active" || hotel.status === "Active"
    );
  }, [hotels]);

  // Memoize computed values
  const computedValues = useMemo(
    () => ({
      hotelCount: hotels.length,
      activeCount: activeHotels.length,
    }),
    [hotels.length, activeHotels.length]
  );

  return {
    hotels,
    activeHotels,
    loading,
    error,
    ...computedValues,
  };
};

// Hook for single hotel details - OPTIMIZED
export const useHotelDetails = (hotelId) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    let isMounted = true; // Prevent state updates if component unmounted

    const fetchHotel = async () => {
      setLoading(true);
      setError(null);

      try {
        const hotelData = await hotelServices.getHotelById(hotelId);
        if (isMounted) {
          setHotel(hotelData);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err.message || "Error fetching hotel details";
          setError(errorMessage);
          console.error("Error fetching hotel details:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHotel();

    return () => {
      isMounted = false;
    };
  }, [hotelId]); // Only re-fetch if hotelId changes

  const refreshHotel = useCallback(async () => {
    if (!hotelId) return;

    try {
      const hotelData = await hotelServices.getHotelById(hotelId);
      setHotel(hotelData);
    } catch (err) {
      const errorMessage = err.message || "Error refreshing hotel details";
      setError(errorMessage);
      console.error("Error refreshing hotel details:", err);
    }
  }, [hotelId]);

  // Memoize computed values
  const computedValues = useMemo(
    () => ({
      isActive: hotel?.status === "active",
      hasSubscription: Boolean(hotel?.metrics?.subscription),
    }),
    [hotel?.status, hotel?.metrics?.subscription]
  );

  return {
    hotel,
    loading,
    error,
    refreshHotel,
    ...computedValues,
  };
};

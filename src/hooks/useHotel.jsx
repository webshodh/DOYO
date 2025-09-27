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

  // Subscribe to hotels with real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = hotelServices.subscribeToHotels((data) => {
      setHotels(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter options derived from hotels data
  const filterOptions = useMemo(() => {
    return hotelServices.getFilterOptions(hotels);
  }, [hotels]);

  // Filtered hotels based on search and filters
  const filteredHotels = useMemo(() => {
    return hotelServices.filterHotels(hotels, searchTerm, filters);
  }, [hotels, searchTerm, filters]);

  // Hotel analytics
  const analytics = useMemo(() => {
    return hotelServices.getHotelAnalytics(hotels);
  }, [hotels]);

  // Enhanced stats
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

    let totalAdmins = 0;
    let totalMenuItems = 0;
    const subscriptionCounts = {};

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
    stats.businessTypes = new Set(
      hotels.map((h) => h.businessType).filter(Boolean)
    ).size;
    stats.subscriptionBreakdown = subscriptionCounts;

    return stats;
  }, [hotels]);

  // Add hotel
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
    [hotels, submitting, onHotelAdded]
  );

  // Update hotel
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
        setError(err.message || "Error updating hotel");
        console.error("Error in updateHotel:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotels, submitting]
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
        setError(err.message || "Error deleting hotel");
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
        setError(err.message || "Error bulk updating hotels");
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
      setError(err.message || "Error preparing hotel for edit");
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

  // Export data
  const exportHotels = useCallback(
    (format = "csv") => {
      return hotelServices.exportHotelsData(filteredHotels, format);
    },
    [filteredHotels]
  );

  // Get hotel by ID with full details
  const getHotelById = useCallback(async (hotelId) => {
    try {
      return await hotelServices.getHotelById(hotelId);
    } catch (err) {
      setError(err.message || "Error fetching hotel details");
      console.error("Error in getHotelById:", err);
      return null;
    }
  }, []);

  // Error clearing
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Selection handling for bulk operations
  const [selectedHotels, setSelectedHotels] = useState([]);

  const handleHotelSelection = useCallback((hotelId, isSelected) => {
    setSelectedHotels((prev) => {
      if (isSelected) {
        return [...prev, hotelId];
      } else {
        return prev.filter((id) => id !== hotelId);
      }
    });
  }, []);

  const handleSelectAllHotels = useCallback(
    (isSelected) => {
      if (isSelected) {
        setSelectedHotels(filteredHotels.map((hotel) => hotel.hotelId));
      } else {
        setSelectedHotels([]);
      }
    },
    [filteredHotels]
  );

  const clearSelection = useCallback(() => {
    setSelectedHotels([]);
  }, []);

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

    // Selection
    selectedHotels,
    handleHotelSelection,
    handleSelectAllHotels,
    clearSelection,

    // Computed values
    hotelCount: hotels.length,
    filteredCount: filteredHotels.length,
    selectedCount: selectedHotels.length,
    hasHotels: hotels.length > 0,
    hasSearchResults: filteredHotels.length > 0,
    hasFiltersApplied:
      searchTerm || Object.values(filters).some((f) => f !== "all"),

    // Setters for advanced usage
    setSearchTerm,
    setFilters,
    setHotels,
    setError,
    setSelectedHotels,
  };
};

// Hook for getting hotels list (lightweight version without metrics)
export const useHotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Use a simpler subscription without metrics for better performance
    const unsubscribe = hotelServices.subscribeToHotels((data) => {
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

    return () => unsubscribe();
  }, []);

  const activeHotels = useMemo(() => {
    return hotels.filter(
      (hotel) => hotel.status === "active" || hotel.status === "Active"
    );
  }, [hotels]);

  return {
    hotels,
    activeHotels,
    loading,
    error,
    hotelCount: hotels.length,
    activeCount: activeHotels.length,
  };
};

// Hook for single hotel details
export const useHotelDetails = (hotelId) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    const fetchHotel = async () => {
      setLoading(true);
      setError(null);

      try {
        const hotelData = await hotelServices.getHotelById(hotelId);
        setHotel(hotelData);
      } catch (err) {
        setError(err.message || "Error fetching hotel details");
        console.error("Error fetching hotel details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  const refreshHotel = useCallback(async () => {
    if (!hotelId) return;

    try {
      const hotelData = await hotelServices.getHotelById(hotelId);
      setHotel(hotelData);
    } catch (err) {
      setError(err.message || "Error refreshing hotel details");
      console.error("Error refreshing hotel details:", err);
    }
  }, [hotelId]);

  return {
    hotel,
    loading,
    error,
    refreshHotel,
    isActive: hotel?.status === "active",
    hasSubscription: Boolean(hotel?.metrics?.subscription),
  };
};

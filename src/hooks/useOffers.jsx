// src/hooks/useOffers.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { offerServices } from "../services/api/offersService";
import { useAuth } from "../context/AuthContext";
import { useHotelContext } from "../context/HotelContext";

export const useOffers = (hotelName) => {
  // State management
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [filterType, setFilterType] = useState("all");

  // ✅ NEW: Additional state for enhanced functionality
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [discountFilter, setDiscountFilter] = useState({ min: 0, max: 100 });

  // Refs for cleanup
  const unsubscribeRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // Context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // ✅ ENHANCED: Auto-use selected hotel if no hotelName provided
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // ✅ ENHANCED: Subscribe to offers data with better error handling
  useEffect(() => {
    if (!activeHotelName) {
      setOffers([]);
      setLoading(false);
      setConnectionStatus("disconnected");
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionStatus("connecting");

    // Clear previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Clear previous error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    const unsubscribe = offerServices.subscribeToOffers(
      activeHotelName,
      (data) => {
        setOffers(data || []);
        setLoading(false);
        setError(null);
        setConnectionStatus("connected");
        setLastFetch(new Date());
        setRetryCount(0);
      },
      (error) => {
        console.error("Error fetching offers:", error);
        setError(error);
        setLoading(false);
        setConnectionStatus("error");
        setRetryCount((prev) => prev + 1);
      }
    );

    unsubscribeRef.current = unsubscribe;

    // ✅ ENHANCED: Connection timeout with retry logic
    errorTimeoutRef.current = setTimeout(() => {
      if (loading && retryCount < 3) {
        setError(
          new Error("Taking longer than expected to load offers. Retrying...")
        );
        setRetryCount((prev) => prev + 1);
      } else if (retryCount >= 3) {
        setError(new Error("Failed to load offers after multiple attempts"));
        setLoading(false);
        setConnectionStatus("error");
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

  // ✅ ENHANCED: Memoized filtered offers with advanced filtering and sorting
  const filteredOffers = useMemo(() => {
    let filtered = offerServices.filterOffers(offers, searchTerm);

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((offer) => {
        switch (filterType) {
          case "active":
            return offer.isActive && !isOfferExpired(offer);
          case "expired":
            return isOfferExpired(offer);
          case "expiring":
            return isOfferExpiringSoon(offer);
          case "inactive":
            return !offer.isActive;
          case "percentage":
            return offer.offerType === "percentage";
          case "fixed":
            return offer.offerType === "fixed";
          case "buy_one_get_one":
            return offer.offerType === "buy_one_get_one";
          case "free_delivery":
            return offer.offerType === "free_delivery";
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((offer) => {
        if (statusFilter === "active") return offer.isActive;
        if (statusFilter === "inactive") return !offer.isActive;
        return true;
      });
    }

    // Apply discount filter
    filtered = filtered.filter((offer) => {
      const discount = offer.discountValue || 0;
      return discount >= discountFilter.min && discount <= discountFilter.max;
    });

    // Apply sorting
    return offerServices.sortOffers(filtered, sortOrder);
  }, [offers, searchTerm, filterType, statusFilter, discountFilter, sortOrder]);

  // Helper functions for offer validation
  const isOfferExpired = useCallback((offer) => {
    if (!offer.validUntil) return false;
    return new Date(offer.validUntil) < new Date();
  }, []);

  const isOfferExpiringSoon = useCallback(
    (offer) => {
      if (!offer.validUntil || isOfferExpired(offer)) return false;
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return new Date(offer.validUntil) <= weekFromNow;
    },
    [isOfferExpired]
  );

  // ✅ ENHANCED: Add new offer with validation
  const addOffer = useCallback(
    async (offerData) => {
      if (submitting) return false;

      // Additional client-side validation
      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      if (!offerData.offerName?.trim()) {
        setError(new Error("Offer name is required"));
        return false;
      }

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.addOffer(
          activeHotelName,
          offerData,
          offers
        );

        if (success) {
          // Clear search to show new offer
          setSearchTerm("");
        }

        return success;
      } catch (error) {
        console.error("Error in addOffer:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, offers, submitting]
  );

  // Update existing offer
  const updateOffer = useCallback(
    async (offerId, offerData) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.updateOffer(
          activeHotelName,
          offerId,
          offerData,
          offers
        );
        return success;
      } catch (error) {
        console.error("Error in updateOffer:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, offers, submitting]
  );

  // Delete offer
  const deleteOffer = useCallback(
    async (offer) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.deleteOffer(activeHotelName, offer);
        return success;
      } catch (error) {
        console.error("Error in deleteOffer:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // Toggle offer status (active/inactive)
  const toggleOfferStatus = useCallback(
    async (offer) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.toggleOfferStatus(
          activeHotelName,
          offer
        );
        return success;
      } catch (error) {
        console.error("Error in toggleOfferStatus:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // ✅ ENHANCED: Bulk operations for offers
  const bulkUpdateOffers = useCallback(
    async (offerIds, updateData) => {
      if (submitting || !offerIds.length) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.bulkUpdateOffers(
          activeHotelName,
          offerIds,
          updateData
        );
        return success;
      } catch (error) {
        console.error("Error in bulkUpdateOffers:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // ✅ NEW: Bulk update offer status
  const bulkUpdateOfferStatus = useCallback(
    async (offerIds, isActive) => {
      if (submitting || !offerIds.length) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.bulkUpdateOfferStatus?.(
          activeHotelName,
          offerIds,
          isActive
        );
        return success;
      } catch (error) {
        console.error("Error in bulkUpdateOfferStatus:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // Duplicate an existing offer
  const duplicateOffer = useCallback(
    async (offer) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.duplicateOffer(
          activeHotelName,
          offer
        );
        return success;
      } catch (error) {
        console.error("Error in duplicateOffer:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // Prepare offer for editing
  const prepareForEdit = useCallback(
    async (offer) => {
      try {
        const offerToEdit = await offerServices.prepareForEdit(
          activeHotelName,
          offer
        );
        return offerToEdit;
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
    async (offerData, offerId = null) => {
      if (offerId) {
        // Edit mode
        return await updateOffer(offerId, offerData);
      } else {
        // Add mode
        return await addOffer(offerData);
      }
    },
    [addOffer, updateOffer]
  );

  // Handle search change
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((order) => {
    setSortOrder(order);
  }, []);

  // Handle filter type change
  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
  }, []);

  // ✅ NEW: Handle status filter change
  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
  }, []);

  // ✅ NEW: Handle discount filter change
  const handleDiscountFilter = useCallback((min, max) => {
    setDiscountFilter({ min, max });
  }, []);

  // ✅ ENHANCED: Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilterType("all");
    setStatusFilter("all");
    setSortOrder("default");
    setDiscountFilter({ min: 0, max: 100 });
  }, []);

  // ✅ ENHANCED: Refresh offers data with retry logic
  const refreshOffers = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setLastFetch(new Date());
    setConnectionStatus("connecting");
    // The real-time subscription will automatically refresh the data
  }, []);

  // Get offer statistics with memoization
  const getOfferStats = useCallback(async () => {
    try {
      return await offerServices.getOfferStats(activeHotelName);
    } catch (error) {
      console.error("Error getting offer stats:", error);
      setError(error);
      return null;
    }
  }, [activeHotelName]);

  // Validation utilities
  const checkDuplicateOffer = useCallback(
    (offerName, excludeId = null) => {
      return offers.some(
        (offer) =>
          offer.offerName?.toLowerCase() === offerName.toLowerCase() &&
          offer.offerId !== excludeId &&
          offer.id !== excludeId
      );
    },
    [offers]
  );

  const checkDuplicateOfferCode = useCallback(
    (offerCode, excludeId = null) => {
      return offers.some(
        (offer) =>
          offer.offerCode?.toUpperCase() === offerCode.toUpperCase() &&
          offer.offerId !== excludeId &&
          offer.id !== excludeId
      );
    },
    [offers]
  );

  const validateOfferDates = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    return {
      isValid: start < end && end > now,
      errors: {
        startAfterEnd: start >= end,
        endInPast: end <= now,
        startInPast: start <= now,
      },
    };
  }, []);

  // ✅ NEW: Get offer by ID
  const getOfferById = useCallback(
    (offerId) => {
      return offers.find((o) => o.offerId === offerId || o.id === offerId);
    },
    [offers]
  );

  // Filter utilities with memoization
  const getActiveOffers = useCallback(() => {
    return offers.filter((offer) => offer.isActive && !isOfferExpired(offer));
  }, [offers, isOfferExpired]);

  const getExpiredOffers = useCallback(() => {
    return offers.filter(isOfferExpired);
  }, [offers, isOfferExpired]);

  const getExpiringSoonOffers = useCallback(() => {
    return offers.filter(isOfferExpiringSoon);
  }, [offers, isOfferExpiringSoon]);

  const getOffersByType = useCallback(
    (type) => {
      return offers.filter((offer) => offer.offerType === type);
    },
    [offers]
  );

  const getOffersByDiscount = useCallback(
    (minDiscount = 0, maxDiscount = 100) => {
      return offers.filter((offer) => {
        const discount = offer.discountValue || 0;
        return discount >= minDiscount && discount <= maxDiscount;
      });
    },
    [offers]
  );

  // ✅ NEW: Get customer-applicable offers
  const getApplicableOffers = useCallback(
    async (orderAmount = 0) => {
      try {
        return (
          (await offerServices.getAvailableOffers?.(
            activeHotelName,
            orderAmount
          )) || []
        );
      } catch (error) {
        console.error("Error getting applicable offers:", error);
        return [];
      }
    },
    [activeHotelName]
  );

  // ✅ NEW: Apply offer to order
  const applyOfferToOrder = useCallback((offer, orderData) => {
    try {
      return offerServices.applyOfferToOrder?.(offer, orderData) || null;
    } catch (error) {
      console.error("Error applying offer to order:", error);
      return null;
    }
  }, []);

  // ✅ NEW: Export offers data
  const exportOffers = useCallback(() => {
    const dataToExport = filteredOffers.map((offer) => ({
      Name: offer.offerName,
      Code: offer.offerCode,
      Type: offer.offerType,
      Discount: offer.discountValue,
      "Min Order": offer.minimumOrderAmount || 0,
      "Valid From": offer.validFrom,
      "Valid Until": offer.validUntil,
      Status: offer.isActive ? "Active" : "Inactive",
      "Usage Count": offer.currentUsageCount || 0,
      "Max Usage": offer.maxUsageCount || "Unlimited",
      "Created Date": offer.createdAt?.toDate
        ? offer.createdAt.toDate().toLocaleDateString()
        : new Date(offer.createdAt).toLocaleDateString(),
    }));

    return dataToExport;
  }, [filteredOffers]);

  // ✅ ENHANCED: Memoized computed values for better performance
  const computedValues = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      offerCount: offers.length,
      filteredCount: filteredOffers.length,
      hasOffers: offers.length > 0,
      hasSearchResults: filteredOffers.length > 0,
      activeOfferCount: offers.filter(
        (offer) => offer.isActive && !isOfferExpired(offer)
      ).length,
      inactiveOfferCount: offers.filter((offer) => !offer.isActive).length,
      expiredOfferCount: offers.filter(isOfferExpired).length,
      expiringSoonCount: offers.filter(isOfferExpiringSoon).length,

      // ✅ NEW: Additional computed values
      hasFiltersApplied:
        searchTerm ||
        filterType !== "all" ||
        statusFilter !== "all" ||
        discountFilter.min > 0 ||
        discountFilter.max < 100,
      percentageOfferCount: offers.filter((o) => o.offerType === "percentage")
        .length,
      fixedOfferCount: offers.filter((o) => o.offerType === "fixed").length,
      totalUsageCount: offers.reduce(
        (sum, o) => sum + (o.currentUsageCount || 0),
        0
      ),
      averageDiscount:
        offers.length > 0
          ? offers.reduce((sum, o) => sum + (o.discountValue || 0), 0) /
            offers.length
          : 0,
    };
  }, [
    offers,
    filteredOffers,
    searchTerm,
    filterType,
    statusFilter,
    discountFilter,
    isOfferExpired,
    isOfferExpiringSoon,
  ]);

  return {
    // State
    offers,
    filteredOffers,
    searchTerm,
    sortOrder,
    filterType,
    statusFilter,
    discountFilter,
    loading,
    submitting,
    error,
    lastFetch,
    retryCount,
    connectionStatus,

    // Actions
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    bulkUpdateOffers,
    bulkUpdateOfferStatus,
    duplicateOffer,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    handleStatusFilter,
    handleDiscountFilter,
    clearAllFilters,
    refreshOffers,

    // Utilities
    getOfferStats,
    checkDuplicateOffer,
    checkDuplicateOfferCode,
    validateOfferDates,
    getOfferById,
    getActiveOffers,
    getExpiredOffers,
    getExpiringSoonOffers,
    getOffersByType,
    getOffersByDiscount,
    getApplicableOffers,
    applyOfferToOrder,
    exportOffers,
    isOfferExpired,
    isOfferExpiringSoon,

    // Computed values (using memoized values)
    ...computedValues,

    // ✅ NEW: Connection and retry status
    isRetrying: retryCount > 0 && loading,
    canRetry: retryCount < 3 && error,
    dataAge: lastFetch ? Date.now() - lastFetch.getTime() : null,

    // Meta info
    activeHotelName,
    currentUser,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setSortOrder,
    setFilterType,
    setStatusFilter,
    setDiscountFilter,
    setOffers,
    setError,
  };
};

// ✅ NEW: Hook for customer-facing offer selection
export const useCustomerOffers = (hotelName, orderAmount = 0) => {
  const { getApplicableOffers, applyOfferToOrder, loading, error } =
    useOffers(hotelName);

  const [applicableOffers, setApplicableOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [appliedOffer, setAppliedOffer] = useState(null);

  // Load applicable offers when order amount changes
  useEffect(() => {
    const loadOffers = async () => {
      const offers = await getApplicableOffers(orderAmount);
      setApplicableOffers(offers);
    };

    if (hotelName && orderAmount >= 0) {
      loadOffers();
    }
  }, [hotelName, orderAmount, getApplicableOffers]);

  const selectOffer = useCallback((offer) => {
    setSelectedOffer(offer);
  }, []);

  const applyOffer = useCallback(
    (orderData) => {
      if (!selectedOffer) return null;

      const result = applyOfferToOrder(selectedOffer, orderData);
      if (result) {
        setAppliedOffer(result);
      }
      return result;
    },
    [selectedOffer, applyOfferToOrder]
  );

  const clearOffer = useCallback(() => {
    setSelectedOffer(null);
    setAppliedOffer(null);
  }, []);

  return {
    applicableOffers,
    selectedOffer,
    appliedOffer,
    loading,
    error,
    selectOffer,
    applyOffer,
    clearOffer,
    hasApplicableOffers: applicableOffers.length > 0,
    canApplyOffer: !!selectedOffer,
    discountAmount: appliedOffer?.discountAmount || 0,
  };
};

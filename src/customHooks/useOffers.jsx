import { useState, useEffect, useCallback, useMemo } from "react";
import { offerServices } from "../services/offersService";

export const useOffers = (hotelName) => {
  // State management
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [filterType, setFilterType] = useState("all");

  // Subscribe to offers data
  useEffect(() => {
    if (!hotelName) {
      setOffers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = offerServices.subscribeToOffers(
      hotelName,
      (data) => {
        setOffers(data);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching offers:", error);
        setError(error);
        setLoading(false);
      }
    );

    // Handle potential connection errors
    const errorTimeout = setTimeout(() => {
      if (loading) {
        setError(new Error("Taking longer than expected to load offers"));
        setLoading(false);
      }
    }, 10000);

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      unsubscribe();
      clearTimeout(errorTimeout);
    };
  }, [hotelName]);

  // Memoized filtered offers with advanced filtering and sorting
  const filteredOffers = useMemo(() => {
    let filtered = offerServices.filterOffers(offers, searchTerm);
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(offer => {
        switch (filterType) {
          case "active":
            return offer.isActive;
          case "expired":
            const now = new Date();
            return offer.validUntil && new Date(offer.validUntil) < now;
          case "expiring":
            const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return offer.validUntil && 
                   new Date(offer.validUntil) > new Date() && 
                   new Date(offer.validUntil) <= weekFromNow;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    return offerServices.sortOffers(filtered, sortOrder);
  }, [offers, searchTerm, filterType, sortOrder]);

  // Add new offer
  const addOffer = useCallback(
    async (offerData) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.addOffer(
          hotelName,
          offerData,
          offers
        );
        return success;
      } catch (error) {
        console.error("Error in addOffer:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, offers, submitting]
  );

  // Update existing offer
  const updateOffer = useCallback(
    async (offerId, offerData) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.updateOffer(
          hotelName,
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
    [hotelName, offers, submitting]
  );

  // Delete offer
  const deleteOffer = useCallback(
    async (offer) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.deleteOffer(hotelName, offer);
        return success;
      } catch (error) {
        console.error("Error in deleteOffer:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Toggle offer status (active/inactive)
  const toggleOfferStatus = useCallback(
    async (offer) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.toggleOfferStatus(hotelName, offer);
        return success;
      } catch (error) {
        console.error("Error in toggleOfferStatus:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Bulk operations for offers
  const bulkUpdateOffers = useCallback(
    async (offerIds, updateData) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.bulkUpdateOffers(
          hotelName,
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
    [hotelName, submitting]
  );

  // Duplicate an existing offer
  const duplicateOffer = useCallback(
    async (offer) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const success = await offerServices.duplicateOffer(hotelName, offer);
        return success;
      } catch (error) {
        console.error("Error in duplicateOffer:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Prepare offer for editing
  const prepareForEdit = useCallback(
    async (offer) => {
      try {
        const offerToEdit = await offerServices.prepareForEdit(
          hotelName,
          offer
        );
        return offerToEdit;
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

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilterType("all");
    setSortOrder("default");
  }, []);

  // Refresh offers data
  const refreshOffers = useCallback(() => {
    setError(null);
    // The real-time subscription will automatically refresh the data
    // This function exists for UI consistency
  }, []);

  // Get offer statistics with memoization
  const getOfferStats = useCallback(async () => {
    try {
      return await offerServices.getOfferStats(hotelName);
    } catch (error) {
      console.error("Error getting offer stats:", error);
      setError(error);
      return null;
    }
  }, [hotelName]);

  // Validation utilities
  const checkDuplicateOffer = useCallback(
    (offerName, excludeId = null) => {
      return offers.some(
        (offer) =>
          offer.offerName?.toLowerCase() === offerName.toLowerCase() &&
          offer.offerId !== excludeId
      );
    },
    [offers]
  );

  const checkDuplicateOfferCode = useCallback(
    (offerCode, excludeId = null) => {
      return offers.some(
        (offer) =>
          offer.offerCode?.toUpperCase() === offerCode.toUpperCase() &&
          offer.offerId !== excludeId
      );
    },
    [offers]
  );

  const validateOfferDates = useCallback(
    (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      
      return {
        isValid: start < end && end > now,
        errors: {
          startAfterEnd: start >= end,
          endInPast: end <= now,
        }
      };
    },
    []
  );

  // Filter utilities with memoization
  const getActiveOffers = useCallback(() => {
    return offers.filter((offer) => offer.isActive);
  }, [offers]);

  const getExpiredOffers = useCallback(() => {
    const now = new Date();
    return offers.filter((offer) => {
      if (!offer.validUntil) return false;
      return new Date(offer.validUntil) < now;
    });
  }, [offers]);

  const getExpiringSoonOffers = useCallback(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return offers.filter((offer) => {
      if (!offer.validUntil) return false;
      const expiry = new Date(offer.validUntil);
      return expiry > now && expiry <= weekFromNow;
    });
  }, [offers]);

  const getOffersByType = useCallback(
    (type) => {
      return offers.filter((offer) => offer.offerType === type);
    },
    [offers]
  );

  const getOffersByDiscount = useCallback(
    (minDiscount = 0, maxDiscount = 100) => {
      return offers.filter((offer) => {
        const discount = offer.discountPercentage || 0;
        return discount >= minDiscount && discount <= maxDiscount;
      });
    },
    [offers]
  );

  // Memoized computed values for better performance
  const computedValues = useMemo(() => {
    const now = new Date();
    return {
      offerCount: offers.length,
      filteredCount: filteredOffers.length,
      hasOffers: offers.length > 0,
      hasSearchResults: filteredOffers.length > 0,
      activeOfferCount: offers.filter((offer) => offer.isActive).length,
      inactiveOfferCount: offers.filter((offer) => !offer.isActive).length,
      expiredOfferCount: offers.filter((offer) => {
        if (!offer.validUntil) return false;
        return new Date(offer.validUntil) < now;
      }).length,
      expiringSoonCount: offers.filter((offer) => {
        if (!offer.validUntil) return false;
        const expiry = new Date(offer.validUntil);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return expiry > now && expiry <= weekFromNow;
      }).length,
    };
  }, [offers, filteredOffers]);

  return {
    // State
    offers,
    filteredOffers,
    searchTerm,
    sortOrder,
    filterType,
    loading,
    submitting,
    error,

    // Actions
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    bulkUpdateOffers,
    duplicateOffer,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    clearAllFilters,
    refreshOffers,

    // Utilities
    getOfferStats,
    checkDuplicateOffer,
    checkDuplicateOfferCode,
    validateOfferDates,
    getActiveOffers,
    getExpiredOffers,
    getExpiringSoonOffers,
    getOffersByType,
    getOffersByDiscount,

    // Computed values (using memoized values)
    ...computedValues,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setSortOrder,
    setFilterType,
    setOffers,
    setError,
  };
};

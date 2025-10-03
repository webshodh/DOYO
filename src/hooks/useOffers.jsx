// useOffers.js (OPTIMIZED)
import { useState, useEffect, useCallback, useMemo } from "react";
import { offerServices } from "../services/api/offersService";

export const useOffers = (hotelName) => {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (!hotelName) {
      setOffers([]);
      setLoading(false);
      return;
    }

    let unsubscribe;
    let isMounted = true; // Prevent state updates if component unmounted

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      unsubscribe = offerServices.subscribeToOffers(
        hotelName,
        (data) => {
          if (!isMounted) return; // Component unmounted during callback
          setOffers(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          if (!isMounted) return; // Component unmounted during error
          console.error("Error fetching offers:", err);
          const errorMessage = err.message || "Error fetching offers";
          setError(errorMessage);
          setLoading(false);
        },
      );
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [hotelName]); // Only re-subscribe if hotelName changes

  // Memoize filtered offers with optimized date calculations
  const filteredOffers = useMemo(() => {
    let filtered = offerServices.filterOffers(offers, searchTerm);

    if (filterType !== "all") {
      const now = new Date();
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((offer) => {
        switch (filterType) {
          case "active":
            return offer.isActive;
          case "expired":
            return offer.validUntil && new Date(offer.validUntil) < now;
          case "expiring":
            return (
              offer.validUntil &&
              new Date(offer.validUntil) > now &&
              new Date(offer.validUntil) <= weekFromNow
            );
          default:
            return true;
        }
      });
    }

    return offerServices.sortOffers(filtered, sortOrder);
  }, [offers, searchTerm, filterType, sortOrder]);

  // Optimize addOffer with stable dependencies
  const addOffer = useCallback(
    async (offerData) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);
      try {
        const success = await offerServices.addOffer(
          hotelName,
          offerData,
          offers,
        );
        return success;
      } catch (error) {
        console.error("Error in addOffer:", error);
        const errorMessage = error.message || "Error adding offer";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting], // Removed offers to prevent unnecessary re-renders
  );

  const updateOffer = useCallback(
    async (offerId, offerData) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);
      try {
        const success = await offerServices.updateOffer(
          hotelName,
          offerId,
          offerData,
          offers,
        );
        return success;
      } catch (error) {
        console.error("Error in updateOffer:", error);
        const errorMessage = error.message || "Error updating offer";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting], // Removed offers to prevent unnecessary re-renders
  );

  const deleteOffer = useCallback(
    async (offer) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);
      try {
        const success = await offerServices.deleteOffer(hotelName, offer);
        return success;
      } catch (error) {
        console.error("Error in deleteOffer:", error);
        const errorMessage = error.message || "Error deleting offer";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting],
  );

  const toggleOfferStatus = useCallback(
    async (offer) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);
      try {
        const success = await offerServices.toggleOfferStatus(hotelName, offer);
        return success;
      } catch (error) {
        console.error("Error in toggleOfferStatus:", error);
        const errorMessage = error.message || "Error toggling offer status";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting],
  );

  // Memoize additional utility functions to prevent recreation
  const utilityFunctions = useMemo(
    () => ({
      bulkUpdateOffers: async (offerIds, updateData) => {
        if (submitting) return false;
        setSubmitting(true);
        setError(null);
        try {
          const success = await offerServices.bulkUpdateOffers(
            hotelName,
            offerIds,
            updateData,
          );
          return success;
        } catch (error) {
          console.error("Error in bulkUpdateOffers:", error);
          const errorMessage = error.message || "Error bulk updating offers";
          setError(errorMessage);
          return false;
        } finally {
          setSubmitting(false);
        }
      },

      duplicateOffer: async (offer) => {
        if (submitting) return false;
        setSubmitting(true);
        setError(null);
        try {
          const success = await offerServices.duplicateOffer(hotelName, offer);
          return success;
        } catch (error) {
          console.error("Error in duplicateOffer:", error);
          const errorMessage = error.message || "Error duplicating offer";
          setError(errorMessage);
          return false;
        } finally {
          setSubmitting(false);
        }
      },

      prepareForEdit: async (offer) => {
        try {
          return await offerServices.prepareForEdit(hotelName, offer);
        } catch (error) {
          console.error("Error in prepareForEdit:", error);
          const errorMessage =
            error.message || "Error preparing offer for edit";
          setError(errorMessage);
          return null;
        }
      },

      getOfferStats: async () => {
        try {
          return await offerServices.getOfferStats(hotelName);
        } catch (error) {
          console.error("Error getting offer stats:", error);
          const errorMessage = error.message || "Error getting offer stats";
          setError(errorMessage);
          return null;
        }
      },

      // Validation utilities
      checkDuplicateOffer: (name, excludeId = null) =>
        offers.some(
          (offer) =>
            offer.offerName?.toLowerCase() === name.toLowerCase() &&
            offer.id !== excludeId,
        ),

      validateOfferDates: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start >= end) {
          return {
            valid: false,
            message: "Start date must be before end date",
          };
        }
        if (end <= now) {
          return { valid: false, message: "End date must be in the future" };
        }
        return { valid: true };
      },

      getActiveOffers: () => offers.filter((offer) => offer.isActive),
      getExpiredOffers: () =>
        offers.filter(
          (offer) =>
            offer.validUntil && new Date(offer.validUntil) < new Date(),
        ),
      getExpiringOffers: () => {
        const now = new Date();
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return offers.filter(
          (offer) =>
            offer.validUntil &&
            new Date(offer.validUntil) > now &&
            new Date(offer.validUntil) <= weekFromNow,
        );
      },
    }),
    [hotelName, offers, submitting],
  );

  // Form and filter handlers
  const handlers = useMemo(
    () => ({
      handleFormSubmit: async (offerData, offerId = null) => {
        if (offerId) {
          return await updateOffer(offerId, offerData);
        } else {
          return await addOffer(offerData);
        }
      },

      handleSearchChange: (term) => setSearchTerm(term),
      handleSortChange: (order) => setSortOrder(order),
      handleFilterChange: (type) => setFilterType(type),

      clearAllFilters: () => {
        setSearchTerm("");
        setSortOrder("default");
        setFilterType("all");
      },

      refreshOffers: () => {
        setError(null);
        // Real-time subscription auto refreshes data
      },
    }),
    [addOffer, updateOffer],
  );

  // Memoize computed values to prevent recalculation
  const computedValues = useMemo(() => {
    const activeOffers = offers.filter((offer) => offer.isActive);
    const expiredOffers = offers.filter(
      (offer) => offer.validUntil && new Date(offer.validUntil) < new Date(),
    );

    return {
      offerCount: offers.length,
      filteredCount: filteredOffers.length,
      hasOffers: offers.length > 0,
      hasSearchResults: filteredOffers.length > 0,
      activeOfferCount: activeOffers.length,
      expiredOfferCount: expiredOffers.length,
      hasFiltersApplied:
        searchTerm || sortOrder !== "default" || filterType !== "all",
    };
  }, [
    offers.length,
    filteredOffers.length,
    offers,
    searchTerm,
    sortOrder,
    filterType,
  ]);

  return {
    // Data
    offers,
    filteredOffers,
    searchTerm,
    sortOrder,
    filterType,

    // State
    loading,
    submitting,
    error,

    // CRUD Actions
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,

    // Utility functions (memoized)
    ...utilityFunctions,

    // Handlers (memoized)
    ...handlers,

    // Computed values (memoized)
    ...computedValues,

    // Setters for advanced usage
    setSearchTerm,
    setSortOrder,
    setFilterType,
    setOffers,
    setError,
  };
};

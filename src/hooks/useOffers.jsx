// useOffers.js
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

    setLoading(true);
    setError(null);

    const unsubscribe = offerServices.subscribeToOffers(
      hotelName,
      (data) => {
        setOffers(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching offers:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hotelName]);

  const filteredOffers = useMemo(() => {
    let filtered = offerServices.filterOffers(offers, searchTerm);

    if (filterType !== "all") {
      filtered = filtered.filter((offer) => {
        switch (filterType) {
          case "active":
            return offer.isActive;
          case "expired":
            return offer.validUntil && new Date(offer.validUntil) < new Date();
          case "expiring":
            const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return (
              offer.validUntil &&
              new Date(offer.validUntil) > new Date() &&
              new Date(offer.validUntil) <= weekFromNow
            );
          default:
            return true;
        }
      });
    }

    return offerServices.sortOffers(filtered, sortOrder);
  }, [offers, searchTerm, filterType, sortOrder]);

  const addOffer = useCallback(
    async (offerData) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);
      try {
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
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
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
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Additional callbacks: bulkUpdateOffers, duplicateOffer, prepareForEdit, handleFormSubmit, handleSearchChange, handleSortChange, handleFilterChange, clearAllFilters, refreshOffers, getOfferStats, validation utils...

  // You can implement these similarly from your existing code pattern, adapting to Firestore as above.

  return {
    offers,
    filteredOffers,
    searchTerm,
    sortOrder,
    filterType,
    loading,
    submitting,
    error,
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    // ...other actions and utilities
    setSearchTerm,
    setSortOrder,
    setFilterType,
    setOffers,
    setError,
  };
};

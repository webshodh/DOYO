import { useState, useEffect, useCallback } from "react";
import { offerServices } from "../services/offersService";

export const useOffers = (hotelName) => {
  // State management
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Subscribe to offers data
  useEffect(() => {
    if (!hotelName) {
      setOffers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = offerServices.subscribeToOffers(hotelName, (data) => {
      setOffers(data);
      setLoading(false);
    });

    // Cleanup subscription on component unmount or hotelName change
    return () => unsubscribe();
  }, [hotelName]);

  // Filter offers based on search term
  const filteredOffers = offerServices.filterOffers(offers, searchTerm);

  // Add new offer
  const addOffer = useCallback(
    async (offerData) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await offerServices.addOffer(
          hotelName,
          offerData,
          offers
        );
        return success;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, offers, submitting]
  );

  // Update existing offer
  const updateOffer = useCallback(
    async (offerData, offerId) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await offerServices.updateOffer(
          hotelName,
          offerId,
          offerData,
          offers
        );
        return success;
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
        const success = await offerServices.deleteOffer(hotelName, offer);
        return success;
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
        const success = await offerServices.toggleOfferStatus(hotelName, offer);
        return success;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Prepare offer for editing
  const prepareForEdit = useCallback(
    async (offer) => {
      const offerToEdit = await offerServices.prepareForEdit(hotelName, offer);
      return offerToEdit;
    },
    [hotelName]
  );

  // Handle form submission (both add and edit)
  const handleFormSubmit = useCallback(
    async (offerData, offerId = null) => {
      if (offerId) {
        // Edit mode
        return await updateOffer(offerData, offerId);
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

  // Get offer statistics
  const getOfferStats = useCallback(async () => {
    return await offerServices.getOfferStats(hotelName);
  }, [hotelName]);

  // Check if offer name already exists
  const checkDuplicateOffer = useCallback(
    (offerName, excludeId = null) => {
      return offers.some(
        (offer) =>
          offer.offerName.toLowerCase() === offerName.toLowerCase() &&
          offer.offerId !== excludeId
      );
    },
    [offers]
  );

  // Get active offers only
  const getActiveOffers = useCallback(() => {
    return offers.filter((offer) => offer.isActive);
  }, [offers]);

  // Get expired offers
  const getExpiredOffers = useCallback(() => {
    const now = new Date();
    return offers.filter((offer) => {
      if (!offer.validUntil) return false;
      return new Date(offer.validUntil) < now;
    });
  }, [offers]);

  return {
    // State
    offers,
    filteredOffers,
    searchTerm,
    loading,
    submitting,

    // Actions
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,

    // Utilities
    getOfferStats,
    checkDuplicateOffer,
    getActiveOffers,
    getExpiredOffers,

    // Computed values
    offerCount: offers.length,
    filteredCount: filteredOffers.length,
    hasOffers: offers.length > 0,
    hasSearchResults: filteredOffers.length > 0,
    activeOfferCount: offers.filter((offer) => offer.isActive).length,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setOffers,
  };
};

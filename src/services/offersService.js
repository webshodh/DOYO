import { db } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import {
  validateOfferFormWithToast,
  sanitizeOfferData,
  isOfferExpired,
} from "../validation/offeresValidation";

export const offerServices = {
  // Get current admin ID
  getCurrentAdminId: () => {
    const auth = getAuth();
    return auth.currentUser?.uid;
  },

  // Check if admin has permission for the hotel
  checkAdminPermission: async (hotelName) => {
    try {
      const adminId = offerServices.getCurrentAdminId();
      if (!adminId) {
        throw new Error("Admin not authenticated");
      }

      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminId}/hotels/${hotelName}/uuid`)).then(
          (snapshot) => snapshot.val()
        ),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) =>
          snapshot.val()
        ),
      ]);

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  },

  // Subscribe to offers changes with real-time updates
  subscribeToOffers: (hotelName, callback, errorCallback = null) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }

    const unsubscribe = onValue(
      ref(db, `/hotels/${hotelName}/offers/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const offersArray = Object.values(data).map((offer, index) => ({
            ...offer,
            srNo: index + 1,
            isExpired: isOfferExpired(offer),
            // Calculate status display
            statusDisplay: offer.isActive
              ? isOfferExpired(offer)
                ? "Expired"
                : "Active"
              : "Inactive",
          }));

          // Sort by creation date (newest first)
          offersArray.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          callback(offersArray);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error("Error fetching offers:", error);
        if (errorCallback) {
          errorCallback(error);
        } else {
          toast.error("Error loading offers", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
        callback([]);
      }
    );

    return unsubscribe;
  },

  // Sort offers based on different criteria
  sortOffers: (offers, sortOrder = "default") => {
    if (!Array.isArray(offers)) return [];

    const sortedOffers = [...offers];

    switch (sortOrder) {
      case "name_asc":
        return sortedOffers.sort((a, b) =>
          (a.offerName || "").localeCompare(b.offerName || "")
        );

      case "name_desc":
        return sortedOffers.sort((a, b) =>
          (b.offerName || "").localeCompare(a.offerName || "")
        );

      case "date_asc":
        return sortedOffers.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );

      case "date_desc":
      case "newest":
        return sortedOffers.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

      case "expiry_asc":
        return sortedOffers.sort((a, b) => {
          const dateA = new Date(a.validUntil || "9999-12-31");
          const dateB = new Date(b.validUntil || "9999-12-31");
          return dateA - dateB;
        });

      case "expiry_desc":
        return sortedOffers.sort((a, b) => {
          const dateA = new Date(a.validUntil || "9999-12-31");
          const dateB = new Date(b.validUntil || "9999-12-31");
          return dateB - dateA;
        });

      case "discount_asc":
        return sortedOffers.sort(
          (a, b) => (a.discountValue || 0) - (b.discountValue || 0)
        );

      case "discount_desc":
        return sortedOffers.sort(
          (a, b) => (b.discountValue || 0) - (a.discountValue || 0)
        );

      case "usage_asc":
        return sortedOffers.sort(
          (a, b) => (a.currentUsageCount || 0) - (b.currentUsageCount || 0)
        );

      case "usage_desc":
        return sortedOffers.sort(
          (a, b) => (b.currentUsageCount || 0) - (a.currentUsageCount || 0)
        );

      case "status":
        return sortedOffers.sort((a, b) => {
          const statusA = a.isActive ? (isOfferExpired(a) ? 2 : 0) : 1;
          const statusB = b.isActive ? (isOfferExpired(b) ? 2 : 0) : 1;
          return statusA - statusB;
        });

      case "default":
      default:
        // Default sort by creation date (newest first)
        return sortedOffers.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }
  },

  // Add new offer
  addOffer: async (hotelName, offerData, existingOffers = []) => {
    try {
      // Validate offer data
      if (!validateOfferFormWithToast(offerData, existingOffers)) {
        return false;
      }

      // Check permissions
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error("You do not have permission to add offers for this hotel", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      // Sanitize and prepare offer data
      const sanitizedData = sanitizeOfferData(offerData);
      const offerId = uid();
      const offerRecord = {
        ...sanitizedData,
        offerId,
        createdAt: new Date().toISOString(),
        createdBy: offerServices.getCurrentAdminId(),
        currentUsageCount: 0,
        isExpired: false,
      };

      // Save to database
      await set(ref(db, `/hotels/${hotelName}/offers/${offerId}`), offerRecord);

      toast.success("Offer added successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error adding offer:", error);
      toast.error("Error adding offer. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Update existing offer
  updateOffer: async (hotelName, offerId, offerData, existingOffers = []) => {
    try {
      // Validate offer data
      if (!validateOfferFormWithToast(offerData, existingOffers, offerId)) {
        return false;
      }

      // Check permissions
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to update offers for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Confirm update
      const confirmUpdate = window.confirm(
        "Are you sure you want to update this offer?"
      );
      if (!confirmUpdate) {
        return false;
      }

      // Get existing offer data to preserve usage count
      const existingOfferSnapshot = await get(
        ref(db, `/hotels/${hotelName}/offers/${offerId}`)
      );
      const existingOffer = existingOfferSnapshot.val();

      // Sanitize and prepare updated data
      const sanitizedData = sanitizeOfferData(offerData);
      const updateData = {
        ...sanitizedData,
        offerId,
        updatedAt: new Date().toISOString(),
        updatedBy: offerServices.getCurrentAdminId(),
        // Preserve existing usage data
        currentUsageCount: existingOffer?.currentUsageCount || 0,
        createdAt: existingOffer?.createdAt,
        createdBy: existingOffer?.createdBy,
      };

      // Update in database
      await update(
        ref(db, `/hotels/${hotelName}/offers/${offerId}`),
        updateData
      );

      toast.success("Offer updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("Error updating offer. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Delete offer
  deleteOffer: async (hotelName, offer) => {
    try {
      // Check permissions
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to delete offers for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Check if offer has been used
      if (offer.currentUsageCount > 0) {
        const confirmDelete = window.confirm(
          `This offer "${offer.offerName}" has been used ${offer.currentUsageCount} times. Are you sure you want to delete it? This action cannot be undone.`
        );
        if (!confirmDelete) {
          return false;
        }
      } else {
        const confirmDelete = window.confirm(
          `Are you sure you want to delete the offer "${offer.offerName}"? This action cannot be undone.`
        );
        if (!confirmDelete) {
          return false;
        }
      }

      // Delete from database
      await remove(ref(db, `/hotels/${hotelName}/offers/${offer.offerId}`));

      toast.success("Offer deleted successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Error deleting offer. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Toggle offer status (active/inactive)
  toggleOfferStatus: async (hotelName, offer) => {
    try {
      // Check permissions
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to modify offers for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      const newStatus = !offer.isActive;
      const statusText = newStatus ? "activate" : "deactivate";

      const confirmToggle = window.confirm(
        `Are you sure you want to ${statusText} the offer "${offer.offerName}"?`
      );
      if (!confirmToggle) {
        return false;
      }

      // Update status in database
      await update(ref(db, `/hotels/${hotelName}/offers/${offer.offerId}`), {
        isActive: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: offerServices.getCurrentAdminId(),
      });

      toast.success(`Offer ${statusText}d successfully!`, {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error toggling offer status:", error);
      toast.error("Error updating offer status. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Prepare offer for editing
  prepareForEdit: async (hotelName, offer) => {
    try {
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to edit offers for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return null;
      }
      return offer;
    } catch (error) {
      console.error("Error preparing offer for edit:", error);
      toast.error("Error preparing offer for editing", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },

  // Filter offers based on search term
  filterOffers: (offers, searchTerm) => {
    if (!searchTerm.trim()) {
      return offers.map((offer, index) => ({
        ...offer,
        srNo: index + 1,
      }));
    }

    return offers
      .filter((offer) => {
        const search = searchTerm.toLowerCase();
        return (
          offer.offerName?.toLowerCase().includes(search) ||
          offer.offerDescription?.toLowerCase().includes(search) ||
          offer.offerType?.toLowerCase().includes(search) ||
          offer.offerCode?.toLowerCase().includes(search)
        );
      })
      .map((offer, index) => ({
        ...offer,
        srNo: index + 1,
      }));
  },

  // Bulk operations for offers
  bulkUpdateOffers: async (hotelName, offerIds, updateData) => {
    try {
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to modify offers for this hotel"
        );
        return false;
      }

      const confirmBulk = window.confirm(
        `Are you sure you want to update ${offerIds.length} offers?`
      );
      if (!confirmBulk) return false;

      const updates = {};
      const timestamp = new Date().toISOString();
      const adminId = offerServices.getCurrentAdminId();

      offerIds.forEach((offerId) => {
        Object.keys(updateData).forEach((key) => {
          updates[`/hotels/${hotelName}/offers/${offerId}/${key}`] =
            updateData[key];
        });
        updates[`/hotels/${hotelName}/offers/${offerId}/updatedAt`] = timestamp;
        updates[`/hotels/${hotelName}/offers/${offerId}/updatedBy`] = adminId;
      });

      await update(ref(db), updates);

      toast.success(`${offerIds.length} offers updated successfully!`);
      return true;
    } catch (error) {
      console.error("Error bulk updating offers:", error);
      toast.error("Error updating offers. Please try again.");
      return false;
    }
  },

  // Duplicate an existing offer
  duplicateOffer: async (hotelName, offer) => {
    try {
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error("You do not have permission to add offers for this hotel");
        return false;
      }

      const confirmDuplicate = window.confirm(
        `Are you sure you want to create a copy of "${offer.offerName}"?`
      );
      if (!confirmDuplicate) return false;

      const newOfferId = uid();
      const duplicatedOffer = {
        ...offer,
        offerId: newOfferId,
        offerName: `${offer.offerName} (Copy)`,
        offerCode: `${offer.offerCode}_COPY_${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: offerServices.getCurrentAdminId(),
        currentUsageCount: 0,
        isActive: false, // Set as inactive by default
      };

      // Remove fields that shouldn't be duplicated
      delete duplicatedOffer.updatedAt;
      delete duplicatedOffer.updatedBy;

      await set(
        ref(db, `/hotels/${hotelName}/offers/${newOfferId}`),
        duplicatedOffer
      );

      toast.success("Offer duplicated successfully!");
      return true;
    } catch (error) {
      console.error("Error duplicating offer:", error);
      toast.error("Error duplicating offer. Please try again.");
      return false;
    }
  },

  // Get offer statistics
  getOfferStats: async (hotelName) => {
    try {
      const offerSnapshot = await get(ref(db, `/hotels/${hotelName}/offers`));

      if (!offerSnapshot.exists()) {
        return {
          totalOffers: 0,
          activeOffers: 0,
          expiredOffers: 0,
          totalUsage: 0,
          mostUsedOffer: null,
        };
      }

      const offers = Object.values(offerSnapshot.val());
      const now = new Date();

      const stats = {
        totalOffers: offers.length,
        activeOffers: offers.filter(
          (offer) => offer.isActive && !isOfferExpired(offer)
        ).length,
        expiredOffers: offers.filter((offer) => isOfferExpired(offer)).length,
        inactiveOffers: offers.filter((offer) => !offer.isActive).length,
        totalUsage: offers.reduce(
          (sum, offer) => sum + (offer.currentUsageCount || 0),
          0
        ),
        mostUsedOffer: offers.reduce(
          (max, offer) =>
            (offer.currentUsageCount || 0) > (max?.currentUsageCount || 0)
              ? offer
              : max,
          null
        ),
      };

      return stats;
    } catch (error) {
      console.error("Error getting offer stats:", error);
      return null;
    }
  },

  // Increment offer usage count
  incrementOfferUsage: async (hotelName, offerId) => {
    try {
      const offerRef = ref(db, `/hotels/${hotelName}/offers/${offerId}`);
      const offerSnapshot = await get(offerRef);

      if (offerSnapshot.exists()) {
        const offer = offerSnapshot.val();
        const newUsageCount = (offer.currentUsageCount || 0) + 1;

        await update(offerRef, {
          currentUsageCount: newUsageCount,
          lastUsedAt: new Date().toISOString(),
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error incrementing offer usage:", error);
      return false;
    }
  },

  // Get active and valid offers for customers
  getAvailableOffers: async (hotelName, orderAmount = 0) => {
    try {
      const offerSnapshot = await get(ref(db, `/hotels/${hotelName}/offers`));

      if (!offerSnapshot.exists()) {
        return [];
      }

      const offers = Object.values(offerSnapshot.val());
      const now = new Date();

      return offers.filter((offer) => {
        // Check if offer is active
        if (!offer.isActive) return false;

        // Check if offer is expired
        if (isOfferExpired(offer)) return false;

        // Check if offer has started
        const fromDate = new Date(offer.validFrom);
        if (now < fromDate) return false;

        // Check minimum order amount
        if (
          offer.minimumOrderAmount &&
          orderAmount < offer.minimumOrderAmount
        ) {
          return false;
        }

        // Check max usage limit
        if (
          offer.maxUsageCount &&
          offer.currentUsageCount >= offer.maxUsageCount
        ) {
          return false;
        }

        return true;
      });
    } catch (error) {
      console.error("Error getting available offers:", error);
      return [];
    }
  },

  // Apply offer to order (calculate discount)
  applyOfferToOrder: (offer, orderData) => {
    try {
      let discountAmount = 0;
      const { subtotal, items } = orderData;

      switch (offer.offerType) {
        case "percentage":
          discountAmount = (subtotal * offer.discountValue) / 100;
          break;

        case "fixed":
          discountAmount = Math.min(offer.discountValue, subtotal);
          break;

        case "free_delivery":
          discountAmount = orderData.deliveryCharges || 0;
          break;

        case "buy_one_get_one":
          // Implementation depends on your business logic
          // This is a simplified version
          discountAmount = items.reduce((total, item) => {
            const itemDiscount = Math.floor(item.quantity / 2) * item.price;
            return total + itemDiscount;
          }, 0);
          break;

        case "combo":
          // Custom combo logic - implement based on your requirements
          discountAmount = offer.discountValue || 0;
          break;

        default:
          discountAmount = 0;
      }

      return {
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
        finalAmount: Math.max(0, subtotal - discountAmount),
        offerApplied: offer,
      };
    } catch (error) {
      console.error("Error applying offer:", error);
      return {
        discountAmount: 0,
        finalAmount: orderData.subtotal,
        offerApplied: null,
      };
    }
  },

  // Check if customer can use offer (usage per customer limit)
  canCustomerUseOffer: async (hotelName, offerId, customerId) => {
    try {
      if (!customerId) return true; // Allow for guest users

      // Get customer's usage history for this offer
      const usageRef = ref(
        db,
        `/hotels/${hotelName}/offerUsage/${offerId}/${customerId}`
      );
      const usageSnapshot = await get(usageRef);

      if (!usageSnapshot.exists()) {
        return true; // Customer hasn't used this offer
      }

      const usage = usageSnapshot.val();
      const offer = await get(
        ref(db, `/hotels/${hotelName}/offers/${offerId}`)
      );
      const offerData = offer.val();

      if (!offerData.usagePerCustomer) {
        return true; // No per-customer limit
      }

      return usage.count < offerData.usagePerCustomer;
    } catch (error) {
      console.error("Error checking customer offer usage:", error);
      return false;
    }
  },

  // Record offer usage by customer
  recordOfferUsage: async (hotelName, offerId, customerId, orderData) => {
    try {
      if (!customerId) return; // Skip for guest users

      const usageRef = ref(
        db,
        `/hotels/${hotelName}/offerUsage/${offerId}/${customerId}`
      );
      const usageSnapshot = await get(usageRef);

      let usageData;
      if (usageSnapshot.exists()) {
        const existing = usageSnapshot.val();
        usageData = {
          count: existing.count + 1,
          lastUsed: new Date().toISOString(),
          totalSavings: (existing.totalSavings || 0) + orderData.discountAmount,
        };
      } else {
        usageData = {
          count: 1,
          firstUsed: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          totalSavings: orderData.discountAmount,
        };
      }

      await set(usageRef, usageData);

      // Also increment the global usage count
      await offerServices.incrementOfferUsage(hotelName, offerId);
    } catch (error) {
      console.error("Error recording offer usage:", error);
    }
  },

  // Get offers by type
  getOffersByType: (offers, offerType) => {
    return offers.filter((offer) => offer.offerType === offerType);
  },

  // Get offers expiring soon (within next 7 days)
  getOffersExpiringSoon: (offers) => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return offers.filter((offer) => {
      if (!offer.isActive) return false;
      const untilDate = new Date(offer.validUntil);
      const now = new Date();
      return untilDate > now && untilDate <= sevenDaysFromNow;
    });
  },

  // Bulk update offer status
  bulkUpdateOfferStatus: async (hotelName, offerIds, isActive) => {
    try {
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to modify offers for this hotel"
        );
        return false;
      }

      const statusText = isActive ? "activate" : "deactivate";
      const confirmBulk = window.confirm(
        `Are you sure you want to ${statusText} ${offerIds.length} offers?`
      );

      if (!confirmBulk) return false;

      const updates = {};
      const timestamp = new Date().toISOString();
      const adminId = offerServices.getCurrentAdminId();

      offerIds.forEach((offerId) => {
        updates[`/hotels/${hotelName}/offers/${offerId}/isActive`] = isActive;
        updates[`/hotels/${hotelName}/offers/${offerId}/updatedAt`] = timestamp;
        updates[`/hotels/${hotelName}/offers/${offerId}/updatedBy`] = adminId;
      });

      await update(ref(db), updates);

      toast.success(`${offerIds.length} offers ${statusText}d successfully!`);
      return true;
    } catch (error) {
      console.error("Error bulk updating offers:", error);
      toast.error("Error updating offers. Please try again.");
      return false;
    }
  },

  // Get offer usage analytics
  getOfferAnalytics: async (hotelName, offerId) => {
    try {
      const [offerSnapshot, usageSnapshot] = await Promise.all([
        get(ref(db, `/hotels/${hotelName}/offers/${offerId}`)),
        get(ref(db, `/hotels/${hotelName}/offerUsage/${offerId}`)),
      ]);

      if (!offerSnapshot.exists()) {
        return null;
      }

      const offer = offerSnapshot.val();
      const usageData = usageSnapshot.exists() ? usageSnapshot.val() : {};

      const analytics = {
        offer,
        totalUsage: offer.currentUsageCount || 0,
        uniqueCustomers: Object.keys(usageData).length,
        totalSavings: Object.values(usageData).reduce(
          (sum, usage) => sum + (usage.totalSavings || 0),
          0
        ),
        averageUsagePerCustomer:
          Object.keys(usageData).length > 0
            ? (offer.currentUsageCount || 0) / Object.keys(usageData).length
            : 0,
        usageByCustomer: usageData,
      };

      return analytics;
    } catch (error) {
      console.error("Error getting offer analytics:", error);
      return null;
    }
  },
};

// firestoreOfferService.js
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { uid } from "uid";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import {
  validateOfferFormWithToast,
  sanitizeOfferData,
  isOfferExpired,
} from "../../validation/offeresValidation";

const firestore = getFirestore();
const auth = getAuth();

export const offerServices = {
  getCurrentAdminId: () => auth.currentUser?.uid,

  checkAdminPermission: async (hotelName) => {
    try {
      const adminId = offerServices.getCurrentAdminId();
      if (!adminId) throw new Error("Admin not authenticated");

      const adminHotelDoc = await getDoc(
        doc(firestore, `admins/${adminId}/hotels/${hotelName}`)
      );
      const generalHotelDoc = await getDoc(
        doc(firestore, `hotels/${hotelName}`)
      );

      const adminHotelUuid = adminHotelDoc.exists()
        ? adminHotelDoc.data().uuid
        : null;
      const generalHotelUuid = generalHotelDoc.exists()
        ? generalHotelDoc.data().uuid
        : null;

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  },

  subscribeToOffers: (hotelName, callback, errorCallback = null) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }

    const offersRef = collection(firestore, `hotels/${hotelName}/offers`);
    const unsubscribe = onSnapshot(
      offersRef,
      (snapshot) => {
        const offersArray = snapshot.docs.map((docSnap, index) => {
          const offer = docSnap.data();
          const isExpired = isOfferExpired(offer);
          return {
            ...offer,
            offerId: docSnap.id,
            srNo: index + 1,
            isExpired,
            statusDisplay: offer.isActive
              ? isExpired
                ? "Expired"
                : "Active"
              : "Inactive",
          };
        });

        // Sort descending by createdAt
        offersArray.sort(
          (a, b) =>
            (b.createdAt?.toDate?.() || new Date()) -
            (a.createdAt?.toDate?.() || new Date())
        );

        callback(offersArray);
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
          (a, b) =>
            (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0)
        );
      case "date_desc":
      case "newest":
        return sortedOffers.sort(
          (a, b) =>
            (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
        );
      case "expiry_asc":
        return sortedOffers.sort(
          (a, b) =>
            new Date(a.validUntil || "9999-12-31") -
            new Date(b.validUntil || "9999-12-31")
        );
      case "expiry_desc":
        return sortedOffers.sort(
          (a, b) =>
            new Date(b.validUntil || "9999-12-31") -
            new Date(a.validUntil || "9999-12-31")
        );
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
        return sortedOffers.sort(
          (a, b) =>
            (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
        );
    }
  },

  addOffer: async (hotelName, offerData, existingOffers = []) => {
    try {
      if (!validateOfferFormWithToast(offerData, existingOffers)) return false;
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error("You do not have permission to add offers for this hotel", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const sanitizedData = sanitizeOfferData(offerData);
      const offerId = uid();
      const offerRecord = {
        ...sanitizedData,
        offerId,
        createdAt: Timestamp.fromDate(new Date()),
        createdBy: offerServices.getCurrentAdminId(),
        currentUsageCount: 0,
        isExpired: false,
      };

      await setDoc(
        doc(firestore, `hotels/${hotelName}/offers/${offerId}`),
        offerRecord
      );

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

  updateOffer: async (hotelName, offerId, offerData, existingOffers = []) => {
    try {
      if (!validateOfferFormWithToast(offerData, existingOffers, offerId))
        return false;
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to update offers for this hotel",
          { position: toast.POSITION.TOP_RIGHT }
        );
        return false;
      }

      if (!window.confirm("Are you sure you want to update this offer?"))
        return false;

      const offerDocRef = doc(
        firestore,
        `hotels/${hotelName}/offers/${offerId}`
      );
      const existingOfferDoc = await getDoc(offerDocRef);
      const existingOffer = existingOfferDoc.exists()
        ? existingOfferDoc.data()
        : {};

      const sanitizedData = sanitizeOfferData(offerData);
      const updateData = {
        ...sanitizedData,
        offerId,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: offerServices.getCurrentAdminId(),
        currentUsageCount: existingOffer.currentUsageCount || 0,
        createdAt: existingOffer.createdAt,
        createdBy: existingOffer.createdBy,
      };

      await updateDoc(offerDocRef, updateData);

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

  deleteOffer: async (hotelName, offer) => {
    try {
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to delete offers for this hotel",
          { position: toast.POSITION.TOP_RIGHT }
        );
        return false;
      }

      if (offer.currentUsageCount > 0) {
        const confirmDelete = window.confirm(
          `This offer "${offer.offerName}" has been used ${offer.currentUsageCount} times. Are you sure you want to delete it? This action cannot be undone.`
        );
        if (!confirmDelete) return false;
      } else {
        const confirmDelete = window.confirm(
          `Are you sure you want to delete the offer "${offer.offerName}"? This action cannot be undone.`
        );
        if (!confirmDelete) return false;
      }

      await deleteDoc(
        doc(firestore, `hotels/${hotelName}/offers/${offer.offerId}`)
      );
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

  toggleOfferStatus: async (hotelName, offer) => {
    try {
      const hasPermission = await offerServices.checkAdminPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to modify offers for this hotel",
          { position: toast.POSITION.TOP_RIGHT }
        );
        return false;
      }

      const newStatus = !offer.isActive;
      const statusText = newStatus ? "activate" : "deactivate";

      if (
        !window.confirm(
          `Are you sure you want to ${statusText} the offer "${offer.offerName}"?`
        )
      )
        return false;

      await updateDoc(
        doc(firestore, `hotels/${hotelName}/offers/${offer.offerId}`),
        {
          isActive: newStatus,
          updatedAt: Timestamp.fromDate(new Date()),
          updatedBy: offerServices.getCurrentAdminId(),
        }
      );

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

  filterOffers: (offers, searchTerm) => {
    if (!searchTerm.trim()) {
      return offers.map((offer, index) => ({
        ...offer,
        srNo: index + 1,
      }));
    }

    const lowerTerm = searchTerm.toLowerCase();

    return offers
      .filter(
        (offer) =>
          offer.offerName?.toLowerCase().includes(lowerTerm) ||
          offer.offerDescription?.toLowerCase().includes(lowerTerm) ||
          offer.offerType?.toLowerCase().includes(lowerTerm) ||
          offer.offerCode?.toLowerCase().includes(lowerTerm)
      )
      .map((offer, index) => ({
        ...offer,
        srNo: index + 1,
      }));
  },

  // Implement other methods similarly with Firestore (bulkUpdateOffers, duplicateOffer, getOfferStats, etc.)
};

import { db, storage } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import {
  validateCaptainForm,
  sanitizeCaptainData,
} from "../validation/captainValidation";

export const captainServices = {
  // Get current admin ID
  getCurrentAdminId: () => {
    const auth = getAuth();
    return auth.currentUser?.uid;
  },

  // Check if admin has permission for the hotel
  checkAdminPermission: async (hotelName) => {
    try {
      const adminId = captainServices.getCurrentAdminId();
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

  // Upload captain photo
  uploadCaptainPhoto: async (hotelName, captainId, photoFile) => {
    try {
      const photoRef = storageRef(
        storage,
        `hotels/${hotelName}/captains/${captainId}/photo`
      );
      const snapshot = await uploadBytes(photoRef, photoFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw new Error("Failed to upload photo");
    }
  },

  // Delete captain photo
  deleteCaptainPhoto: async (hotelName, captainId) => {
    try {
      const photoRef = storageRef(
        storage,
        `hotels/${hotelName}/captains/${captainId}/photo`
      );
      await deleteObject(photoRef);
    } catch (error) {
      // Photo might not exist, which is fine
      console.log("Photo deletion skipped:", error.message);
    }
  },

  // Subscribe to captains changes with real-time updates
  subscribeToCaptains: (hotelName, callback) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }

    const unsubscribe = onValue(
      ref(db, `/hotels/${hotelName}/captains/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const captainsArray = Object.values(data).map((captain, index) => ({
            ...captain,
            srNo: index + 1,
          }));
          callback(captainsArray);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error("Error fetching captains:", error);
        toast.error("Error loading captains", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );

    return unsubscribe;
  },

  // Add new captain
  addCaptain: async (hotelName, captainData, existingCaptains = []) => {
    try {
      // Validate captain data
      const validation = validateCaptainForm(captainData, existingCaptains);
      if (!validation.isValid) {
        toast.error(validation.error, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      // Check permissions
      const hasPermission = await captainServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to add captains for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Sanitize and prepare captain data
      const sanitizedData = sanitizeCaptainData(captainData);
      const captainId = uid();

      let photoUrl = null;
      if (captainData.photoFile) {
        photoUrl = await captainServices.uploadCaptainPhoto(
          hotelName,
          captainId,
          captainData.photoFile
        );
      }

      const finalCaptainData = {
        ...sanitizedData,
        captainId,
        photoUrl,
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: captainServices.getCurrentAdminId(),
      };

      // Save to database
      await set(
        ref(db, `/hotels/${hotelName}/captains/${captainId}`),
        finalCaptainData
      );

      toast.success("Captain added successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error adding captain:", error);
      toast.error("Error adding captain. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Update existing captain
  updateCaptain: async (
    hotelName,
    captainId,
    captainData,
    existingCaptains = []
  ) => {
    try {
      // Validate captain data
      const validation = validateCaptainForm(
        captainData,
        existingCaptains,
        captainId
      );
      if (!validation.isValid) {
        toast.error(validation.error, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      // Check permissions
      const hasPermission = await captainServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to update captains for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Sanitize and prepare updated data
      const sanitizedData = sanitizeCaptainData(captainData);

      let photoUrl = captainData.existingPhotoUrl;
      if (captainData.photoFile) {
        // Delete old photo if exists
        await captainServices.deleteCaptainPhoto(hotelName, captainId);
        // Upload new photo
        photoUrl = await captainServices.uploadCaptainPhoto(
          hotelName,
          captainId,
          captainData.photoFile
        );
      }

      const updateData = {
        ...sanitizedData,
        photoUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: captainServices.getCurrentAdminId(),
      };

      // Update in database
      await update(
        ref(db, `/hotels/${hotelName}/captains/${captainId}`),
        updateData
      );

      toast.success("Captain updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error updating captain:", error);
      toast.error("Error updating captain. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Delete captain
  deleteCaptain: async (hotelName, captain) => {
    try {
      // Check permissions
      const hasPermission = await captainServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to delete captains for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Delete photo if exists
      if (captain.photoUrl) {
        await captainServices.deleteCaptainPhoto(hotelName, captain.captainId);
      }

      // Delete from database
      await remove(
        ref(db, `/hotels/${hotelName}/captains/${captain.captainId}`)
      );

      toast.success("Captain deleted successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error deleting captain:", error);
      toast.error("Error deleting captain. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Prepare captain for editing
  prepareForEdit: async (hotelName, captain) => {
    try {
      const hasPermission = await captainServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to edit captains for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return null;
      }
      return captain;
    } catch (error) {
      console.error("Error preparing captain for edit:", error);
      toast.error("Error preparing captain for editing", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },

  // Filter captains based on search term
  filterCaptains: (captains, searchTerm) => {
    if (!searchTerm.trim()) {
      return captains.map((captain, index) => ({
        ...captain,
        srNo: index + 1,
      }));
    }

    return captains
      .filter((captain) => {
        const term = searchTerm.toLowerCase();
        return (
          captain.firstName?.toLowerCase().includes(term) ||
          captain.lastName?.toLowerCase().includes(term) ||
          captain.email?.toLowerCase().includes(term) ||
          captain.mobileNo?.includes(term) ||
          captain.adharNo?.includes(term)
        );
      })
      .map((captain, index) => ({
        ...captain,
        srNo: index + 1,
      }));
  },

  // Get captain statistics
  getCaptainStats: async (hotelName) => {
    try {
      const captainSnapshot = await get(
        ref(db, `/hotels/${hotelName}/captains`)
      );

      if (!captainSnapshot.exists()) {
        return {
          totalCaptains: 0,
          activeCaptains: 0,
          inactiveCaptains: 0,
          recentCaptains: 0,
        };
      }

      const captains = Object.values(captainSnapshot.val());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      return {
        totalCaptains: captains.length,
        activeCaptains: captains.filter((c) => c.status === "active").length,
        inactiveCaptains: captains.filter((c) => c.status === "inactive")
          .length,
        recentCaptains: captains.filter((c) => {
          const createdDate = new Date(c.createdAt);
          return createdDate > weekAgo;
        }).length,
      };
    } catch (error) {
      console.error("Error getting captain stats:", error);
      return null;
    }
  },

  // Toggle captain status
  toggleCaptainStatus: async (hotelName, captainId, currentStatus) => {
    try {
      const hasPermission = await captainServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error("You do not have permission to modify captain status", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await update(ref(db, `/hotels/${hotelName}/captains/${captainId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: captainServices.getCurrentAdminId(),
      });

      toast.success(`Captain status changed to ${newStatus}`, {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error toggling captain status:", error);
      toast.error("Error updating captain status", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },
};

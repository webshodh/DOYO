import { db, storage, auth } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  createUserWithEmailAndPassword,
  updatePassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
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

  // Create Firebase Auth user for captain
  createCaptainAuthUser: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error("Error creating captain auth user:", error);
      throw error;
    }
  },

  // Delete Firebase Auth user
  deleteCaptainAuthUser: async (user) => {
    try {
      await deleteUser(user);
    } catch (error) {
      console.error("Error deleting captain auth user:", error);
      throw error;
    }
  },

  // Update captain password
  updateCaptainPassword: async (user, newPassword) => {
    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error("Error updating captain password:", error);
      throw error;
    }
  },

  // Captain login
  captainLogin: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user is a captain
      const captainData = await captainServices.getCaptainByAuthId(user.uid);
      if (!captainData) {
        await signOut(auth);
        throw new Error("Invalid captain credentials");
      }

      return {
        user,
        captainData,
        hotelName: captainData.hotelName,
      };
    } catch (error) {
      console.error("Error in captain login:", error);
      throw error;
    }
  },

  // Captain logout
  captainLogout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in captain logout:", error);
      throw error;
    }
  },

  // Get captain data by Firebase Auth ID
  getCaptainByAuthId: async (authId) => {
    try {
      const captainsSnapshot = await get(ref(db, "captains"));
      if (!captainsSnapshot.exists()) {
        return null;
      }

      const captainsData = captainsSnapshot.val();

      // Search through all hotels to find the captain
      for (const [hotelName, hotelCaptains] of Object.entries(captainsData)) {
        for (const [captainId, captainData] of Object.entries(hotelCaptains)) {
          if (captainData.firebaseAuthId === authId) {
            return {
              ...captainData,
              hotelName,
              captainId,
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting captain by auth ID:", error);
      return null;
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

  // Add new captain with Firebase Auth
  addCaptain: async (hotelName, captainData, existingCaptains = []) => {
    let authUser = null;

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

      // Create Firebase Auth user first
      authUser = await captainServices.createCaptainAuthUser(
        captainData.email,
        captainData.password
      );

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
        firebaseAuthId: authUser.uid,
        status: "active",
        role: "captain",
        hotelName,
        createdAt: new Date().toISOString(),
        createdBy: captainServices.getCurrentAdminId(),
      };

      // Save to database under hotels and also create a separate captains collection for easy lookup
      await Promise.all([
        set(
          ref(db, `/hotels/${hotelName}/captains/${captainId}`),
          finalCaptainData
        ),
        set(ref(db, `/captains/${hotelName}/${captainId}`), {
          ...finalCaptainData,
          email: captainData.email, // Store email for login reference
        }),
      ]);

      toast.success(
        "Captain added successfully! Login credentials have been created.",
        {
          position: toast.POSITION.TOP_RIGHT,
        }
      );

      return true;
    } catch (error) {
      console.error("Error adding captain:", error);

      // Clean up Firebase Auth user if it was created but database save failed
      if (authUser) {
        try {
          await captainServices.deleteCaptainAuthUser(authUser);
        } catch (cleanupError) {
          console.error("Error cleaning up auth user:", cleanupError);
        }
      }

      // Handle specific Firebase Auth errors
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email address is already registered", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("Error adding captain. Please try again.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

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

      // Get existing captain data to get Firebase Auth ID
      const existingCaptain = await get(
        ref(db, `/hotels/${hotelName}/captains/${captainId}`)
      );

      if (!existingCaptain.exists()) {
        toast.error("Captain not found", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const existingData = existingCaptain.val();

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

      // Update in both locations
      await Promise.all([
        update(
          ref(db, `/hotels/${hotelName}/captains/${captainId}`),
          updateData
        ),
        update(ref(db, `/captains/${hotelName}/${captainId}`), {
          ...updateData,
          email: captainData.email || existingData.email,
        }),
      ]);

      // Update password if provided
      if (captainData.password && captainData.password.trim()) {
        try {
          // Note: To update password, we need the user to be signed in
          // In a production app, you might want to send a password reset email instead
          // or implement a different flow for admin-initiated password changes
          toast.info(
            "Password update requires captain to be signed in. Consider sending a password reset email.",
            {
              position: toast.POSITION.TOP_RIGHT,
            }
          );
        } catch (passwordError) {
          console.error("Error updating password:", passwordError);
        }
      }

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

      // Delete from both database locations
      await Promise.all([
        remove(ref(db, `/hotels/${hotelName}/captains/${captain.captainId}`)),
        remove(ref(db, `/captains/${hotelName}/${captain.captainId}`)),
      ]);

      // Note: Firebase Auth user deletion requires the user to be recently authenticated
      // In a production app, you might want to implement a different strategy
      // such as disabling the account instead of deleting it
      if (captain.firebaseAuthId) {
        try {
          // This will only work if admin has appropriate permissions
          // You might want to handle this through Firebase Admin SDK on your backend
          toast.info(
            "Captain removed from hotel. Auth account may need manual cleanup.",
            {
              position: toast.POSITION.TOP_RIGHT,
            }
          );
        } catch (authError) {
          console.error("Error deleting auth user:", authError);
        }
      }

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

      // Update in both locations
      await Promise.all([
        update(ref(db, `/hotels/${hotelName}/captains/${captainId}`), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: captainServices.getCurrentAdminId(),
        }),
        update(ref(db, `/captains/${hotelName}/${captainId}`), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: captainServices.getCurrentAdminId(),
        }),
      ]);

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

  // Check if user is authenticated captain
  isAuthenticatedCaptain: () => {
    const auth = getAuth();
    return auth.currentUser !== null;
  },

  // Get current captain data
  getCurrentCaptain: async () => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        return null;
      }

      return await captainServices.getCaptainByAuthId(auth.currentUser.uid);
    } catch (error) {
      console.error("Error getting current captain:", error);
      return null;
    }
  },
};

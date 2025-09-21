// src/services/captainServices.js
import { db, storage, auth } from "../firebase/firebaseConfig";
import { uid } from "uid";
// ✅ FIRESTORE IMPORTS (replacing Realtime Database)
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
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
} from "../../validation/captainValidation";

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

      // ✅ FIRESTORE: Get admin and hotel documents
      const [adminDoc, hotelDoc] = await Promise.all([
        getDoc(doc(db, `admins/${adminId}`)),
        getDoc(doc(db, `hotels/${hotelName}`)),
      ]);

      const adminData = adminDoc.exists() ? adminDoc.data() : null;
      const hotelData = hotelDoc.exists() ? hotelDoc.data() : null;

      return adminData?.hotels?.[hotelName]?.uuid === hotelData?.uuid;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  },

  // Upload captain photo (unchanged - uses Storage)
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

  // Delete captain photo (unchanged - uses Storage)
  deleteCaptainPhoto: async (hotelName, captainId) => {
    try {
      const photoRef = storageRef(
        storage,
        `hotels/${hotelName}/captains/${captainId}/photo`
      );
      await deleteObject(photoRef);
    } catch (error) {
      console.log("Photo deletion skipped:", error.message);
    }
  },

  // Create Firebase Auth user for captain (unchanged)
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

  // Delete Firebase Auth user (unchanged)
  deleteCaptainAuthUser: async (user) => {
    try {
      await deleteUser(user);
    } catch (error) {
      console.error("Error deleting captain auth user:", error);
      throw error;
    }
  },

  // Update captain password (unchanged)
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

  // Captain logout (unchanged)
  captainLogout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in captain logout:", error);
      throw error;
    }
  },

  // ✅ FIRESTORE: Get captain data by Firebase Auth ID
  getCaptainByAuthId: async (authId) => {
    try {
      // Get all hotels first
      const hotelsSnapshot = await getDocs(collection(db, "hotels"));

      if (hotelsSnapshot.empty) {
        return null;
      }

      // Search through all hotels to find the captain
      for (const hotelDoc of hotelsSnapshot.docs) {
        const hotelName = hotelDoc.id;
        const captainsSnapshot = await getDocs(
          collection(db, `hotels/${hotelName}/captains`)
        );

        for (const captainDoc of captainsSnapshot.docs) {
          const captainData = captainDoc.data();
          if (captainData.firebaseAuthId === authId) {
            return {
              ...captainData,
              hotelName,
              captainId: captainDoc.id,
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

  // ✅ FIRESTORE: Subscribe to captains changes with real-time updates
  subscribeToCaptains: (hotelName, callback) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }

    const captainsRef = collection(db, `hotels/${hotelName}/captains`);
    const q = query(captainsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const captainsArray = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          srNo: index + 1,
        }));
        callback(captainsArray);
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

  // ✅ FIRESTORE: Add new captain
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
        email: captainData.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: captainServices.getCurrentAdminId(),
      };

      // ✅ FIRESTORE: Save to database
      await setDoc(
        doc(db, `hotels/${hotelName}/captains/${captainId}`),
        finalCaptainData
      );

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

  // ✅ FIRESTORE: Update existing captain
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

      // ✅ FIRESTORE: Get existing captain data
      const existingCaptainDoc = await getDoc(
        doc(db, `hotels/${hotelName}/captains/${captainId}`)
      );

      if (!existingCaptainDoc.exists()) {
        toast.error("Captain not found", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const existingData = existingCaptainDoc.data();

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
        email: captainData.email || existingData.email,
        updatedAt: serverTimestamp(),
        updatedBy: captainServices.getCurrentAdminId(),
      };

      // ✅ FIRESTORE: Update document
      await updateDoc(
        doc(db, `hotels/${hotelName}/captains/${captainId}`),
        updateData
      );

      // Update password if provided
      if (captainData.password && captainData.password.trim()) {
        try {
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

  // ✅ FIRESTORE: Delete captain
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

      // ✅ FIRESTORE: Delete document
      await deleteDoc(
        doc(db, `hotels/${hotelName}/captains/${captain.captainId}`)
      );

      if (captain.firebaseAuthId) {
        try {
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

  // Prepare captain for editing (unchanged)
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

  // Filter captains based on search term (unchanged - client-side filtering)
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

  // ✅ FIRESTORE: Get captain statistics
  getCaptainStats: async (hotelName) => {
    try {
      const captainsSnapshot = await getDocs(
        collection(db, `hotels/${hotelName}/captains`)
      );

      if (captainsSnapshot.empty) {
        return {
          totalCaptains: 0,
          activeCaptains: 0,
          inactiveCaptains: 0,
          recentCaptains: 0,
        };
      }

      const captains = captainsSnapshot.docs.map((doc) => doc.data());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      return {
        totalCaptains: captains.length,
        activeCaptains: captains.filter((c) => c.status === "active").length,
        inactiveCaptains: captains.filter((c) => c.status === "inactive")
          .length,
        recentCaptains: captains.filter((c) => {
          const createdDate = c.createdAt?.toDate
            ? c.createdAt.toDate()
            : new Date(c.createdAt);
          return createdDate > weekAgo;
        }).length,
      };
    } catch (error) {
      console.error("Error getting captain stats:", error);
      return null;
    }
  },

  // ✅ FIRESTORE: Toggle captain status
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

      // ✅ FIRESTORE: Update document
      await updateDoc(doc(db, `hotels/${hotelName}/captains/${captainId}`), {
        status: newStatus,
        updatedAt: serverTimestamp(),
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

  // Check if user is authenticated captain (unchanged)
  isAuthenticatedCaptain: () => {
    const auth = getAuth();
    return auth.currentUser !== null;
  },

  // Get current captain data (unchanged)
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

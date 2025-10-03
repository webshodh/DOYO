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
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { uid } from "uid";
import { toast } from "react-toastify";
import { storage } from "../firebase/firebaseConfig";
import {
  validateCaptainForm,
  sanitizeCaptainData,
} from "../../validation/captainValidation";

const firestore = getFirestore();
const auth = getAuth();

export const captainServices = {
  // Get current logged-in user ID (admin or captain)
  getCurrentAdminId: () => auth.currentUser?.uid,

  // Login captain by email/password with Firebase Auth
  captainLogin: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return { user: userCredential.user };
    } catch (error) {
      console.error("Captain login failed:", error);
      throw error;
    }
  },

  // Check if a captain is authenticated
  isAuthenticatedCaptain: () => !!auth.currentUser,

  // Get current captain info (basic)
  getCurrentCaptain: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    // TODO: Extend this to fetch captain document if needed
    return { uid: user.uid, email: user.email };
  },

  // Upload captain photo to Firebase Storage
  uploadCaptainPhoto: async (hotelName, captainId, photoFile) => {
    if (!photoFile || !(photoFile instanceof File)) {
      throw new Error("Invalid photo file");
    }
    const photoReference = storageRef(
      storage,
      `hotels/${hotelName}/captains/${captainId}/photo`,
    );
    const snapshot = await uploadBytes(photoReference, photoFile);
    return await getDownloadURL(snapshot.ref);
  },

  // Delete captain photo from Firebase Storage
  deleteCaptainPhoto: async (hotelName, captainId) => {
    try {
      const photoReference = storageRef(
        storage,
        `hotels/${hotelName}/captains/${captainId}/photo`,
      );
      await deleteObject(photoReference);
    } catch (error) {
      if (error.code !== "storage/object-not-found") {
        console.error("Error deleting photo:", error);
      }
    }
  },

  // Create Firebase Auth user for captain
  createCaptainAuthUser: async (email, password) => {
    const currentAdmin = auth.currentUser;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (currentAdmin) {
      await auth.updateCurrentUser(currentAdmin);
    }
    return userCredential.user;
  },

  // Placeholder for auth user deletion (requires backend/Admin SDK)
  deleteCaptainAuthUser: async (userId) => {},

  // Subscribe to captains collection realtime updates
  subscribeToCaptains: (hotelName, callback) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }
    const captainsRef = collection(firestore, `hotels/${hotelName}/captains`);
    const unsubscribe = onSnapshot(
      captainsRef,
      (querySnapshot) => {
        const captainsArray = querySnapshot.docs.map((docSnap, index) => ({
          ...docSnap.data(),
          srNo: index + 1,
          captainId: docSnap.id,
        }));
        callback(captainsArray);
      },
      (error) => {
        console.error("Error fetching captains:", error);
        toast.error("Error loading captains", { position: "top-right" });
        callback([]);
      },
    );
    return unsubscribe;
  },

  // Add new captain with auth user, photo and firestore doc
  addCaptain: async (hotelName, captainData, existingCaptains = []) => {
    let authUserId = null;
    let captainId = null;
    let photoUploaded = false;

    try {
      const validation = validateCaptainForm(captainData, existingCaptains);
      if (!validation.isValid) {
        const errorMessage =
          Object.values(validation.errors).find((e) => e) ||
          "Validation failed";
        toast.error(errorMessage, { position: "top-right" });
        return false;
      }

      const authUser = await captainServices.createCaptainAuthUser(
        captainData.email,
        captainData.password,
      );
      authUserId = authUser.uid;

      captainId = uid();

      let photoUrl = null;
      if (captainData.photoFile) {
        try {
          photoUrl = await captainServices.uploadCaptainPhoto(
            hotelName,
            captainId,
            captainData.photoFile,
          );
          photoUploaded = true;
        } catch (photoError) {
          console.error("Photo upload failed:", photoError);
        }
      }

      const sanitizedData = sanitizeCaptainData(captainData);

      const finalCaptainData = {
        ...sanitizedData,
        photoUrl,
        firebaseAuthId: authUserId,
        status: "active",
        role: "captain",
        hotelName,
        email: captainData.email,
        createdAt: Timestamp.fromDate(new Date()),
        createdBy: captainServices.getCurrentAdminId(),
      };

      await setDoc(
        doc(firestore, `hotels/${hotelName}/captains/${captainId}`),
        finalCaptainData,
      );

      toast.success("Captain added successfully!", { position: "top-right" });

      return true;
    } catch (error) {
      console.error("Error adding captain:", error);

      if (photoUploaded && captainId) {
        try {
          await captainServices.deleteCaptainPhoto(hotelName, captainId);
        } catch {}
      }
      if (authUserId) {
        captainServices.deleteCaptainAuthUser(authUserId);
      }
      if (captainId) {
        try {
          await deleteDoc(
            doc(firestore, `hotels/${hotelName}/captains/${captainId}`),
          );
        } catch {}
      }

      if (error.code === "auth/email-already-in-use") {
        toast.error("Email address is already registered", {
          position: "top-right",
        });
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters", {
          position: "top-right",
        });
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address", { position: "top-right" });
      } else {
        toast.error(`Error adding captain: ${error.message}`, {
          position: "top-right",
        });
      }

      return false;
    }
  },

  // Update captain document and optional photo
  updateCaptain: async (
    hotelName,
    captainId,
    captainData,
    existingCaptains = [],
  ) => {
    try {
      const validation = validateCaptainForm(
        captainData,
        existingCaptains,
        captainId,
      );
      if (!validation.isValid) {
        const errorMessage =
          Object.values(validation.errors).find((e) => e) ||
          "Validation failed";
        toast.error(errorMessage, { position: "top-right" });
        return false;
      }

      const captainDocRef = doc(
        firestore,
        `hotels/${hotelName}/captains/${captainId}`,
      );
      const existingCaptainDoc = await getDoc(captainDocRef);
      if (!existingCaptainDoc.exists()) {
        toast.error("Captain not found", { position: "top-right" });
        return false;
      }

      const existingData = existingCaptainDoc.data();
      const sanitizedData = sanitizeCaptainData(captainData);

      let photoUrl = existingData.photoUrl || null;
      if (captainData.photoFile) {
        try {
          await captainServices.deleteCaptainPhoto(hotelName, captainId);
          photoUrl = await captainServices.uploadCaptainPhoto(
            hotelName,
            captainId,
            captainData.photoFile,
          );
        } catch {
          toast.warning("Photo update failed, but other changes were saved", {
            position: "top-right",
          });
        }
      }

      const updateData = {
        ...sanitizedData,
        photoUrl,
        email: captainData.email || existingData.email,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: captainServices.getCurrentAdminId(),
      };

      await updateDoc(captainDocRef, updateData);

      if (captainData.password && captainData.password.trim()) {
        toast.info(
          "Password cannot be updated here. Use password reset functionality.",
          {
            position: "top-right",
            autoClose: 7000,
          },
        );
      }

      toast.success("Captain updated successfully!", { position: "top-right" });

      return true;
    } catch (error) {
      console.error("Error updating captain:", error);
      toast.error(`Error updating captain: ${error.message}`, {
        position: "top-right",
      });
      return false;
    }
  },

  // Delete captain doc and photo
  deleteCaptain: async (hotelName, captain) => {
    try {
      if (!captain || !captain.captainId) {
        toast.error("Invalid captain data", { position: "top-right" });
        return false;
      }

      if (captain.photoUrl) {
        try {
          await captainServices.deleteCaptainPhoto(
            hotelName,
            captain.captainId,
          );
        } catch {}
      }

      await deleteDoc(
        doc(firestore, `hotels/${hotelName}/captains/${captain.captainId}`),
      );

      if (captain.firebaseAuthId) {
        captainServices.deleteCaptainAuthUser(captain.firebaseAuthId);
      }

      toast.success("Captain deleted successfully!", { position: "top-right" });

      return true;
    } catch (error) {
      console.error("Error deleting captain:", error);
      toast.error(`Error deleting captain: ${error.message}`, {
        position: "top-right",
      });
      return false;
    }
  },

  prepareForEdit: async (hotelName, captain) => {
    try {
      if (!captain) {
        toast.error("Invalid captain data", { position: "top-right" });
        return null;
      }
      return captain;
    } catch (error) {
      console.error("Error preparing captain for edit:", error);
      toast.error("Error preparing captain for editing", {
        position: "top-right",
      });
      return null;
    }
  },

  filterCaptains: (captains, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) {
      return captains.map((captain, index) => ({
        ...captain,
        srNo: index + 1,
      }));
    }
    const term = searchTerm.toLowerCase().trim();
    return captains
      .filter(
        (c) =>
          c.firstName?.toLowerCase().includes(term) ||
          c.lastName?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.mobileNo?.includes(term) ||
          c.adharNo?.includes(term) ||
          c.panNo?.toLowerCase().includes(term),
      )
      .map((captain, index) => ({ ...captain, srNo: index + 1 }));
  },

  getCaptainStats: async (hotelName) => {
    try {
      const snapshot = await getDocs(
        collection(firestore, `hotels/${hotelName}/captains`),
      );
      if (snapshot.empty) {
        return {
          totalCaptains: 0,
          activeCaptains: 0,
          inactiveCaptains: 0,
          recentCaptains: 0,
        };
      }
      const captains = snapshot.docs.map((doc) => doc.data());
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
      return {
        totalCaptains: 0,
        activeCaptains: 0,
        inactiveCaptains: 0,
        recentCaptains: 0,
      };
    }
  },

  toggleCaptainStatus: async (hotelName, captainId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateDoc(
        doc(firestore, `hotels/${hotelName}/captains/${captainId}`),
        {
          status: newStatus,
          updatedAt: Timestamp.fromDate(new Date()),
          updatedBy: captainServices.getCurrentAdminId(),
        },
      );
      toast.success(`Captain status changed to ${newStatus}`, {
        position: "top-right",
      });
      return true;
    } catch (error) {
      console.error("Error toggling captain status:", error);
      toast.error(`Error updating captain status: ${error.message}`, {
        position: "top-right",
      });
      return false;
    }
  },
};

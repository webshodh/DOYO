// firestoreCaptainService.js
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updatePassword,
  signInWithEmailAndPassword,
  signOut,
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
  getCurrentAdminId: () => auth.currentUser?.uid,

  checkAdminPermission: async (hotelName) => {
    try {
      const adminId = captainServices.getCurrentAdminId();
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

  uploadCaptainPhoto: async (hotelName, captainId, photoFile) => {
    try {
      const photoReference = storageRef(
        storage,
        `hotels/${hotelName}/captains/${captainId}/photo`
      );
      const snapshot = await uploadBytes(photoReference, photoFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw new Error("Failed to upload photo");
    }
  },

  deleteCaptainPhoto: async (hotelName, captainId) => {
    try {
      const photoReference = storageRef(
        storage,
        `hotels/${hotelName}/captains/${captainId}/photo`
      );
      await deleteObject(photoReference);
    } catch (error) {
      // Ignore error if photo does not exist
      console.log("Photo deletion skipped:", error.message);
    }
  },

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

  deleteCaptainAuthUser: async (user) => {
    try {
      await deleteUser(user);
    } catch (error) {
      console.error("Error deleting captain auth user:", error);
      throw error;
    }
  },

  updateCaptainPassword: async (user, newPassword) => {
    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error("Error updating captain password:", error);
      throw error;
    }
  },

  captainLogin: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

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

  captainLogout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in captain logout:", error);
      throw error;
    }
  },

  getCaptainByAuthId: async (authId) => {
    try {
      const hotelsSnapshot = await getDocs(collection(firestore, "hotels"));
      for (const hotelDoc of hotelsSnapshot.docs) {
        const captainsRef = collection(
          firestore,
          `hotels/${hotelDoc.id}/captains`
        );
        const q = query(captainsRef, where("firebaseAuthId", "==", authId));
        const captainQuerySnapshot = await getDocs(q);
        if (!captainQuerySnapshot.empty) {
          const captainDoc = captainQuerySnapshot.docs[0];
          return {
            ...captainDoc.data(),
            hotelName: hotelDoc.id,
            captainId: captainDoc.id,
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting captain by auth ID:", error);
      return null;
    }
  },

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
        toast.error("Error loading captains", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );

    return unsubscribe;
  },

  addCaptain: async (hotelName, captainData, existingCaptains = []) => {
    let authUser = null;
    try {
      const validation = validateCaptainForm(captainData, existingCaptains);
      if (!validation.isValid) {
        toast.error(validation.error, { position: toast.POSITION.TOP_RIGHT });
        return false;
      }

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

      authUser = await captainServices.createCaptainAuthUser(
        captainData.email,
        captainData.password
      );

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
        photoUrl,
        firebaseAuthId: authUser.uid,
        status: "active",
        role: "captain",
        hotelName,
        email: captainData.email,
        createdAt: Timestamp.fromDate(new Date()),
        createdBy: captainServices.getCurrentAdminId(),
      };

      await setDoc(
        doc(firestore, `hotels/${hotelName}/captains/${captainId}`),
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

      if (authUser) {
        try {
          await captainServices.deleteCaptainAuthUser(authUser);
        } catch (cleanupError) {
          console.error("Error cleaning up auth user:", cleanupError);
        }
      }

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

  updateCaptain: async (
    hotelName,
    captainId,
    captainData,
    existingCaptains = []
  ) => {
    try {
      const validation = validateCaptainForm(
        captainData,
        existingCaptains,
        captainId
      );
      if (!validation.isValid) {
        toast.error(validation.error, { position: toast.POSITION.TOP_RIGHT });
        return false;
      }

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

      const captainDocRef = doc(
        firestore,
        `hotels/${hotelName}/captains/${captainId}`
      );
      const existingCaptainDoc = await getDoc(captainDocRef);

      if (!existingCaptainDoc.exists()) {
        toast.error("Captain not found", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const existingData = existingCaptainDoc.data();
      const sanitizedData = sanitizeCaptainData(captainData);

      let photoUrl = captainData.existingPhotoUrl;
      if (captainData.photoFile) {
        await captainServices.deleteCaptainPhoto(hotelName, captainId);
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
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: captainServices.getCurrentAdminId(),
      };

      await updateDoc(captainDocRef, updateData);

      if (captainData.password && captainData.password.trim()) {
        toast.info(
          "Password update requires captain to be signed in. Consider sending a password reset email.",
          { position: toast.POSITION.TOP_RIGHT }
        );
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

  deleteCaptain: async (hotelName, captain) => {
    try {
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

      if (captain.photoUrl) {
        await captainServices.deleteCaptainPhoto(hotelName, captain.captainId);
      }

      await deleteDoc(
        doc(firestore, `hotels/${hotelName}/captains/${captain.captainId}`)
      );

      if (captain.firebaseAuthId) {
        toast.info(
          "Captain removed from hotel. Auth account may need manual cleanup.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
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

  filterCaptains: (captains, searchTerm) => {
    if (!searchTerm.trim()) {
      return captains.map((captain, index) => ({
        ...captain,
        srNo: index + 1,
      }));
    }
    const term = searchTerm.toLowerCase();
    return captains
      .filter(
        (captain) =>
          captain.firstName?.toLowerCase().includes(term) ||
          captain.lastName?.toLowerCase().includes(term) ||
          captain.email?.toLowerCase().includes(term) ||
          captain.mobileNo?.includes(term) ||
          captain.adharNo?.includes(term)
      )
      .map((captain, index) => ({ ...captain, srNo: index + 1 }));
  },

  getCaptainStats: async (hotelName) => {
    try {
      const captainsSnapshot = await getDocs(
        collection(firestore, `hotels/${hotelName}/captains`)
      );

      if (captainsSnapshot.empty) {
        return {
          totalCaptains: 0,
          activeCaptains: 0,
          inactiveCaptains: 0,
          recentCaptains: 0,
        };
      }

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const captains = captainsSnapshot.docs.map((doc) => doc.data());

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

      await updateDoc(
        doc(firestore, `hotels/${hotelName}/captains/${captainId}`),
        {
          status: newStatus,
          updatedAt: Timestamp.fromDate(new Date()),
          updatedBy: captainServices.getCurrentAdminId(),
        }
      );

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

  isAuthenticatedCaptain: () => auth.currentUser !== null,

  getCurrentCaptain: async () => {
    try {
      if (!auth.currentUser) return null;
      return await captainServices.getCaptainByAuthId(auth.currentUser.uid);
    } catch (error) {
      console.error("Error getting current captain:", error);
      return null;
    }
  },
};

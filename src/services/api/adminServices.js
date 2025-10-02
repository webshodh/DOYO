// Updated Admin Services with Firebase Authentication - services/api/adminServices.js

import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signOut,
} from "firebase/auth";
import { toast } from "react-toastify";

const firestore = getFirestore();
const auth = getAuth();

export const adminServices = {
  // Subscribe to all admins across all hotels
  subscribeToAllAdmins: (callback) => {
    const adminsRef = collection(firestore, "admins");
    const unsubscribe = onSnapshot(
      adminsRef,
      async (querySnapshot) => {
        const adminsArray = [];

        for (let i = 0; i < querySnapshot.docs.length; i++) {
          const docSnap = querySnapshot.docs[i];
          const adminData = docSnap.data();

          // Get hotel info if linkedHotelId exists
          let hotelInfo = null;
          if (adminData.linkedHotelId) {
            const hotelRef = doc(firestore, "hotels", adminData.linkedHotelId);
            const hotelDoc = await getDoc(hotelRef);
            if (hotelDoc.exists()) {
              hotelInfo = {
                hotelId: hotelDoc.id,
                businessName: hotelDoc.data().businessName,
                status: hotelDoc.data().status,
              };
            }
          }

          adminsArray.push({
            ...adminData,
            srNo: i + 1,
            adminId: docSnap.id,
            hotelInfo,
          });
        }

        callback(adminsArray);
      },
      (error) => {
        console.error("Error fetching admins:", error);
        toast.error("Error loading admins", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );
    return unsubscribe;
  },

  // Subscribe to admins for a specific hotel
  subscribeToHotelAdmins: (hotelId, callback) => {
    const adminsRef = collection(firestore, "admins");
    const q = query(adminsRef, where("linkedHotelId", "==", hotelId));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const adminsArray = [];
        querySnapshot.forEach((docSnap, index) => {
          adminsArray.push({
            ...docSnap.data(),
            srNo: index + 1,
            adminId: docSnap.id,
          });
        });
        callback(adminsArray);
      },
      (error) => {
        console.error("Error fetching hotel admins:", error);
        toast.error("Error loading hotel admins", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );
    return unsubscribe;
  },

  // Add a new admin with Firebase Authentication
  addAdmin: async (adminData, linkedHotelId = null, existingAdmins = []) => {
    let createdUser = null;
    const batch = writeBatch(firestore);

    try {
      // Check duplicate email
      if (
        existingAdmins.some(
          (admin) =>
            admin.email?.toLowerCase() === adminData.email?.toLowerCase()
        )
      ) {
        toast.error("Email already exists", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      // Create Firebase Auth user first
      console.log("Creating Firebase Auth user...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );
      createdUser = userCredential.user;
      console.log("Firebase Auth user created:", createdUser.uid);

      // Update the user's display name
      await updateProfile(createdUser, {
        displayName: adminData.fullName,
      });

      // Generate adminId from email (sanitized for Firestore)
      const adminId = adminData.email
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();

      // Prepare admin data (exclude password from storage)
      const { password, confirmPassword, ...adminDataWithoutPassword } =
        adminData;

      const data = {
        ...adminDataWithoutPassword,
        adminId,
        firebaseUid: createdUser.uid, // Store Firebase UID for reference
        linkedHotelId: linkedHotelId || adminData.linkedHotelId,
        status: adminData.status || "active",
        permissions: {
          canManageMenu: adminData.canManageMenu || false,
          canManageOrders: adminData.canManageOrders || false,
          canManageCaptains: adminData.canManageCaptains || false,
          canViewReports: adminData.canViewReports || false,
          canManageCategories: adminData.canManageCategories || false,
          canManageStaff: adminData.canManageStaff || false,
          canAccessSettings: adminData.canAccessSettings || false,
          canManageInventory: adminData.canManageInventory || false,
          ...adminData.permissions,
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Create admin document in global admins collection
      const adminRef = doc(firestore, "admins", adminId);
      batch.set(adminRef, data);

      // If linked to a hotel, also add to hotel's admins subcollection
      if (linkedHotelId) {
        const hotelAdminRef = doc(
          firestore,
          "hotels",
          linkedHotelId,
          "admins",
          adminId
        );
        batch.set(hotelAdminRef, {
          adminId,
          email: adminData.email,
          fullName: adminData.fullName,
          role: adminData.role || "admin",
          status: data.status,
          permissions: data.permissions,
          firebaseUid: createdUser.uid,
          createdAt: data.createdAt,
        });

        // Update admin count in hotel's admin meta
        const adminMetaRef = doc(
          firestore,
          "hotels",
          linkedHotelId,
          "admins",
          "_meta"
        );
        const metaDoc = await getDoc(adminMetaRef);
        const currentCount = metaDoc.exists()
          ? metaDoc.data().totalAdmins || 0
          : 0;

        batch.set(
          adminMetaRef,
          {
            totalAdmins: currentCount + 1,
            lastUpdated: Timestamp.fromDate(new Date()),
          },
          { merge: true }
        );
      }

      // Create user profile document for authentication purposes
      const userProfileRef = doc(firestore, "userProfiles", createdUser.uid);
      batch.set(userProfileRef, {
        uid: createdUser.uid,
        email: adminData.email,
        fullName: adminData.fullName,
        role: adminData.role || "admin",
        userType: "admin",
        linkedHotelId: linkedHotelId || adminData.linkedHotelId,
        status: data.status,
        createdAt: data.createdAt,
        lastLogin: null,
      });

      await batch.commit();
      console.log("Admin data saved to Firestore successfully");

      // Sign out the newly created user so they don't interfere with current session
      if (auth.currentUser?.uid === createdUser.uid) {
        await signOut(auth);
      }

      toast.success(
        "Admin created successfully! Login credentials have been set up.",
        {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 7000,
        }
      );
      return true;
    } catch (error) {
      console.error("Error adding admin:", error);

      // Clean up Firebase Auth user if Firestore operations failed
      if (createdUser) {
        try {
          console.log("Cleaning up Firebase Auth user due to error...");
          await deleteUser(createdUser);
        } catch (cleanupError) {
          console.error("Error cleaning up Firebase Auth user:", cleanupError);
        }
      }

      // Handle specific Firebase Auth errors
      let errorMessage = "Error creating admin. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please use a different email.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check the email format.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Update admin (password updates handled separately)
  updateAdmin: async (adminId, adminData) => {
    try {
      // Remove password fields from update data if they exist
      const { password, confirmPassword, ...updateData } = adminData;

      const data = {
        ...updateData,
        permissions: {
          canManageMenu: adminData.canManageMenu || false,
          canManageOrders: adminData.canManageOrders || false,
          canManageCaptains: adminData.canManageCaptains || false,
          canViewReports: adminData.canViewReports || false,
          canManageCategories: adminData.canManageCategories || false,
          canManageStaff: adminData.canManageStaff || false,
          canAccessSettings: adminData.canAccessSettings || false,
          canManageInventory: adminData.canManageInventory || false,
          ...adminData.permissions,
        },
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const batch = writeBatch(firestore);

      // Update in global admins collection
      const adminRef = doc(firestore, "admins", adminId);
      batch.update(adminRef, data);

      // Update in hotel's admins subcollection if linked
      if (adminData.linkedHotelId) {
        const hotelAdminRef = doc(
          firestore,
          "hotels",
          adminData.linkedHotelId,
          "admins",
          adminId
        );
        batch.update(hotelAdminRef, {
          fullName: adminData.fullName,
          role: adminData.role,
          status: adminData.status,
          permissions: data.permissions,
          updatedAt: data.updatedAt,
        });
      }

      // Update user profile if it exists
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists() && adminDoc.data().firebaseUid) {
        const userProfileRef = doc(
          firestore,
          "userProfiles",
          adminDoc.data().firebaseUid
        );
        batch.update(userProfileRef, {
          fullName: adminData.fullName,
          role: adminData.role,
          status: adminData.status,
          linkedHotelId: adminData.linkedHotelId,
          updatedAt: data.updatedAt,
        });
      }

      await batch.commit();

      toast.success("Admin updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Error updating admin. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Delete admin and Firebase Auth account
  deleteAdmin: async (admin) => {
    try {
      const batch = writeBatch(firestore);

      // Delete from global admins collection
      const adminRef = doc(firestore, "admins", admin.adminId);
      batch.delete(adminRef);

      // Delete from hotel's admins subcollection if linked
      if (admin.linkedHotelId) {
        const hotelAdminRef = doc(
          firestore,
          "hotels",
          admin.linkedHotelId,
          "admins",
          admin.adminId
        );
        batch.delete(hotelAdminRef);

        // Update admin count in hotel's admin meta
        const adminMetaRef = doc(
          firestore,
          "hotels",
          admin.linkedHotelId,
          "admins",
          "_meta"
        );
        const metaDoc = await getDoc(adminMetaRef);
        const currentCount = metaDoc.exists()
          ? metaDoc.data().totalAdmins || 0
          : 0;

        batch.update(adminMetaRef, {
          totalAdmins: Math.max(0, currentCount - 1),
          lastUpdated: Timestamp.fromDate(new Date()),
        });
      }

      // Delete user profile
      if (admin.firebaseUid) {
        const userProfileRef = doc(
          firestore,
          "userProfiles",
          admin.firebaseUid
        );
        batch.delete(userProfileRef);
      }

      await batch.commit();

      // Note: Deleting Firebase Auth users requires admin privileges
      // This should be handled by a Cloud Function with admin SDK
      console.log(
        "Admin deleted from Firestore. Firebase Auth user deletion should be handled by Cloud Function."
      );

      toast.success("Admin deleted successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Error deleting admin. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Link admin to hotel
  linkAdminToHotel: async (adminId, hotelId) => {
    try {
      const batch = writeBatch(firestore);

      // Update admin's linkedHotelId
      const adminRef = doc(firestore, "admins", adminId);
      batch.update(adminRef, {
        linkedHotelId: hotelId,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Get admin data to create hotel subcollection entry
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();

        const hotelAdminRef = doc(
          firestore,
          "hotels",
          hotelId,
          "admins",
          adminId
        );
        batch.set(hotelAdminRef, {
          adminId,
          email: adminData.email,
          fullName: adminData.fullName,
          role: adminData.role || "admin",
          status: adminData.status,
          permissions: adminData.permissions,
          firebaseUid: adminData.firebaseUid,
          createdAt: adminData.createdAt,
        });

        // Update user profile
        if (adminData.firebaseUid) {
          const userProfileRef = doc(
            firestore,
            "userProfiles",
            adminData.firebaseUid
          );
          batch.update(userProfileRef, {
            linkedHotelId: hotelId,
            updatedAt: Timestamp.fromDate(new Date()),
          });
        }
      }

      await batch.commit();

      toast.success("Admin linked to hotel successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error linking admin to hotel:", error);
      toast.error("Error linking admin to hotel. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Unlink admin from hotel
  unlinkAdminFromHotel: async (adminId, hotelId) => {
    try {
      const batch = writeBatch(firestore);

      // Remove admin's linkedHotelId
      const adminRef = doc(firestore, "admins", adminId);
      batch.update(adminRef, {
        linkedHotelId: null,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Remove from hotel's admins subcollection
      const hotelAdminRef = doc(
        firestore,
        "hotels",
        hotelId,
        "admins",
        adminId
      );
      batch.delete(hotelAdminRef);

      // Get admin data to update user profile
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists() && adminDoc.data().firebaseUid) {
        const userProfileRef = doc(
          firestore,
          "userProfiles",
          adminDoc.data().firebaseUid
        );
        batch.update(userProfileRef, {
          linkedHotelId: null,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }

      await batch.commit();

      toast.success("Admin unlinked from hotel successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error unlinking admin from hotel:", error);
      toast.error("Error unlinking admin from hotel. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Filter admins
  filterAdmins: (admins, searchTerm) => {
    if (!searchTerm.trim()) {
      return admins.map((admin, index) => ({ ...admin, srNo: index + 1 }));
    }

    const term = searchTerm.toLowerCase();
    return admins
      .filter((admin) => {
        return (
          admin.fullName?.toLowerCase().includes(term) ||
          admin.email?.toLowerCase().includes(term) ||
          admin.role?.toLowerCase().includes(term) ||
          admin.phone?.includes(term) ||
          admin.hotelInfo?.businessName?.toLowerCase().includes(term)
        );
      })
      .map((admin, index) => ({ ...admin, srNo: index + 1 }));
  },

  // Get admin by ID
  getAdminById: async (adminId) => {
    try {
      const adminRef = doc(firestore, "admins", adminId);
      const adminSnapshot = await getDoc(adminRef);

      if (adminSnapshot.exists()) {
        return {
          ...adminSnapshot.data(),
          adminId: adminSnapshot.id,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting admin by ID:", error);
      return null;
    }
  },

  // Prepare admin for edit (exclude password fields)
  prepareForEdit: async (admin) => {
    try {
      const { password, confirmPassword, firebaseUid, ...editableData } = admin;
      return {
        ...editableData,
        // Ensure permissions are properly structured
        canManageMenu: admin.permissions?.canManageMenu || false,
        canManageOrders: admin.permissions?.canManageOrders || false,
        canManageCaptains: admin.permissions?.canManageCaptains || false,
        canViewReports: admin.permissions?.canViewReports || false,
        canManageCategories: admin.permissions?.canManageCategories || false,
        canManageStaff: admin.permissions?.canManageStaff || false,
        canAccessSettings: admin.permissions?.canAccessSettings || false,
        canManageInventory: admin.permissions?.canManageInventory || false,
      };
    } catch (error) {
      console.error("Error preparing admin for edit:", error);
      toast.error("Error loading admin data for editing.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },
};

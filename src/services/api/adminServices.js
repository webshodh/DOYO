// Admin Services - services/api/adminServices.js

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
import { toast } from "react-toastify";

const firestore = getFirestore();

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

  // Add a new admin
  addAdmin: async (adminData, linkedHotelId = null, existingAdmins = []) => {
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

      // Generate adminId from email (sanitized for Firestore)
      const adminId = adminData.email
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();

      const batch = writeBatch(firestore);

      // Prepare admin data
      const data = {
        ...adminData,
        adminId,
        linkedHotelId: linkedHotelId || adminData.linkedHotelId,
        status: adminData.status || "active",
        permissions: {
          canManageMenu: adminData.canManageMenu || false,
          canManageOrders: adminData.canManageOrders || false,
          canManageCaptains: adminData.canManageCaptains || false,
          canViewReports: adminData.canViewReports || false,
          canManageCategories: adminData.canManageCategories || false,
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

        batch.update(adminMetaRef, {
          totalAdmins: currentCount + 1,
          lastUpdated: Timestamp.fromDate(new Date()),
        });
      }

      await batch.commit();

      toast.success("Admin created successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Error creating admin. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Update admin
  updateAdmin: async (adminId, adminData) => {
    try {
      const data = {
        ...adminData,
        permissions: {
          canManageMenu: adminData.canManageMenu || false,
          canManageOrders: adminData.canManageOrders || false,
          canManageCaptains: adminData.canManageCaptains || false,
          canViewReports: adminData.canViewReports || false,
          canManageCategories: adminData.canManageCategories || false,
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

  // Delete admin
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

      await batch.commit();

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
          createdAt: adminData.createdAt,
        });
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

  // Prepare admin for edit
  prepareForEdit: async (admin) => {
    try {
      return {
        ...admin,
        // Ensure permissions are properly structured
        canManageMenu: admin.permissions?.canManageMenu || false,
        canManageOrders: admin.permissions?.canManageOrders || false,
        canManageCaptains: admin.permissions?.canManageCaptains || false,
        canViewReports: admin.permissions?.canViewReports || false,
        canManageCategories: admin.permissions?.canManageCategories || false,
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

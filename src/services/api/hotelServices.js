// firestoreHotelService.js
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { validateHotelForm } from "../../validation/hotelValidation";

const firestore = getFirestore();
const auth = getAuth();

export const hotelServices = {
  searchAdminByEmail: async (email) => {
    try {
      const adminsSnapshot = await getDocs(collection(firestore, "admins"));
      for (const adminDoc of adminsSnapshot.docs) {
        const adminData = adminDoc.data();
        if (adminData.email === email) {
          const hotelNames = adminData.hotels
            ? Object.keys(adminData.hotels)
            : [];
          return {
            exists: true,
            adminId: adminDoc.id,
            adminData: {
              name: adminData.name,
              contact: adminData.contact,
              email: adminData.email,
              role: adminData.role || "admin",
              hotels: hotelNames,
            },
          };
        }
      }
      return { exists: false, adminId: null, adminData: null };
    } catch (error) {
      console.error("Error searching admin:", error);
      throw new Error("Failed to search admin");
    }
  },

  checkHotelExists: async (hotelName) => {
    try {
      const hotelDoc = await getDoc(doc(firestore, `hotels/${hotelName}`));
      return hotelDoc.exists();
    } catch (error) {
      console.error("Error checking hotel existence:", error);
      return false;
    }
  },

  createAdminAccount: async (adminData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );
      return userCredential.user.uid;
    } catch (error) {
      console.error("Error creating admin account:", error);

      let errorMessage = "Failed to create admin account";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already registered";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      }

      throw new Error(errorMessage);
    }
  },

  saveAdminData: async (adminId, adminData) => {
    try {
      const newAdminData = {
        name: adminData.name,
        email: adminData.email,
        contact: adminData.contact,
        role: adminData.role || "admin",
        createdAt: new Date().toISOString(),
        hotels: {},
      };

      await setDoc(doc(firestore, `admins/${adminId}`), newAdminData);
      return true;
    } catch (error) {
      console.error("Error saving admin data:", error);
      throw new Error("Failed to save admin data");
    }
  },

  updateAdminHotelList: async (adminId, hotelName, hotelUuid) => {
    try {
      const hotelData = {
        hotelName,
        hotelUuid,
        assignedAt: new Date().toISOString(),
      };

      const adminHotelsRef = doc(firestore, `admins/${adminId}`);
      // Fetch existing hotel list to merge
      const adminDoc = await getDoc(adminHotelsRef);
      const adminData = adminDoc.exists() ? adminDoc.data() : {};
      const hotels = adminData.hotels || {};
      hotels[hotelName] = hotelData;

      await setDoc(adminHotelsRef, { hotels }, { merge: true });

      return true;
    } catch (error) {
      console.error("Error updating admin hotel list:", error);
      throw new Error("Failed to update admin hotel list");
    }
  },

  saveHotelData: async (hotelName, hotelData) => {
    try {
      await setDoc(doc(firestore, `hotels/${hotelName}/info`), hotelData);
      return true;
    } catch (error) {
      console.error("Error saving hotel data:", error);
      throw new Error("Failed to save hotel data");
    }
  },

  createHotelWithAdmin: async (hotelName, admin, completeFormData = {}) => {
    try {
      if (!hotelName.trim()) {
        return { success: false, message: "Hotel name is required" };
      }
      if (!admin.email.trim() || !admin.name.trim() || !admin.contact.trim()) {
        return { success: false, message: "All admin fields are required" };
      }

      const hotelExists = await hotelServices.checkHotelExists(hotelName);
      if (hotelExists) {
        return {
          success: false,
          message: "Hotel with this name already exists",
        };
      }

      const hotelUuid = uuidv4();
      let adminId;
      let isNewAdmin = false;

      if (admin.isExisting) {
        adminId = admin.existingAdminId;
      } else {
        if (!admin.password.trim()) {
          return {
            success: false,
            message: "Password is required for new admin",
          };
        }

        try {
          adminId = await hotelServices.createAdminAccount(admin);
          await hotelServices.saveAdminData(adminId, admin);
          isNewAdmin = true;
        } catch (error) {
          return { success: false, message: error.message };
        }
      }

      await hotelServices.updateAdminHotelList(adminId, hotelName, hotelUuid);

      const completeHotelData = {
        uuid: hotelUuid,
        hotelName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
        admin: {
          adminId,
          name: admin.name,
          email: admin.email,
          contact: admin.contact,
          role: admin.role || "admin",
          assignedAt: new Date().toISOString(),
        },
        businessName: completeFormData.businessName || hotelName,
        businessType: completeFormData.businessType || "",
        primaryContact: completeFormData.primaryContact || "",
        alternateContact: completeFormData.alternateContact || "",
        address: completeFormData.address || "",
        area: completeFormData.area || "",
        landmark: completeFormData.landmark || "",
        city: completeFormData.city || "",
        district: completeFormData.district || "",
        state: completeFormData.state || "",
        pincode: completeFormData.pincode || "",
        businessEmail: completeFormData.businessEmail || "",
        website: completeFormData.website || "",
        instagramHandle: completeFormData.instagramHandle || "",
        facebookPage: completeFormData.facebookPage || "",
        googleMapsLink: completeFormData.googleMapsLink || "",
        zomatoLink: completeFormData.zomatoLink || "",
        swiggyLink: completeFormData.swiggyLink || "",
        formVersion: "1.0",
        source: "admin_panel",
      };

      await hotelServices.saveHotelData(hotelName, completeHotelData);

      const message = isNewAdmin
        ? `Hotel "${hotelName}" created with new admin "${admin.name}"`
        : `Hotel "${hotelName}" assigned to existing admin "${admin.name}"`;

      toast.success(message, { position: toast.POSITION.TOP_RIGHT });

      return {
        success: true,
        hotelId: hotelUuid,
        adminId,
        message,
        isNewAdmin,
        hotelData: completeHotelData,
      };
    } catch (error) {
      console.error("Error creating hotel with admin:", error);
      const message = error.message || "Failed to create hotel with admin";
      toast.error(`Error: ${message}`, { position: toast.POSITION.TOP_RIGHT });
      return { success: false, message };
    }
  },

  getAdminWithHotels: async (adminId) => {
    try {
      const adminDoc = await getDoc(doc(firestore, `admins/${adminId}`));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const hotels = adminData.hotels ? Object.values(adminData.hotels) : [];
        return {
          admin: {
            id: adminId,
            name: adminData.name,
            email: adminData.email,
            contact: adminData.contact,
            role: adminData.role || "admin",
            createdAt: adminData.createdAt,
          },
          hotels,
        };
      } else {
        throw new Error("Admin not found");
      }
    } catch (error) {
      console.error("Error getting admin with hotels:", error);
      throw new Error("Failed to get admin details");
    }
  },

  getHotelsByAdmin: async (adminEmail) => {
    try {
      const adminData = await hotelServices.searchAdminByEmail(adminEmail);
      if (adminData.exists) {
        const adminDetails = await hotelServices.getAdminWithHotels(
          adminData.adminId
        );
        return adminDetails.hotels;
      }
      return [];
    } catch (error) {
      console.error("Error getting hotels by admin:", error);
      throw new Error("Failed to get hotels for admin");
    }
  },

  assignHotelToAdmin: async (hotelName, adminId) => {
    try {
      const hotelDoc = await getDoc(
        doc(firestore, `/hotels/${hotelName}/info`)
      );
      if (!hotelDoc.exists()) {
        return { success: false, message: "Hotel not found" };
      }
      const hotelData = hotelDoc.data();

      const adminDoc = await getDoc(doc(firestore, `admins/${adminId}`));
      if (!adminDoc.exists()) {
        return { success: false, message: "Admin not found" };
      }
      const adminData = adminDoc.data();

      const hotelInfoRef = doc(firestore, `/hotels/${hotelName}/info`);
      await setDoc(
        hotelInfoRef,
        {
          admin: {
            adminId,
            name: adminData.name,
            email: adminData.email,
            contact: adminData.contact,
            role: adminData.role || "admin",
            assignedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      await hotelServices.updateAdminHotelList(
        adminId,
        hotelName,
        hotelData.uuid
      );

      return {
        success: true,
        message: `Hotel "${hotelName}" successfully assigned to admin "${adminData.name}"`,
      };
    } catch (error) {
      console.error("Error assigning hotel to admin:", error);
      return {
        success: false,
        message: error.message || "Failed to assign hotel to admin",
      };
    }
  },

  removeAdminFromHotel: async (hotelName, adminId) => {
    try {
      const adminDocRef = doc(firestore, `admins/${adminId}`);
      const adminDoc = await getDoc(adminDocRef);
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const hotels = adminData.hotels || {};
        delete hotels[hotelName];
        await setDoc(adminDocRef, { hotels }, { merge: true });
      }

      const hotelInfoRef = doc(firestore, `/hotels/${hotelName}/info`);
      await setDoc(hotelInfoRef, { admin: null }, { merge: true });

      return {
        success: true,
        message: "Admin successfully removed from hotel",
      };
    } catch (error) {
      console.error("Error removing admin from hotel:", error);
      return {
        success: false,
        message: error.message || "Failed to remove admin from hotel",
      };
    }
  },

  getAllHotels: async () => {
    try {
      const hotelsSnapshot = await getDocs(collection(firestore, "hotels"));
      return hotelsSnapshot.docs.map((doc) => doc.id);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      throw new Error("Failed to fetch hotels");
    }
  },

  createHotelWithAdmins: async (hotelName, admins) => {
    if (admins && admins.length > 0) {
      return hotelServices.createHotelWithAdmin(hotelName, admins[0]);
    } else {
      return { success: false, message: "At least one admin is required" };
    }
  },

  checkExistingAdmin: async (email) => {
    return hotelServices.searchAdminByEmail(email);
  },
};

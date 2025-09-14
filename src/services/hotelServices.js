import { db } from "../data/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { set, ref, get } from "firebase/database";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { validateHotelForm } from "../validation/hotelValidation";

// Hotel Services - Updated to support single admin per hotel with multiple hotel assignments
export const hotelServices = {
  // Search for admin by email
  searchAdminByEmail: async (email) => {
    try {
      const adminsRef = ref(db, "admins");
      const snapshot = await get(adminsRef);

      if (snapshot.exists()) {
        const allAdmins = snapshot.val();
        for (const [adminId, adminData] of Object.entries(allAdmins)) {
          if (adminData.email === email) {
            // Get hotel names from admin's hotels object
            const hotelNames = adminData.hotels
              ? Object.keys(adminData.hotels)
              : [];

            return {
              exists: true,
              adminId: adminId,
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
      }

      return { exists: false, adminId: null, adminData: null };
    } catch (error) {
      console.error("Error searching admin:", error);
      throw new Error("Failed to search admin");
    }
  },

  // Check if hotel exists
  checkHotelExists: async (hotelName) => {
    try {
      const hotelRef = ref(db, `/hotels/${hotelName}`);
      const snapshot = await get(hotelRef);
      return snapshot.exists();
    } catch (error) {
      console.error("Error checking hotel existence:", error);
      return false;
    }
  },

  // Create new admin account
  createAdminAccount: async (adminData) => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );
      return userCredential.user.uid;
    } catch (error) {
      console.error("Error creating admin account:", error);

      // Handle specific Firebase auth errors
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

  // Save admin data to database
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

      await set(ref(db, `admins/${adminId}`), newAdminData);
      return true;
    } catch (error) {
      console.error("Error saving admin data:", error);
      throw new Error("Failed to save admin data");
    }
  },

  // Update admin's hotel list
  updateAdminHotelList: async (adminId, hotelName, hotelUuid) => {
    try {
      await set(ref(db, `admins/${adminId}/hotels/${hotelName}`), {
        hotelName,
        hotelUuid,
        assignedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error updating admin hotel list:", error);
      throw new Error("Failed to update admin hotel list");
    }
  },

  // Save hotel data to database
  saveHotelData: async (hotelName, hotelData) => {
    try {
      console.log(`Saving to /hotels/${hotelName}/info:`, hotelData); // Debug log

      await set(ref(db, `/hotels/${hotelName}/info`), hotelData);

      console.log("Hotel data saved successfully"); // Debug log

      return true;
    } catch (error) {
      console.error("Error saving hotel data:", error);
      console.error("Data that failed to save:", hotelData); // Debug log
      throw new Error("Failed to save hotel data");
    }
  },

  // Create hotel with admin (existing or new)
  createHotelWithAdmin: async (hotelName, admin, completeFormData = {}) => {
    try {
      // Validate basic requirements
      if (!hotelName.trim()) {
        return { success: false, message: "Hotel name is required" };
      }

      if (!admin.email.trim() || !admin.name.trim() || !admin.contact.trim()) {
        return { success: false, message: "All admin fields are required" };
      }

      // Check if hotel already exists
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
        // Use existing admin
        adminId = admin.existingAdminId;
      } else {
        // Create new admin account
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

      // Update admin's hotel list
      await hotelServices.updateAdminHotelList(adminId, hotelName, hotelUuid);

      // THIS IS THE FIX - Create COMPLETE hotel data object with ALL form fields
      const completeHotelData = {
        // System fields
        uuid: hotelUuid,
        hotelName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",

        // Admin information
        admin: {
          adminId,
          name: admin.name,
          email: admin.email,
          contact: admin.contact,
          role: admin.role || "admin",
          assignedAt: new Date().toISOString(),
        },

        // === ALL FORM DATA FROM hotelFormConfig ===

        // Basic Information Section
        businessName: completeFormData.businessName || hotelName,
        businessType: completeFormData.businessType || "",
        primaryContact: completeFormData.primaryContact || "",
        alternateContact: completeFormData.alternateContact || "",

        // Location Information Section
        address: completeFormData.address || "",
        area: completeFormData.area || "",
        landmark: completeFormData.landmark || "",
        city: completeFormData.city || "",
        district: completeFormData.district || "",
        state: completeFormData.state || "",
        pincode: completeFormData.pincode || "",

        // Business Details Section
        businessEmail: completeFormData.businessEmail || "",
        website: completeFormData.website || "",

        // Social Media & Marketing Section
        instagramHandle: completeFormData.instagramHandle || "",
        facebookPage: completeFormData.facebookPage || "",
        googleMapsLink: completeFormData.googleMapsLink || "",
        zomatoLink: completeFormData.zomatoLink || "",
        swiggyLink: completeFormData.swiggyLink || "",

        // Add any additional metadata
        formVersion: "1.0",
        source: "admin_panel",
      };

      console.log("Saving complete hotel data:", completeHotelData); // Debug log

      // Save complete hotel data to /hotels/{hotelName}/info
      await hotelServices.saveHotelData(hotelName, completeHotelData);

      const message = isNewAdmin
        ? `Hotel "${hotelName}" created with new admin "${admin.name}"`
        : `Hotel "${hotelName}" assigned to existing admin "${admin.name}"`;

      toast.success(message, {
        position: toast.POSITION.TOP_RIGHT,
      });

      return {
        success: true,
        hotelId: hotelUuid,
        adminId: adminId,
        message: message,
        isNewAdmin: isNewAdmin,
        hotelData: completeHotelData,
      };
    } catch (error) {
      console.error("Error creating hotel with admin:", error);
      const errorMessage = error.message || "Failed to create hotel with admin";

      toast.error(`Error: ${errorMessage}`, {
        position: toast.POSITION.TOP_RIGHT,
      });

      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Get admin details with associated hotels
  getAdminWithHotels: async (adminId) => {
    try {
      const adminRef = ref(db, `admins/${adminId}`);
      const snapshot = await get(adminRef);

      if (snapshot.exists()) {
        const adminData = snapshot.val();
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
          hotels: hotels,
        };
      } else {
        throw new Error("Admin not found");
      }
    } catch (error) {
      console.error("Error getting admin with hotels:", error);
      throw new Error("Failed to get admin details");
    }
  },

  // Get all hotels for a specific admin by email
  getHotelsByAdmin: async (adminEmail) => {
    try {
      const adminData = await hotelServices.searchAdminByEmail(adminEmail);

      if (adminData.exists) {
        const adminDetails = await hotelServices.getAdminWithHotels(
          adminData.adminId
        );
        return adminDetails.hotels;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error getting hotels by admin:", error);
      throw new Error("Failed to get hotels for admin");
    }
  },

  // Assign existing hotel to existing admin
  assignHotelToAdmin: async (hotelName, adminId) => {
    try {
      // Get hotel data
      const hotelRef = ref(db, `/hotels/${hotelName}/info`);
      const hotelSnapshot = await get(hotelRef);

      if (!hotelSnapshot.exists()) {
        return { success: false, message: "Hotel not found" };
      }

      const hotelData = hotelSnapshot.val();

      // Get admin data
      const adminRef = ref(db, `admins/${adminId}`);
      const adminSnapshot = await get(adminRef);

      if (!adminSnapshot.exists()) {
        return { success: false, message: "Admin not found" };
      }

      const adminData = adminSnapshot.val();

      // Update hotel's admin
      await set(ref(db, `/hotels/${hotelName}/info/admin`), {
        adminId,
        name: adminData.name,
        email: adminData.email,
        contact: adminData.contact,
        role: adminData.role || "admin",
        assignedAt: new Date().toISOString(),
      });

      // Update admin's hotel list
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

  // Remove admin from hotel
  removeAdminFromHotel: async (hotelName, adminId) => {
    try {
      // Remove hotel from admin's hotel list
      await set(ref(db, `admins/${adminId}/hotels/${hotelName}`), null);

      // Remove admin from hotel (set to null or remove admin field)
      await set(ref(db, `/hotels/${hotelName}/info/admin`), null);

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

  // Get all hotels (for validation or display)
  getAllHotels: async () => {
    try {
      const hotelsRef = ref(db, "hotels");
      const snapshot = await get(hotelsRef);

      if (snapshot.exists()) {
        return Object.keys(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error("Error fetching hotels:", error);
      throw new Error("Failed to fetch hotels");
    }
  },

  // Legacy function - kept for backward compatibility but simplified
  createHotelWithAdmins: async (hotelName, admins) => {
    // For backward compatibility, take the first admin
    if (admins && admins.length > 0) {
      return await hotelServices.createHotelWithAdmin(hotelName, admins[0]);
    } else {
      return { success: false, message: "At least one admin is required" };
    }
  },

  // Legacy function - kept for backward compatibility
  checkExistingAdmin: async (email) => {
    return await hotelServices.searchAdminByEmail(email);
  },
};

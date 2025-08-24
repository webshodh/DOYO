import { db } from "../data/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { set, ref, get } from "firebase/database";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { validateHotelForm } from "../Validation/hotelValidation";

export const hotelServices = {
  // Check if admin exists by email
  checkExistingAdmin: async (email) => {
    try {
      const adminsRef = ref(db, "admins");
      const snapshot = await get(adminsRef);

      if (snapshot.exists()) {
        const allAdmins = snapshot.val();
        for (const [existingAdminId, adminData] of Object.entries(allAdmins)) {
          if (adminData.email === email) {
            return {
              exists: true,
              adminId: existingAdminId,
              adminData: {
                name: adminData.name,
                contact: adminData.contact,
                email: adminData.email,
                role: adminData.role || "admin",
              },
            };
          }
        }
      }
      return { exists: false };
    } catch (error) {
      console.error("Error checking existing admin:", error);
      throw new Error("Failed to check existing admin");
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
      await set(ref(db, `/hotels/${hotelName}/info`), hotelData);
      return true;
    } catch (error) {
      console.error("Error saving hotel data:", error);
      throw new Error("Failed to save hotel data");
    }
  },

  // Process admins (create new or link existing)
  processAdmins: async (admins, hotelName, hotelUuid) => {
    const processedAdmins = [];

    for (const admin of admins) {
      try {
        let adminId;

        if (admin.isExisting) {
          adminId = admin.existingAdminId;
        } else {
          // Create new admin account
          adminId = await hotelServices.createAdminAccount(admin);

          // Save new admin data
          await hotelServices.saveAdminData(adminId, admin);
        }

        // Update admin's hotel list
        await hotelServices.updateAdminHotelList(adminId, hotelName, hotelUuid);

        // Add to processed admins list
        processedAdmins.push({
          adminId,
          name: admin.name,
          email: admin.email,
          contact: admin.contact,
          role: admin.role || "admin",
          assignedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error processing admin ${admin.email}:`, error);
        throw new Error(
          `Failed to process admin ${admin.email}: ${error.message}`
        );
      }
    }

    return processedAdmins;
  },

  // Main function to create hotel with admins
  createHotelWithAdmins: async (hotelName, admins) => {
    try {
      // Validate form data
      if (!validateHotelForm(hotelName, admins)) {
        return { success: false, error: "Validation failed" };
      }

      const hotelUuid = uuidv4();

      // Process all admins
      const processedAdmins = await hotelServices.processAdmins(
        admins,
        hotelName,
        hotelUuid
      );

      // Prepare hotel data
      const hotelData = {
        uuid: hotelUuid,
        hotelName,
        createdAt: new Date().toISOString(),
        status: "active",
        admins: processedAdmins.reduce((acc, admin) => {
          acc[admin.adminId] = admin;
          return acc;
        }, {}),
      };

      // Save hotel data
      await hotelServices.saveHotelData(hotelName, hotelData);

      toast.success("Hotel and Admin(s) added successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return { success: true, hotelUuid };
    } catch (error) {
      console.error("Error creating hotel with admins:", error);
      toast.error(`Error: ${error.message}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return { success: false, error: error.message };
    }
  },

  // Check if hotel name already exists
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
};

import { useState, useCallback } from "react";
import { hotelServices } from "../services/hotelServices";
import { toast } from "react-toastify";
import {
  validateEmail,
  validateContact,
  validatePassword,
} from "../Validation/hotelValidation";

export const useHotel = () => {
  const [hotelName, setHotelName] = useState("");
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    role: "admin",
    isExisting: false,
    existingAdminId: "",
    existingHotels: [],
    searched: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  // Update admin field
  const updateAdmin = useCallback((field, value) => {
    setAdmin((prev) => ({
      ...prev,
      [field]: value,
      // Reset search status when email changes
      ...(field === "email" && {
        isExisting: false,
        existingAdminId: "",
        existingHotels: [],
        searched: false,
        name: "",
        contact: "",
        password: "",
      }),
    }));
  }, []);

  // Search for existing admin
  const searchAdmin = useCallback(async () => {
    if (!admin.email.trim() || !validateEmail(admin.email)) {
      toast.error("Please enter a valid email address", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    try {
      setSearching(true);
      const result = await hotelServices.searchAdminByEmail(admin.email);

      if (result.exists) {
        setAdmin((prev) => ({
          ...prev,
          isExisting: true,
          existingAdminId: result.adminId,
          name: result.adminData.name,
          contact: result.adminData.contact,
          existingHotels: result.adminData.hotels || [],
          searched: true,
        }));

        toast.success(`Found existing admin: ${result.adminData.name}`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        setAdmin((prev) => ({
          ...prev,
          isExisting: false,
          existingAdminId: "",
          name: "",
          contact: "",
          password: "",
          existingHotels: [],
          searched: true,
        }));

        toast.info(
          "Admin not found. Please fill in details to create new admin.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      }
    } catch (error) {
      console.error("Error searching admin:", error);
      toast.error("Error searching for admin. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setAdmin((prev) => ({
        ...prev,
        searched: false,
      }));
    } finally {
      setSearching(false);
    }
  }, [admin.email]);

  // Create new admin (optional - can be triggered by button click)
  const createNewAdmin = useCallback(() => {
    if (!admin.searched || admin.isExisting) return;

    toast.info("Please fill in all required details to create the new admin.", {
      position: toast.POSITION.TOP_RIGHT,
    });
  }, [admin.searched, admin.isExisting]);

  // Submit hotel with admin
  const submitHotelWithAdmin = useCallback(async () => {
    try {
      setSubmitting(true);

      // Validate hotel name
      if (!hotelName.trim()) {
        toast.error("Hotel name is required", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return { success: false };
      }

      // Check if hotel already exists
      const hotelExists = await hotelServices.checkHotelExists(hotelName);
      if (hotelExists) {
        toast.error("Hotel with this name already exists", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return { success: false };
      }

      // Validate admin details
      if (!admin.searched) {
        toast.error("Please search for admin by email first", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return { success: false };
      }

      if (!getAdminValidationStatus()) {
        toast.error("Please fill in all required admin details", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return { success: false };
      }

      const result = await hotelServices.createHotelWithAdmin(hotelName, admin);

      if (result.success) {
        if (admin.isExisting) {
          toast.success(
            `Hotel "${hotelName}" created and assigned to existing admin "${admin.name}"`,
            {
              position: toast.POSITION.TOP_RIGHT,
            }
          );
        } else {
          toast.success(
            `Hotel "${hotelName}" created with new admin "${admin.name}"`,
            {
              position: toast.POSITION.TOP_RIGHT,
            }
          );
        }
        resetForm();
      } else {
        toast.error(result.message || "Failed to create hotel", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      return result;
    } catch (error) {
      console.error("Error submitting hotel:", error);
      toast.error("Unexpected error occurred", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return { success: false, error: error.message };
    } finally {
      setSubmitting(false);
    }
  }, [hotelName, admin]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setHotelName("");
    setAdmin({
      name: "",
      email: "",
      password: "",
      contact: "",
      role: "admin",
      isExisting: false,
      existingAdminId: "",
      existingHotels: [],
      searched: false,
    });
  }, []);

  // Get admin validation status
  const getAdminValidationStatus = useCallback(() => {
    if (!admin.searched) return false;

    const hasValidEmail = admin.email.trim() && validateEmail(admin.email);
    const hasName = admin.name.trim();
    const hasValidContact =
      admin.contact.trim() && validateContact(admin.contact);
    const hasValidPassword =
      admin.isExisting ||
      (admin.password.trim() && validatePassword(admin.password));

    return hasValidEmail && hasName && hasValidContact && hasValidPassword;
  }, [admin]);

  // Get form validation status
  const getFormValidationStatus = useCallback(() => {
    const hotelValid = hotelName.trim();
    const adminValid = getAdminValidationStatus();

    return {
      hotelValid,
      adminValid,
      isFormValid: hotelValid && adminValid,
    };
  }, [hotelName, getAdminValidationStatus]);

  return {
    // State
    hotelName,
    admin,
    loading,
    submitting,
    searching,

    // Actions
    setHotelName,
    updateAdmin,
    searchAdmin,
    createNewAdmin,
    submitHotelWithAdmin,
    resetForm,

    // Computed values
    getAdminValidationStatus,
    getFormValidationStatus,

    // Utilities
    adminExists: admin.isExisting,
  };
};

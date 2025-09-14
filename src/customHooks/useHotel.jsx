import { useState, useCallback } from "react";
import { hotelServices } from "../services/hotelServices";
import { toast } from "react-toastify";
import {
  validateEmail,
  validateContact,
  validatePassword,
} from "../validation/hotelValidation";
import { hotelFormConfig } from "Constants/addHotelFormConfig";

const useHotel = () => {
  // Get default form data from config
  const getDefaultFormData = () => {
    const defaultData = {};
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        defaultData[field.name] = field.defaultValue || "";
      });
    });
    return defaultData;
  };

  // Form data state
  const [formData, setFormData] = useState(getDefaultFormData());

  // Admin state
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

  // Loading states
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

  // Get admin validation status
  const getAdminValidationStatus = useCallback(() => {
    // Must have searched for admin first
    if (
      !admin.searched ||
      !admin.email?.trim() ||
      !validateEmail(admin.email)
    ) {
      return false;
    }

    // Basic required fields
    if (!admin.name?.trim() || !admin.contact?.trim()) {
      return false;
    }

    // Contact validation
    if (!validateContact(admin.contact)) {
      return false;
    }

    // For new admins, password is required
    if (
      !admin.isExisting &&
      (!admin.password?.trim() || !validatePassword(admin.password))
    ) {
      return false;
    }

    return true;
  }, [admin]);

  // Submit hotel with admin - Updated to accept hotelData parameter
  const submitHotelWithAdmin = useCallback(
    async (hotelData = null) => {
      try {
        setSubmitting(true);

        // Use provided hotelData or fallback to formData.businessName
        const dataToUse = hotelData || formData;
        const hotelName = dataToUse.hotelName || dataToUse.businessName;

        // Validate hotel name
        if (!hotelName?.trim()) {
          toast.error("Business name is required", {
            position: toast.POSITION.TOP_RIGHT,
          });
          return { success: false };
        }

        // Check if hotel already exists
        const hotelExists = await hotelServices.checkHotelExists(hotelName);
        if (hotelExists) {
          toast.error("Business with this name already exists", {
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

        // Create the hotel with complete data
        const result = await hotelServices.createHotelWithAdmin(
          hotelName,
          admin,
          dataToUse
        );

        if (result.success) {
          if (admin.isExisting) {
            toast.success(
              `Restaurant "${hotelName}" created and assigned to existing admin "${admin.name}"`,
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );
          } else {
            toast.success(
              `Restaurant "${hotelName}" created with new admin "${admin.name}"`,
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );
          }
          resetForm();
        } else {
          toast.error(result.message || "Failed to create restaurant", {
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
    },
    [formData, admin, getAdminValidationStatus]
  );

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
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

  // Get form validation status
  const getFormValidationStatus = useCallback(() => {
    // Get all required fields from config
    const requiredFields = [];
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required) {
          requiredFields.push(field.name);
        }
      });
    });

    // Check if all required fields have values
    const hotelValid = requiredFields.every((fieldName) =>
      formData[fieldName]?.toString().trim()
    );

    const adminValid = getAdminValidationStatus();

    return {
      hotelValid,
      adminValid,
      isFormValid: hotelValid && adminValid,
    };
  }, [formData, getAdminValidationStatus]);

  return {
    // State
    formData,
    admin,
    loading,
    submitting,
    searching,

    // Actions
    setFormData,
    updateAdmin,
    searchAdmin,
    createNewAdmin,
    submitHotelWithAdmin,
    resetForm,

    // Validation functions
    getAdminValidationStatus,
    getFormValidationStatus,

    // Utilities
    adminExists: admin.isExisting,
  };
};

export default useHotel;

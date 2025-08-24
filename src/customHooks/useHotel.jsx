import { useState, useCallback } from "react";
import { hotelServices } from "../services/hotelServices";
import { toast } from "react-toastify";

export const useHotel = () => {
  const [hotelName, setHotelName] = useState("");
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: "",
      email: "",
      password: "",
      contact: "",
      role: "admin",
      isExisting: false,
      existingAdminId: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate unique ID for new admin
  const generateAdminId = useCallback(() => {
    return Math.max(...admins.map((admin) => admin.id), 0) + 1;
  }, [admins]);

  // Add new admin form
  const addNewAdmin = useCallback(() => {
    if (admins.length < 2) {
      const newAdmin = {
        id: generateAdminId(),
        name: "",
        email: "",
        password: "",
        contact: "",
        role: "admin",
        isExisting: false,
        existingAdminId: "",
      };
      setAdmins((prev) => [...prev, newAdmin]);
    } else {
      toast.warning("Maximum 2 admins allowed per hotel", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, [admins.length, generateAdminId]);

  // Remove admin
  const removeAdmin = useCallback(
    (adminId) => {
      if (admins.length > 1) {
        setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
      } else {
        toast.warning("At least one admin is required", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    },
    [admins.length]
  );

  // Update admin field
  const updateAdmin = useCallback((adminId, field, value) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === adminId ? { ...admin, [field]: value } : admin
      )
    );
  }, []);

  // Check if existing admin exists
  const checkExistingAdmin = useCallback(
    async (email, adminId) => {
      if (!email.trim()) return false;

      try {
        setLoading(true);
        const result = await hotelServices.checkExistingAdmin(email);

        if (result.exists) {
          updateAdmin(adminId, "isExisting", true);
          updateAdmin(adminId, "existingAdminId", result.adminId);
          updateAdmin(adminId, "name", result.adminData.name);
          updateAdmin(adminId, "contact", result.adminData.contact);

          toast.info(`Found existing admin: ${result.adminData.name}`, {
            position: toast.POSITION.TOP_RIGHT,
          });
          return true;
        } else {
          updateAdmin(adminId, "isExisting", false);
          updateAdmin(adminId, "existingAdminId", "");
          return false;
        }
      } catch (error) {
        console.error("Error checking existing admin:", error);
        toast.error("Error checking existing admin", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [updateAdmin]
  );

  // Submit hotel and admins
  const submitHotelWithAdmins = useCallback(async () => {
    try {
      setSubmitting(true);

      // Check if hotel already exists
      const hotelExists = await hotelServices.checkHotelExists(hotelName);
      if (hotelExists) {
        toast.error("Hotel with this name already exists", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return { success: false };
      }

      const result = await hotelServices.createHotelWithAdmins(
        hotelName,
        admins
      );

      if (result.success) {
        resetForm();
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
  }, [hotelName, admins]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setHotelName("");
    setAdmins([
      {
        id: 1,
        name: "",
        email: "",
        password: "",
        contact: "",
        role: "admin",
        isExisting: false,
        existingAdminId: "",
      },
    ]);
  }, []);

  // Get admin validation status
  const getAdminValidationStatus = useCallback((admin) => {
    const hasName = admin.name.trim();
    const hasValidEmail = admin.email.trim();
    const hasValidContact = admin.contact.trim();
    const hasValidPassword = admin.isExisting || admin.password.trim();

    return hasName && hasValidEmail && hasValidContact && hasValidPassword;
  }, []);

  // Get form validation status
  const getFormValidationStatus = useCallback(() => {
    const hotelValid = hotelName.trim();
    const adminsValid = admins.every((admin) =>
      getAdminValidationStatus(admin)
    );

    return {
      hotelValid,
      adminsValid,
      isFormValid: hotelValid && adminsValid && admins.length > 0,
    };
  }, [hotelName, admins, getAdminValidationStatus]);

  return {
    // State
    hotelName,
    admins,
    loading,
    submitting,

    // Actions
    setHotelName,
    addNewAdmin,
    removeAdmin,
    updateAdmin,
    checkExistingAdmin,
    submitHotelWithAdmins,
    resetForm,

    // Computed values
    getAdminValidationStatus,
    getFormValidationStatus,

    // Utilities
    canAddMoreAdmins: admins.length < 2,
    canRemoveAdmin: admins.length > 1,
  };
};

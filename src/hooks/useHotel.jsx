// src/hooks/useHotel.jsx
import { useState, useCallback, useEffect, useRef } from "react";
import { hotelServices } from "../services/api/hotelServices";
import { toast } from "react-toastify";
import {
  validateEmail,
  validateContact,
  validatePassword,
} from "../validation/hotelValidation";
import { hotelFormConfig } from "../Constants/ConfigForms/addHotelFormConfig";
import { useAuth } from "../context/AuthContext";

const useHotel = () => {
  // ✅ NEW: Get user context for permissions
  const { isSuperAdmin, currentUser } = useAuth();

  // Refs for debouncing
  const searchTimeoutRef = useRef(null);

  // Get default form data from config
  const getDefaultFormData = useCallback(() => {
    const defaultData = {};
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        defaultData[field.name] = field.defaultValue || "";
      });
    });
    return defaultData;
  }, []);

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

  // ✅ NEW: Additional state for enhanced functionality
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formStep, setFormStep] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [adminSearchHistory, setAdminSearchHistory] = useState([]);

  // ✅ NEW: Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ✅ NEW: Permission check
  const checkPermissions = useCallback(() => {
    if (!isSuperAdmin()) {
      toast.error("Only super admins can create hotels and admins", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    return true;
  }, [isSuperAdmin]);

  // ✅ ENHANCED: Update form data with validation
  const updateFormData = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Mark field as touched
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Update admin field
  const updateAdmin = useCallback(
    (field, value) => {
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

      // Mark admin field as touched
      setTouched((prev) => ({
        ...prev,
        [`admin_${field}`]: true,
      }));

      // Clear admin field-specific error
      if (errors[`admin_${field}`]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`admin_${field}`];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // ✅ ENHANCED: Search for existing admin with debouncing
  const searchAdmin = useCallback(
    async (emailToSearch = null) => {
      const email = emailToSearch || admin.email;

      if (!email.trim() || !validateEmail(email)) {
        toast.error("Please enter a valid email address", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setSearching(true);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.admin_email;
            return newErrors;
          });

          const result = await hotelServices.searchAdminByEmail(email);

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

            // Add to search history
            setAdminSearchHistory((prev) => {
              const newHistory = prev.filter((item) => item.email !== email);
              return [
                { email, found: true, name: result.adminData.name },
                ...newHistory,
              ].slice(0, 5);
            });

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

            // Add to search history
            setAdminSearchHistory((prev) => {
              const newHistory = prev.filter((item) => item.email !== email);
              return [{ email, found: false }, ...newHistory].slice(0, 5);
            });

            toast.info(
              "Admin not found. Please fill in details to create new admin.",
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );
          }
        } catch (error) {
          console.error("Error searching admin:", error);
          setErrors((prev) => ({
            ...prev,
            admin_email: "Error searching for admin. Please try again.",
          }));
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
      }, 500); // 500ms debounce
    },
    [admin.email]
  );

  // ✅ NEW: Auto-search admin when email changes (with debouncing)
  const debouncedSearchAdmin = useCallback(
    (email) => {
      if (email && validateEmail(email)) {
        searchAdmin(email);
      }
    },
    [searchAdmin]
  );

  // Create new admin (optional - can be triggered by button click)
  const createNewAdmin = useCallback(() => {
    if (!admin.searched || admin.isExisting) return;

    toast.info("Please fill in all required details to create the new admin.", {
      position: toast.POSITION.TOP_RIGHT,
    });
  }, [admin.searched, admin.isExisting]);

  // ✅ ENHANCED: Validate individual fields
  const validateField = useCallback((fieldName, value) => {
    const fieldConfig = hotelFormConfig.sections
      .flatMap((section) => section.fields)
      .find((field) => field.name === fieldName);

    if (!fieldConfig) return null;

    // Required field validation
    if (fieldConfig.required && (!value || !value.toString().trim())) {
      return `${fieldConfig.label} is required`;
    }

    // Type-specific validation
    switch (fieldConfig.type) {
      case "email":
        if (value && !validateEmail(value)) {
          return "Please enter a valid email address";
        }
        break;
      case "tel":
        if (value && !validateContact(value)) {
          return "Please enter a valid phone number";
        }
        break;
      case "url":
        if (value && !/^https?:\/\//.test(value)) {
          return "Please enter a valid URL starting with http:// or https://";
        }
        break;
      default:
        break;
    }

    return null;
  }, []);

  // ✅ ENHANCED: Get admin validation status with detailed errors
  const getAdminValidationStatus = useCallback(() => {
    const adminErrors = {};

    // Must have searched for admin first
    if (
      !admin.searched ||
      !admin.email?.trim() ||
      !validateEmail(admin.email)
    ) {
      adminErrors.email = "Please search for admin by email first";
      return { valid: false, errors: adminErrors };
    }

    // Basic required fields
    if (!admin.name?.trim()) {
      adminErrors.name = "Admin name is required";
    }

    if (!admin.contact?.trim()) {
      adminErrors.contact = "Admin contact is required";
    }

    // Contact validation
    if (admin.contact && !validateContact(admin.contact)) {
      adminErrors.contact = "Please enter a valid contact number";
    }

    // For new admins, password is required
    if (!admin.isExisting) {
      if (!admin.password?.trim()) {
        adminErrors.password = "Password is required for new admin";
      } else if (!validatePassword(admin.password)) {
        adminErrors.password = "Password must be at least 6 characters long";
      }
    }

    return {
      valid: Object.keys(adminErrors).length === 0,
      errors: adminErrors,
    };
  }, [admin]);

  // ✅ ENHANCED: Validate entire form
  const validateForm = useCallback(() => {
    const formErrors = {};

    // Validate hotel form fields
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const error = validateField(field.name, formData[field.name]);
        if (error) {
          formErrors[field.name] = error;
        }
      });
    });

    // Validate admin
    const adminValidation = getAdminValidationStatus();
    if (!adminValidation.valid) {
      Object.keys(adminValidation.errors).forEach((key) => {
        formErrors[`admin_${key}`] = adminValidation.errors[key];
      });
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData, getAdminValidationStatus, validateField]);

  // ✅ ENHANCED: Submit hotel with admin
  const submitHotelWithAdmin = useCallback(
    async (hotelData = null) => {
      if (!checkPermissions()) {
        return { success: false, error: "Permission denied" };
      }

      try {
        setSubmitting(true);
        setErrors({});

        // Use provided hotelData or fallback to formData
        const dataToUse = hotelData || formData;
        const hotelName = dataToUse.hotelName || dataToUse.businessName;

        // Validate entire form
        if (!validateForm()) {
          toast.error("Please fix all form errors before submitting", {
            position: toast.POSITION.TOP_RIGHT,
          });
          return { success: false, error: "Validation failed" };
        }

        // Validate hotel name
        if (!hotelName?.trim()) {
          setErrors((prev) => ({
            ...prev,
            businessName: "Business name is required",
          }));
          toast.error("Business name is required", {
            position: toast.POSITION.TOP_RIGHT,
          });
          return { success: false, error: "Business name is required" };
        }

        // Check if hotel already exists
        setLoading(true);
        const hotelExists = await hotelServices.checkHotelExists(hotelName);
        if (hotelExists) {
          setErrors((prev) => ({
            ...prev,
            businessName: "Business with this name already exists",
          }));
          toast.error("Business with this name already exists", {
            position: toast.POSITION.TOP_RIGHT,
          });
          return { success: false, error: "Hotel already exists" };
        }

        // Create complete hotel data with metadata
        const completeHotelData = {
          ...dataToUse,
          uuid: `hotel_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          createdBy: currentUser?.uid,
          createdAt: new Date().toISOString(),
        };

        // Create the hotel with complete data
        const result = await hotelServices.createHotelWithAdmin(
          hotelName,
          admin,
          completeHotelData
        );

        if (result.success) {
          setLastSaved(new Date());

          if (admin.isExisting) {
            toast.success(
              `Restaurant "${hotelName}" created and assigned to existing admin "${admin.name}"`,
              {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 5000,
              }
            );
          } else {
            toast.success(
              `Restaurant "${hotelName}" created with new admin "${admin.name}". Login credentials have been set up.`,
              {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 5000,
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
        const errorMessage = error.message || "Unexpected error occurred";
        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return { success: false, error: errorMessage };
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
    [formData, admin, checkPermissions, validateForm, currentUser]
  );

  // ✅ ENHANCED: Reset form to initial state
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
    setErrors({});
    setTouched({});
    setFormStep(1);
    setLastSaved(null);
  }, [getDefaultFormData]);

  // ✅ ENHANCED: Get form validation status with detailed breakdown
  const getFormValidationStatus = useCallback(() => {
    const hotelErrors = {};
    const adminValidation = getAdminValidationStatus();

    // Check hotel fields
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required && !formData[field.name]?.toString().trim()) {
          hotelErrors[field.name] = `${field.label} is required`;
        }
      });
    });

    return {
      hotelValid: Object.keys(hotelErrors).length === 0,
      adminValid: adminValidation.valid,
      isFormValid:
        Object.keys(hotelErrors).length === 0 && adminValidation.valid,
      hotelErrors,
      adminErrors: adminValidation.errors,
      totalErrors:
        Object.keys(hotelErrors).length +
        Object.keys(adminValidation.errors).length,
    };
  }, [formData, getAdminValidationStatus]);

  // ✅ NEW: Form step navigation
  const nextStep = useCallback(() => {
    setFormStep((prev) => Math.min(prev + 1, hotelFormConfig.sections.length));
  }, []);

  const prevStep = useCallback(() => {
    setFormStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step) => {
    setFormStep(Math.max(1, Math.min(step, hotelFormConfig.sections.length)));
  }, []);

  // ✅ NEW: Save draft functionality
  const saveDraft = useCallback(() => {
    const draftData = {
      formData,
      admin: { ...admin, password: "" }, // Don't save password
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("hotelFormDraft", JSON.stringify(draftData));
    setLastSaved(new Date());
    toast.success("Draft saved successfully", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  }, [formData, admin]);

  // ✅ NEW: Load draft functionality
  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem("hotelFormDraft");
      if (saved) {
        const draftData = JSON.parse(saved);
        setFormData(draftData.formData || getDefaultFormData());
        setAdmin((prev) => ({
          ...prev,
          ...draftData.admin,
          password: "", // Always require password re-entry
        }));
        toast.success("Draft loaded successfully", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
        return true;
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      toast.error("Error loading draft", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    return false;
  }, [getDefaultFormData]);

  // ✅ NEW: Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem("hotelFormDraft");
    toast.success("Draft cleared", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  }, []);

  // ✅ NEW: Check if draft exists
  const hasDraft = useCallback(() => {
    return !!localStorage.getItem("hotelFormDraft");
  }, []);

  return {
    // State
    formData,
    admin,
    loading,
    submitting,
    searching,
    errors,
    touched,
    formStep,
    lastSaved,
    adminSearchHistory,

    // Actions
    setFormData: updateFormData,
    updateAdmin,
    searchAdmin,
    debouncedSearchAdmin,
    createNewAdmin,
    submitHotelWithAdmin,
    resetForm,

    // Form navigation
    nextStep,
    prevStep,
    goToStep,

    // Draft management
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,

    // Validation functions
    getAdminValidationStatus,
    getFormValidationStatus,
    validateField,
    validateForm,

    // Utilities
    adminExists: admin.isExisting,
    canSubmit: !submitting && !loading && !searching,
    hasErrors: Object.keys(errors).length > 0,
    isFormComplete: getFormValidationStatus().isFormValid,
    currentSection: hotelFormConfig.sections[formStep - 1],
    totalSections: hotelFormConfig.sections.length,
    progress: (formStep / hotelFormConfig.sections.length) * 100,

    // Permissions
    canCreateHotel: isSuperAdmin(),
    currentUser,
  };
};

export default useHotel;

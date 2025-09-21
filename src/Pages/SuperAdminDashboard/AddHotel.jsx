// src/Pages/SuperAdmin/AddHotelWithAdmins.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Building2,
  Users,
  Plus,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  UserPlus,
  Search,
} from "lucide-react";

// Import hooks and contexts
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { useSuperAdmin } from "../../hooks/useSuperAdmin";
import { useAdmin } from "../../hooks/useAdmin";

import HotelFormModal from "../../components/FormModals/HotelFormModal";
import { Spinner } from "atoms";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import PageTitle from "../../atoms/PageTitle";

function AddHotelWithAdmins() {
  // Add debugging state
  const [debugInfo, setDebugInfo] = useState({});
  const [initializationTimeout, setInitializationTimeout] = useState(false);

  // Context hooks with error handling
  const authContext = useAuth();
  const hotelContext = useHotelContext();
  const superAdminContext = useSuperAdmin();

  // Debug contexts
  useEffect(() => {
    console.log("AddHotelWithAdmins - Auth Context:", authContext);
    console.log("AddHotelWithAdmins - Hotel Context:", hotelContext);
    console.log("AddHotelWithAdmins - SuperAdmin Context:", superAdminContext);

    setDebugInfo({
      authLoaded: !!authContext,
      hotelContextLoaded: !!hotelContext,
      superAdminLoaded: !!superAdminContext,
      currentUser: authContext?.currentUser?.uid || "No user",
      isSuperAdmin: authContext?.isSuperAdmin?.() || false,
    });
  }, [authContext, hotelContext, superAdminContext]);

  // Add initialization timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authContext || !hotelContext || !superAdminContext) {
        console.warn("Initialization timeout - contexts not loaded");
        setInitializationTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [authContext, hotelContext, superAdminContext]);

  // Safely extract values with fallbacks
  const currentUser = authContext?.currentUser;
  const isSuperAdmin = authContext?.isSuperAdmin || (() => false);
  const refreshHotels =
    hotelContext?.refreshHotels || (() => Promise.resolve());

  // SuperAdmin hook with error handling
  const superAdminHook = useMemo(() => {
    if (!superAdminContext) {
      return {
        // Hotel creation
        createHotelWithAdmin: async () => ({
          success: false,
          error: "SuperAdmin context not loaded",
        }),
        searchAdminByEmail: async () => [],
        createNewAdmin: async () => ({
          success: false,
          error: "SuperAdmin context not loaded",
        }),

        // State management
        loading: false,
        submitting: false,
        searching: false,
        error: "SuperAdmin context not available",
        connectionStatus: "error",
        lastAction: null,

        // Admin search results
        searchResults: [],
        selectedAdmin: null,

        // Actions
        clearSearchResults: () => {},
        selectAdmin: () => {},
        refreshData: () => Promise.resolve(),

        // Computed values
        canCreateHotel: false,
        hasPermissions: false,
      };
    }
    return superAdminContext;
  }, [superAdminContext]);

  // Extract values from superAdmin hook
  const {
    createHotelWithAdmin,
    searchAdminByEmail,
    createNewAdmin,
    loading,
    submitting,
    searching,
    error,
    connectionStatus,
    lastAction,
    searchResults,
    selectedAdmin,
    clearSearchResults,
    selectAdmin,
    refreshData,
    canCreateHotel,
    hasPermissions,
  } = superAdminHook;

  // Permission check
  const hasPermission = useMemo(() => {
    try {
      const superAdmin = isSuperAdmin();
      const permissions = hasPermissions;
      const canCreate = canCreateHotel;
      console.log("AddHotelWithAdmins Permission check:", {
        superAdmin,
        permissions,
        canCreate,
        result: superAdmin && permissions && canCreate,
      });
      return superAdmin && permissions && canCreate;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }, [isSuperAdmin, hasPermissions, canCreateHotel]);

  // Hotel form state
  const [hotelName, setHotelName] = useState("");
  const [showModal, setShowModal] = useState(true);

  // Hotel data state with validation
  const [hotelData, setHotelData] = useState({
    // Basic information
    category: "",
    contact: "",
    description: "",

    // Location details
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",

    // Business details
    website: "",
    email: "",
    avgCostForTwo: "",

    // Legal documents
    gstNumber: "",
    fssaiNumber: "",

    // Additional Firestore fields
    businessName: "",
    businessType: "restaurant",
    cuisineTypes: [],
    operatingHours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "22:00", closed: false },
      saturday: { open: "09:00", close: "22:00", closed: false },
      sunday: { open: "09:00", close: "22:00", closed: false },
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
    features: [],
    paymentMethods: [],
    taxRate: 0.18,
    serviceCharge: 0,
    deliveryRadius: 5,
    minOrderAmount: 0,
  });

  // Admin form state
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "admin",
    permissions: {
      canManageOrders: true,
      canManageMenu: true,
      canViewAnalytics: true,
      canManageUsers: false,
    },
  });

  // Search state
  const [searchEmail, setSearchEmail] = useState("");
  const [adminExists, setAdminExists] = useState(false);

  // Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>Connecting...</span>
        </div>
      );
    } else if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
        </div>
      );
    } else if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>Connected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <CheckCircle size={16} />
        <span>Ready</span>
      </div>
    );
  };

  // Handle hotel data changes
  const handleHotelDataChange = useCallback((field, value) => {
    setHotelData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle admin data changes
  const handleAdminDataChange = useCallback((field, value) => {
    setAdminData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Validation functions
  const validateContact = useCallback((contact) => {
    return /^\d{10}$/.test(contact);
  }, []);

  const validateEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const validatePincode = useCallback((pincode) => {
    return /^\d{6}$/.test(pincode);
  }, []);

  const validateGST = useCallback((gst) => {
    return (
      !gst ||
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)
    );
  }, []);

  // Hotel validation status
  const getHotelValidationStatus = useCallback(() => {
    try {
      const required = {
        hotelName: !!hotelName.trim(),
        businessName: !!hotelData.businessName.trim(),
        category: !!hotelData.category,
        contact: !!hotelData.contact && validateContact(hotelData.contact),
        email: !!hotelData.email && validateEmail(hotelData.email),
        address: !!hotelData.address.trim(),
        city: !!hotelData.city.trim(),
        district: !!hotelData.district.trim(),
        state: !!hotelData.state.trim(),
        pincode: !!hotelData.pincode && validatePincode(hotelData.pincode),
        gst: validateGST(hotelData.gstNumber),
      };

      const isValid = Object.values(required).every(Boolean);
      const missingFields = Object.keys(required).filter(
        (key) => !required[key]
      );

      return {
        isValid,
        missingFields,
        required,
      };
    } catch (error) {
      console.error("Error validating hotel data:", error);
      return {
        isValid: false,
        missingFields: ["validation_error"],
        required: {},
      };
    }
  }, [
    hotelName,
    hotelData,
    validateContact,
    validateEmail,
    validatePincode,
    validateGST,
  ]);

  // Admin validation status
  const getAdminValidationStatus = useCallback(() => {
    try {
      if (adminExists && selectedAdmin) {
        return {
          isValid: true,
          useExisting: true,
          admin: selectedAdmin,
        };
      }

      const required = {
        firstName: !!adminData.firstName.trim(),
        lastName: !!adminData.lastName.trim(),
        email: !!adminData.email && validateEmail(adminData.email),
        phone: !!adminData.phone && validateContact(adminData.phone),
      };

      const isValid = Object.values(required).every(Boolean);
      const missingFields = Object.keys(required).filter(
        (key) => !required[key]
      );

      return {
        isValid,
        useExisting: false,
        missingFields,
        required,
      };
    } catch (error) {
      console.error("Error validating admin data:", error);
      return {
        isValid: false,
        useExisting: false,
        missingFields: ["validation_error"],
        required: {},
      };
    }
  }, [adminExists, selectedAdmin, adminData, validateEmail, validateContact]);

  // Form validation status
  const getFormValidationStatus = useCallback(() => {
    try {
      const hotelValidation = getHotelValidationStatus();
      const adminValidation = getAdminValidationStatus();

      return {
        isFormValid: hotelValidation.isValid && adminValidation.isValid,
        hotelValid: hotelValidation.isValid,
        adminValid: adminValidation.isValid,
        hotelErrors: hotelValidation.missingFields,
        adminErrors: adminValidation.missingFields,
      };
    } catch (error) {
      console.error("Error validating form:", error);
      return {
        isFormValid: false,
        hotelValid: false,
        adminValid: false,
        hotelErrors: ["validation_error"],
        adminErrors: ["validation_error"],
      };
    }
  }, [getHotelValidationStatus, getAdminValidationStatus]);

  // Handle admin search
  const handleSearchAdmin = useCallback(async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email to search");
      return;
    }

    if (!validateEmail(searchEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const results = await searchAdminByEmail(searchEmail);

      if (results && results.length > 0) {
        setAdminExists(true);
        selectAdmin(results[0]);
        toast.success("Admin found! Using existing admin.");
      } else {
        setAdminExists(false);
        clearSearchResults();
        // Pre-fill admin data with search email
        setAdminData((prev) => ({
          ...prev,
          email: searchEmail,
        }));
        toast.info("Admin not found. Create a new admin with this email.");
      }
    } catch (error) {
      console.error("Error searching admin:", error);
      toast.error("Error searching for admin. Please try again.");
    }
  }, [
    searchEmail,
    validateEmail,
    searchAdminByEmail,
    selectAdmin,
    clearSearchResults,
  ]);

  // Handle create new admin
  const handleCreateNewAdmin = useCallback(() => {
    setAdminExists(false);
    clearSearchResults();
    setAdminData((prev) => ({
      ...prev,
      email: searchEmail,
    }));
    toast.info("Creating new admin account");
  }, [searchEmail, clearSearchResults]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      const validationStatus = getFormValidationStatus();

      if (!validationStatus.isFormValid) {
        const errors = [
          ...validationStatus.hotelErrors.map(
            (field) => `Hotel ${field} is required`
          ),
          ...validationStatus.adminErrors.map(
            (field) => `Admin ${field} is required`
          ),
        ];
        toast.error(`Please fix the following errors:\n${errors.join("\n")}`);
        return;
      }

      const hotelPayload = {
        ...hotelData,
        name: hotelName.trim(),
        businessName: hotelData.businessName.trim(),
        createdBy: currentUser?.uid,
        createdAt: new Date(),
        isActive: true,
        status: "active",
      };

      const adminPayload =
        adminExists && selectedAdmin
          ? selectedAdmin
          : {
              ...adminData,
              createdBy: currentUser?.uid,
              createdAt: new Date(),
              isActive: true,
              role: adminData.role,
            };

      const result = await createHotelWithAdmin(
        hotelPayload,
        adminPayload,
        adminExists
      );

      if (result.success) {
        // Refresh hotels list
        await refreshHotels();

        // Reset form
        handleReset();

        toast.success(`Hotel "${hotelName}" created successfully!`);
        setShowModal(false);
      } else {
        throw new Error(result.error || "Failed to create hotel");
      }
    } catch (error) {
      console.error("Error creating hotel:", error);
      toast.error(`Error creating hotel: ${error.message}`);
    }
  }, [
    getFormValidationStatus,
    hotelData,
    hotelName,
    adminData,
    adminExists,
    selectedAdmin,
    currentUser,
    createHotelWithAdmin,
    refreshHotels,
  ]);

  // Reset form
  const handleReset = useCallback(() => {
    setHotelName("");
    setHotelData({
      category: "",
      contact: "",
      description: "",
      address: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      website: "",
      email: "",
      avgCostForTwo: "",
      gstNumber: "",
      fssaiNumber: "",
      businessName: "",
      businessType: "restaurant",
      cuisineTypes: [],
      operatingHours: {
        monday: { open: "09:00", close: "22:00", closed: false },
        tuesday: { open: "09:00", close: "22:00", closed: false },
        wednesday: { open: "09:00", close: "22:00", closed: false },
        thursday: { open: "09:00", close: "22:00", closed: false },
        friday: { open: "09:00", close: "22:00", closed: false },
        saturday: { open: "09:00", close: "22:00", closed: false },
        sunday: { open: "09:00", close: "22:00", closed: false },
      },
      socialMedia: {
        facebook: "",
        instagram: "",
        twitter: "",
      },
      features: [],
      paymentMethods: [],
      taxRate: 0.18,
      serviceCharge: 0,
      deliveryRadius: 5,
      minOrderAmount: 0,
    });
    setAdminData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "admin",
      permissions: {
        canManageOrders: true,
        canManageMenu: true,
        canViewAnalytics: true,
        canManageUsers: false,
      },
    });
    setSearchEmail("");
    setAdminExists(false);
    clearSearchResults();
  }, [clearSearchResults]);

  // Debug info display (remove in production)
  const DebugInfo = () => (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-sm">
      <h4 className="font-bold mb-2">Debug Info:</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      <div className="mt-2">
        <p>Loading: {loading ? "true" : "false"}</p>
        <p>Submitting: {submitting ? "true" : "false"}</p>
        <p>Connection: {connectionStatus}</p>
        <p>Has Permission: {hasPermission ? "true" : "false"}</p>
        <p>Can Create Hotel: {canCreateHotel ? "true" : "false"}</p>
        <p>
          Initialization Timeout: {initializationTimeout ? "true" : "false"}
        </p>
      </div>
    </div>
  );

  const showDebug = process.env.NODE_ENV === "development";

  // Handle initialization timeout
  if (initializationTimeout && !authContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Initialization Timeout
          </h3>
          <p className="text-gray-600 mb-4">
            The application is taking longer than expected to load. This might
            be due to network issues or authentication problems.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Permission check UI
  if (!hasPermission && !loading && authContext) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showDebug && <DebugInfo />}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600">
              You don't have super admin permissions to create hotels.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !authContext) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showDebug && <DebugInfo />}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading super admin panel...</p>
            {initializationTimeout && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  Loading is taking longer than expected.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Reload Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50">
        {showDebug && <DebugInfo />}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              error={error}
              onRetry={refreshData}
              title="Super Admin Panel Error"
              showRetryButton={true}
            />
            <div className="mt-4 text-center">
              <ConnectionStatusIndicator />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showDebug && <DebugInfo />}

      {/* Header with status */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle
              pageTitle="Create Hotel with Admin"
              className="text-2xl font-bold text-gray-900"
              description="Add a new hotel and assign an admin"
            />
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatusIndicator />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 size={16} />
              <span>Super Admin Panel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Form Modal */}
      <HotelFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        // Hotel data
        hotelName={hotelName}
        hotelData={hotelData}
        onHotelNameChange={setHotelName}
        onHotelDataChange={handleHotelDataChange}
        // Admin data
        adminData={adminData}
        onAdminDataChange={handleAdminDataChange}
        searchEmail={searchEmail}
        onSearchEmailChange={setSearchEmail}
        // Admin search
        onSearchAdmin={handleSearchAdmin}
        onCreateNewAdmin={handleCreateNewAdmin}
        searchResults={searchResults || []}
        selectedAdmin={selectedAdmin}
        adminExists={adminExists}
        // Form submission
        onSubmit={handleSubmit}
        onReset={handleReset}
        // State
        submitting={submitting}
        searching={searching}
        // Validation
        getAdminValidationStatus={getAdminValidationStatus}
        getHotelValidationStatus={getHotelValidationStatus}
        getFormValidationStatus={getFormValidationStatus}
        // UI
        title="Create Hotel with Admin"
        submitButtonText="Create Hotel"
        // Enhanced props
        connectionStatus={connectionStatus}
        lastAction={lastAction}
      />

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default AddHotelWithAdmins;

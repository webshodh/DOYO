// src/components/modals/HotelFormModal.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Search,
  CheckCircle,
  UserPlus,
  User,
  AlertCircle,
  Save,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Loader,
  Eye,
  EyeOff,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { toast } from "react-toastify";

// Validation utilities
import {
  validateEmail,
  validateContact,
  validatePassword,
} from "../../validation/hotelValidation";
import { FormSection } from "utils/FormUtilityFunctions";
import { hotelFormConfig } from "Constants/ConfigForms/addHotelFormConfig";

const HotelFormModal = ({
  isOpen = true,
  onClose,
  editMode = false,
  editData = null,
  onSuccess,
}) => {
  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel, refreshHotels } = useHotelContext();

  // ✅ ENHANCED: State management with better structure
  const [formData, setFormData] = useState(() => {
    const defaultData = {};
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        defaultData[field.name] =
          editData?.[field.name] || field.defaultValue || "";
      });
    });
    return defaultData;
  });

  // Admin management state
  const [admin, setAdmin] = useState({
    email: editData?.adminEmail || "",
    name: editData?.adminName || "",
    contact: editData?.adminContact || "",
    password: "",
    isExisting: false,
    searched: false,
    existingHotels: [],
    uid: editData?.adminId || null,
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [progress, setProgress] = useState(0);

  // ✅ NEW: Load existing data for edit mode
  useEffect(() => {
    if (editMode && editData) {
      setFormData(editData);
      if (editData.adminEmail) {
        setAdmin((prev) => ({
          ...prev,
          email: editData.adminEmail,
          name: editData.adminName || "",
          contact: editData.adminContact || "",
          uid: editData.adminId,
          isExisting: true,
          searched: true,
        }));
      }
    }
  }, [editMode, editData]);

  // ✅ NEW: Real-time form validation
  const validateForm = useCallback(() => {
    const errors = {};

    // Validate hotel form
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required && !formData[field.name]?.toString().trim()) {
          errors[field.name] = `${field.label} is required`;
        }

        // Specific validations
        if (
          field.name === "email" &&
          formData[field.name] &&
          !validateEmail(formData[field.name])
        ) {
          errors[field.name] = "Invalid email format";
        }
        if (
          field.name === "phone" &&
          formData[field.name] &&
          !validateContact(formData[field.name])
        ) {
          errors[field.name] = "Invalid phone number";
        }
      });
    });

    // Validate admin data
    if (!admin.email || !validateEmail(admin.email)) {
      errors.adminEmail = "Valid admin email is required";
    }
    if (!admin.name?.trim()) {
      errors.adminName = "Admin name is required";
    }
    if (!admin.contact?.trim() || !validateContact(admin.contact)) {
      errors.adminContact = "Valid admin contact is required";
    }
    if (
      !admin.isExisting &&
      (!admin.password || !validatePassword(admin.password))
    ) {
      errors.adminPassword = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, admin]);

  // ✅ ENHANCED: Search admin with comprehensive Firestore integration
  const searchAdmin = useCallback(async () => {
    if (!admin.email || !validateEmail(admin.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSearching(true);

    try {
      // Search in admins collection
      const adminsRef = collection(db, "admins");
      const adminQuery = query(adminsRef, where("email", "==", admin.email));
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        // Admin exists
        const adminDoc = adminSnapshot.docs[0];
        const adminData = adminDoc.data();

        // Get existing hotels managed by this admin
        let existingHotels = [];
        if (adminData.managedHotels && adminData.managedHotels.length > 0) {
          const hotelsRef = collection(db, "hotels");
          const hotelsQuery = query(
            hotelsRef,
            where("adminId", "==", adminDoc.id)
          );
          const hotelsSnapshot = await getDocs(hotelsQuery);
          existingHotels = hotelsSnapshot.docs.map(
            (doc) => doc.data().businessName || doc.data().name
          );
        }

        setAdmin((prev) => ({
          ...prev,
          name:
            adminData.name ||
            adminData.firstName + " " + adminData.lastName ||
            "",
          contact: adminData.phone || adminData.contact || "",
          uid: adminDoc.id,
          isExisting: true,
          searched: true,
          existingHotels,
        }));

        toast.success("Admin found! They will be assigned to this hotel.");
      } else {
        // Admin doesn't exist - prepare for creation
        setAdmin((prev) => ({
          ...prev,
          isExisting: false,
          searched: true,
          uid: null,
          existingHotels: [],
        }));

        toast.info(
          "Admin not found. Please fill in details to create a new admin account."
        );
      }
    } catch (error) {
      console.error("Error searching admin:", error);
      toast.error("Error searching for admin. Please try again.");
    } finally {
      setSearching(false);
    }
  }, [admin.email]);

  // ✅ NEW: Create new admin with Firebase Auth and Firestore
  const createNewAdmin = useCallback(
    async (hotelId) => {
      if (!admin.email || !admin.password || !admin.name || !admin.contact) {
        throw new Error("All admin fields are required");
      }

      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          admin.email,
          admin.password
        );

        // Send email verification
        await sendEmailVerification(userCredential.user);

        // Create admin document in Firestore
        const adminData = {
          uid: userCredential.user.uid,
          email: admin.email,
          name: admin.name,
          firstName: admin.name.split(" ")[0],
          lastName: admin.name.split(" ").slice(1).join(" ") || "",
          phone: admin.contact,
          contact: admin.contact,
          role: "admin",
          isActive: true,
          managedHotels: [hotelId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser?.uid || "system",
          emailVerified: false,
          lastLogin: null,
          profileCompleted: true,
          permissions: {
            canManageMenu: true,
            canManageOrders: true,
            canManageStaff: true,
            canViewAnalytics: true,
            canManageSettings: true,
          },
        };

        await addDoc(collection(db, "admins"), adminData);

        toast.success("New admin account created successfully!");
        return userCredential.user.uid;
      } catch (error) {
        console.error("Error creating admin:", error);

        let errorMessage = "Failed to create admin account";
        if (error.code === "auth/email-already-in-use") {
          errorMessage = "Email is already in use by another account";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "Password is too weak";
        }

        throw new Error(errorMessage);
      }
    },
    [admin, currentUser]
  );

  // ✅ ENHANCED: Submit hotel with comprehensive Firestore integration
  const submitHotelWithAdmin = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fix the validation errors");
        return;
      }

      setSubmitting(true);
      setProgress(10);

      try {
        // Prepare hotel data
        const hotelData = {
          ...formData,
          hotelName: formData.businessName, // Backward compatibility
          adminEmail: admin.email,
          adminName: admin.name,
          adminContact: admin.contact,
          adminId: admin.uid,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser?.uid || "system",
          // ✅ NEW: Enhanced metadata
          metadata: {
            source: "admin_panel",
            version: "2.0",
            platform: "web",
          },
          // ✅ NEW: Default settings
          settings: {
            taxRate: parseFloat(formData.taxRate) || 0.18,
            serviceCharge: parseFloat(formData.serviceCharge) || 0.05,
            currency: "INR",
            timezone: "Asia/Kolkata",
            operatingHours: {
              monday: { open: "09:00", close: "22:00", closed: false },
              tuesday: { open: "09:00", close: "22:00", closed: false },
              wednesday: { open: "09:00", close: "22:00", closed: false },
              thursday: { open: "09:00", close: "22:00", closed: false },
              friday: { open: "09:00", close: "22:00", closed: false },
              saturday: { open: "09:00", close: "22:00", closed: false },
              sunday: { open: "09:00", close: "22:00", closed: false },
            },
          },
          // ✅ NEW: Analytics setup
          analytics: {
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            averageOrderValue: 0,
            createdAt: serverTimestamp(),
          },
        };

        setProgress(30);

        let hotelDocRef;
        if (editMode && editData?.id) {
          // Update existing hotel
          hotelDocRef = doc(db, "hotels", editData.id);
          await updateDoc(hotelDocRef, {
            ...hotelData,
            updatedAt: serverTimestamp(),
          });
          toast.success("Hotel updated successfully!");
        } else {
          // Create new hotel
          hotelDocRef = await addDoc(collection(db, "hotels"), hotelData);
          toast.success("Hotel created successfully!");
        }

        setProgress(60);

        // Handle admin creation or update
        if (!admin.isExisting && !editMode) {
          // Create new admin
          const newAdminUid = await createNewAdmin(hotelDocRef.id);

          // Update hotel with admin UID
          await updateDoc(hotelDocRef, {
            adminId: newAdminUid,
            updatedAt: serverTimestamp(),
          });
        } else if (admin.isExisting) {
          // Update existing admin's managed hotels
          const adminQuery = query(
            collection(db, "admins"),
            where("email", "==", admin.email)
          );
          const adminSnapshot = await getDocs(adminQuery);

          if (!adminSnapshot.empty) {
            const adminDocRef = adminSnapshot.docs[0].ref;
            const adminData = adminSnapshot.docs[0].data();

            const updatedManagedHotels = adminData.managedHotels || [];
            if (!updatedManagedHotels.includes(hotelDocRef.id)) {
              updatedManagedHotels.push(hotelDocRef.id);
            }

            await updateDoc(adminDocRef, {
              managedHotels: updatedManagedHotels,
              updatedAt: serverTimestamp(),
            });
          }
        }

        setProgress(90);

        // ✅ NEW: Create initial collections for the hotel
        if (!editMode) {
          const batch = writeBatch(db);

          // Create initial menu categories
          const defaultCategories = [
            "Starters",
            "Main Course",
            "Desserts",
            "Beverages",
          ];
          defaultCategories.forEach((category) => {
            const categoryRef = doc(collection(db, "categories"));
            batch.set(categoryRef, {
              name: category,
              hotelId: hotelDocRef.id,
              isActive: true,
              displayOrder: defaultCategories.indexOf(category),
              createdAt: serverTimestamp(),
            });
          });

          await batch.commit();
        }

        setProgress(100);

        // Refresh hotels list
        if (refreshHotels) {
          await refreshHotels();
        }

        // Call success callback
        if (onSuccess) {
          onSuccess({
            hotelId: editMode ? editData.id : hotelDocRef.id,
            hotelData,
            adminData: admin,
            isNew: !editMode,
          });
        }

        // Close modal
        handleClose();
      } catch (error) {
        console.error("Error submitting hotel:", error);
        toast.error(error.message || "Failed to save hotel. Please try again.");
      } finally {
        setSubmitting(false);
        setProgress(0);
      }
    },
    [
      formData,
      admin,
      validateForm,
      currentUser,
      editMode,
      editData,
      createNewAdmin,
      refreshHotels,
      onSuccess,
    ]
  );

  // ✅ ENHANCED: Reset and close handlers
  const handleClose = useCallback(() => {
    setFormData(() => {
      const defaultData = {};
      hotelFormConfig.sections.forEach((section) => {
        section.fields.forEach((field) => {
          defaultData[field.name] = field.defaultValue || "";
        });
      });
      return defaultData;
    });

    setAdmin({
      email: "",
      name: "",
      contact: "",
      password: "",
      isExisting: false,
      searched: false,
      existingHotels: [],
      uid: null,
    });

    setValidationErrors({});
    setProgress(0);
    onClose();
  }, [onClose]);

  // ✅ NEW: Memoized validation status
  const isFormValid = useMemo(() => {
    return validateForm();
  }, [validateForm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
              {/* ✅ ENHANCED: Header with progress */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {editMode ? "Edit Restaurant" : "Add Restaurant with Admin"}
                </h1>

                {/* Progress bar */}
                {submitting && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              <form onSubmit={submitHotelWithAdmin} className="space-y-8">
                {/* ✅ ENHANCED: Restaurant Information */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-white" />
                      <h2 className="text-xl font-semibold text-white">
                        Restaurant Information
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {hotelFormConfig.sections.map((section) => (
                        <FormSection
                          key={section.id}
                          section={section}
                          formData={formData}
                          onChange={setFormData}
                          disabled={submitting}
                          errors={validationErrors}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ✅ ENHANCED: Admin Search and Management */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-6 h-6 text-white" />
                      <h2 className="text-xl font-semibold text-white">
                        Admin Management
                      </h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* ✅ ENHANCED: Admin Email Search */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Search Admin by Email{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="email"
                            value={admin.email || ""}
                            onChange={(e) =>
                              setAdmin((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Enter admin email to search"
                            disabled={submitting}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                              validationErrors.adminEmail
                                ? "border-red-300 focus:border-red-500"
                                : admin.email?.trim() &&
                                  validateEmail(admin.email)
                                ? "border-green-300 focus:border-purple-500"
                                : "border-gray-300 focus:border-purple-500"
                            } ${
                              submitting
                                ? "bg-gray-100 cursor-not-allowed"
                                : "bg-white"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={searchAdmin}
                            disabled={
                              !admin.email?.trim() ||
                              !validateEmail(admin.email) ||
                              searching ||
                              submitting
                            }
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {searching ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Searching...</span>
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                              </>
                            )}
                          </button>
                        </div>
                        {validationErrors.adminEmail && (
                          <p className="text-red-500 text-sm font-medium">
                            {validationErrors.adminEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ✅ ENHANCED: Admin Details */}
                    {admin.email?.trim() &&
                      validateEmail(admin.email) &&
                      admin.searched && (
                        <div
                          className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                            admin.isExisting
                              ? "border-green-300 bg-green-50"
                              : "border-yellow-300 bg-yellow-50"
                          }`}
                        >
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  Admin Details
                                </h3>
                                {admin.isExisting ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Existing Admin Found
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    New Admin (Will be created)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 space-y-6">
                            {/* Status messages */}
                            {admin.isExisting && (
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-blue-600" />
                                  <p className="text-blue-800 font-medium">
                                    This admin already exists and will be
                                    assigned to this restaurant.
                                  </p>
                                </div>
                                {admin.existingHotels &&
                                  admin.existingHotels.length > 0 && (
                                    <p className="text-blue-700 text-sm">
                                      <strong>
                                        Currently managing restaurants:
                                      </strong>{" "}
                                      {admin.existingHotels.join(", ")}
                                    </p>
                                  )}
                              </div>
                            )}

                            {!admin.isExisting && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-center space-x-2">
                                  <UserPlus className="w-5 h-5 text-yellow-600" />
                                  <p className="text-yellow-800 font-medium">
                                    Admin with this email doesn't exist. Please
                                    fill in the details below to create a new
                                    admin.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Admin form fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Admin Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={admin.name || ""}
                                  onChange={(e) =>
                                    setAdmin((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter admin name"
                                  disabled={admin.isExisting || submitting}
                                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                                    validationErrors.adminName
                                      ? "border-red-300 focus:border-red-500"
                                      : "border-gray-300 focus:border-purple-500"
                                  } ${
                                    admin.isExisting || submitting
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : "bg-white"
                                  }`}
                                />
                                {validationErrors.adminName && (
                                  <p className="text-red-500 text-sm font-medium">
                                    {validationErrors.adminName}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Contact Number{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  value={admin.contact || ""}
                                  onChange={(e) =>
                                    setAdmin((prev) => ({
                                      ...prev,
                                      contact: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter 10-digit contact"
                                  maxLength="10"
                                  disabled={admin.isExisting || submitting}
                                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                                    validationErrors.adminContact
                                      ? "border-red-300 focus:border-red-500"
                                      : "border-gray-300 focus:border-purple-500"
                                  } ${
                                    admin.isExisting || submitting
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : "bg-white"
                                  }`}
                                />
                                {validationErrors.adminContact && (
                                  <p className="text-red-500 text-sm font-medium">
                                    {validationErrors.adminContact}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Password field for new admin */}
                            {!admin.isExisting && (
                              <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Password{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    value={admin.password || ""}
                                    onChange={(e) =>
                                      setAdmin((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter password (min 6 characters)"
                                    disabled={submitting}
                                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                                      validationErrors.adminPassword
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-gray-300 focus:border-purple-500"
                                    } ${
                                      submitting
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "bg-white"
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-gray-500 text-sm">
                                  Password must be at least 6 characters long
                                </p>
                                {validationErrors.adminPassword && (
                                  <p className="text-red-500 text-sm font-medium">
                                    {validationErrors.adminPassword}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* ✅ ENHANCED: Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>* Required fields</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !isFormValid}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>
                            {progress < 50
                              ? "Saving..."
                              : progress < 90
                              ? "Creating Admin..."
                              : "Finalizing..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>
                            {editMode
                              ? "Update Restaurant"
                              : "Create Restaurant"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ✅ ENHANCED: Progress Indicator */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
                  <div className="flex items-center justify-center space-x-8">
                    {hotelFormConfig.sections.map((section, index) => {
                      const sectionComplete = section.fields
                        .filter((field) => field.required)
                        .every((field) =>
                          formData[field.name]?.toString().trim()
                        );

                      return (
                        <div
                          key={section.id}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              sectionComplete ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              sectionComplete
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {section.title}
                          </span>
                        </div>
                      );
                    })}

                    {/* Admin section indicator */}
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          admin.searched &&
                          !Object.keys(validationErrors).some((key) =>
                            key.startsWith("admin")
                          )
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          admin.searched &&
                          !Object.keys(validationErrors).some((key) =>
                            key.startsWith("admin")
                          )
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        Admin
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelFormModal;

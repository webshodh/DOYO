// src/components/AdminEditForm.jsx
import React, { useState, useCallback, useMemo } from "react";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { toast } from "react-toastify";
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

// ✅ NEW: Import context for better integration
import { useAuth } from "../../context/AuthContext";

const AdminEditForm = ({ admin, onClose, onSuccess }) => {
  // ✅ NEW: Use auth context for current user info
  const { currentUser, isSuperAdmin } = useAuth();

  // ✅ ENHANCED: Form state with validation
  const [formData, setFormData] = useState({
    firstName: admin.firstName || admin.name?.split(" ")[0] || "",
    lastName: admin.lastName || admin.name?.split(" ").slice(1).join(" ") || "",
    displayName: admin.displayName || "",
    email: admin.email || "",
    phone: admin.phone || admin.contact || "",
    role: admin.role || "admin",
    isActive: admin.isActive !== false,
    permissions: admin.permissions || {
      canManageOrders: true,
      canManageMenu: true,
      canViewAnalytics: true,
      canManageUsers: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("connected");

  console.log("Editing admin:", admin);
  console.log("Admin ID:", admin.id);

  // ✅ NEW: Enhanced validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ✅ ENHANCED: Handle input changes with validation
  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  // ✅ NEW: Handle permission changes
  const handlePermissionChange = useCallback((permission, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  }, []);

  // ✅ ENHANCED: Handle form submission with Firestore
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fix the validation errors");
        return;
      }

      setLoading(true);
      setConnectionStatus("connecting");

      try {
        // ✅ FIRESTORE: Use doc reference instead of ref
        const adminDocRef = doc(db, "admins", admin.id);

        // ✅ ENHANCED: Prepare update data with better structure
        const updateData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`, // Derived field
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          permissions: formData.permissions,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid || "system",
        };

        // Only add displayName if it has a value
        if (formData.displayName.trim()) {
          updateData.displayName = formData.displayName.trim();
        }

        console.log("Updating admin with ID:", admin.id);
        console.log("Firestore path:", `admins/${admin.id}`);
        console.log("Update data:", updateData);

        // ✅ FIRESTORE: Use updateDoc instead of update
        await updateDoc(adminDocRef, updateData);

        setConnectionStatus("connected");
        toast.success("Admin updated successfully!");

        // Call success callback with updated data
        if (onSuccess) {
          onSuccess({
            ...admin,
            ...updateData,
            id: admin.id,
          });
        }

        onClose();
      } catch (error) {
        console.error("Error updating admin:", error);
        setConnectionStatus("error");

        let errorMessage = "Error updating admin: ";
        if (error.code === "permission-denied") {
          errorMessage += "You don't have permission to update this admin.";
        } else if (error.code === "not-found") {
          errorMessage += "Admin not found.";
        } else {
          errorMessage += error.message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [validateForm, formData, admin.id, currentUser, onSuccess, onClose]
  );

  // ✅ NEW: Get managed hotels display
  const managedHotelsDisplay = useMemo(() => {
    if (admin.managedHotels && admin.managedHotels.length > 0) {
      return admin.managedHotels.join(", ");
    }
    if (admin.hotels && Object.keys(admin.hotels).length > 0) {
      return Object.values(admin.hotels)
        .map((hotel) => hotel.hotelName || hotel.name)
        .filter(Boolean)
        .join(", ");
    }
    return "No hotels assigned";
  }, [admin.managedHotels, admin.hotels]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-xs">
          <Wifi className="animate-pulse" size={12} />
          <span>Saving...</span>
        </div>
      );
    } else if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-xs">
          <WifiOff size={12} />
          <span>Connection Error</span>
        </div>
      );
    } else if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle size={12} />
          <span>Connected</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
        {/* ✅ ENHANCED: Header with status */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Edit Admin Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update administrator information and permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatusIndicator />
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ✅ ENHANCED: Personal Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-gray-600" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional display name"
              />
              <p className="text-gray-500 text-xs mt-1">
                This will be shown instead of the full name if provided
              </p>
            </div>
          </div>

          {/* ✅ ENHANCED: Contact Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={18} className="text-gray-600" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="admin@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="1234567890"
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ NEW: Role and Status Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-gray-600" />
              Role & Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={!isSuperAdmin()} // Only super admin can change roles
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  {isSuperAdmin() && (
                    <option value="superadmin">Super Admin</option>
                  )}
                </select>
                {!isSuperAdmin() && (
                  <p className="text-gray-500 text-xs mt-1">
                    Only super admins can modify roles
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3 pt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Active Account
                    </span>
                  </label>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Inactive accounts cannot login to the system
                </p>
              </div>
            </div>
          </div>

          {/* ✅ NEW: Permissions Section */}
          {(isSuperAdmin() || admin.role !== "superadmin") && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={18} className="text-gray-600" />
                Permissions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: "canManageOrders",
                    label: "Manage Orders",
                    desc: "View and update order status",
                  },
                  {
                    key: "canManageMenu",
                    label: "Manage Menu",
                    desc: "Add, edit, and remove menu items",
                  },
                  {
                    key: "canViewAnalytics",
                    label: "View Analytics",
                    desc: "Access reports and analytics",
                  },
                  {
                    key: "canManageUsers",
                    label: "Manage Users",
                    desc: "Add and manage staff members",
                  },
                ].map((permission) => (
                  <div
                    key={permission.key}
                    className="flex items-start space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions[permission.key] || false}
                      onChange={(e) =>
                        handlePermissionChange(permission.key, e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {permission.label}
                      </label>
                      <p className="text-xs text-gray-500">{permission.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ ENHANCED: Hotel Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-gray-600" />
              Assigned Hotels
            </h3>

            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <div className="text-sm text-gray-700 mb-2">
                {managedHotelsDisplay}
              </div>
              <p className="text-xs text-gray-500">
                Hotel assignments are managed separately through the hotel
                management interface
              </p>
            </div>
          </div>

          {/* ✅ ENHANCED: Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditForm;

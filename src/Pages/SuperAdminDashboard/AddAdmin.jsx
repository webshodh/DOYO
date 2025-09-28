import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import {
  Edit3,
  Plus,
  AlertCircle,
  Loader,
  CheckCircle,
  User,
  Shield,
  Key,
  Info,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  Settings,
  Eye,
  EyeOff,
  ArrowLeft,
  Save,
  RotateCcw,
  Users,
  Database,
} from "lucide-react";

// Mock data - replace with your actual data
const adminFormFields = {
  personalInfo: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter full name",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "admin@example.com",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      required: false,
      placeholder: "+1 (555) 123-4567",
    },
  ],
  authCredentials: [
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      placeholder: "Create secure password",
      description: "Minimum 8 characters with letters, numbers, and symbols",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
      placeholder: "Confirm your password",
    },
  ],
  rolePermissions: [
    {
      name: "role",
      label: "Admin Role",
      type: "select",
      required: true,
      placeholder: "Select admin role",
      options: [
        { value: "super_admin", label: "Super Administrator" },
        { value: "admin", label: "Administrator" },
        { value: "manager", label: "Manager" },
        { value: "staff", label: "Staff" },
      ],
    },
    {
      name: "linkedHotelId",
      label: "Linked Hotel",
      type: "select",
      required: true,
      placeholder: "Select hotel to manage",
    },
    {
      name: "canManageUsers",
      label: "Can Manage Users",
      type: "checkbox",
      description: "Allow user management operations",
    },
    {
      name: "canManageHotels",
      label: "Can Manage Hotels",
      type: "checkbox",
      description: "Allow hotel management operations",
    },
    {
      name: "canViewReports",
      label: "Can View Reports",
      type: "checkbox",
      description: "Allow access to analytics and reports",
    },
    {
      name: "canManageBookings",
      label: "Can Manage Bookings",
      type: "checkbox",
      description: "Allow booking management operations",
    },
  ],
  additionalInfo: [
    {
      name: "department",
      label: "Department",
      type: "text",
      required: false,
      placeholder: "e.g., Operations, IT, Management",
    },
    {
      name: "notes",
      label: "Additional Notes",
      type: "textarea",
      required: false,
      placeholder: "Any additional information about this admin...",
      rows: 3,
    },
  ],
};

const adminFormSections = [
  {
    fields: "personalInfo",
    title: "Personal Information",
    description: "Basic contact and identification details",
    icon: "User",
  },
  {
    fields: "authCredentials",
    title: "Authentication",
    description: "Login credentials and security settings",
    icon: "Key",
  },
  {
    fields: "rolePermissions",
    title: "Role & Permissions",
    description: "Access level and permission settings",
    icon: "Shield",
  },
  {
    fields: "additionalInfo",
    title: "Additional Information",
    description: "Optional details and notes",
    icon: "Info",
  },
];

const adminFormInitialValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "",
  linkedHotelId: "",
  department: "",
  notes: "",
  canManageUsers: false,
  canManageHotels: false,
  canViewReports: false,
  canManageBookings: false,
};

const rolePermissionPresets = {
  super_admin: {
    canManageUsers: true,
    canManageHotels: true,
    canViewReports: true,
    canManageBookings: true,
  },
  admin: {
    canManageUsers: true,
    canManageHotels: false,
    canViewReports: true,
    canManageBookings: true,
  },
  manager: {
    canManageUsers: false,
    canManageHotels: false,
    canViewReports: true,
    canManageBookings: true,
  },
  staff: {
    canManageUsers: false,
    canManageHotels: false,
    canViewReports: false,
    canManageBookings: true,
  },
};

// Mock available hotels
const availableHotels = [
  {
    hotelId: "hotel1",
    businessName: "Grand Plaza Hotel",
    hotelName: "Grand Plaza",
  },
  {
    hotelId: "hotel2",
    businessName: "Ocean View Resort",
    hotelName: "Ocean View",
  },
  {
    hotelId: "hotel3",
    businessName: "Mountain Lodge",
    hotelName: "Mountain Lodge",
  },
];

// Validation function
const validateForm = (formData, isEditMode = false) => {
  const errors = {};

  if (!formData.fullName?.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!isEditMode) {
    if (!formData.password?.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword?.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  }

  if (!formData.role?.trim()) {
    errors.role = "Please select a role";
  }

  if (!formData.linkedHotelId?.trim()) {
    errors.linkedHotelId = "Please select a hotel";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Enhanced FormSection Component
const AdminFormSection = memo(
  ({
    section,
    formData,
    onChange,
    errors,
    disabled,
    isExpanded,
    onToggle,
    firstFieldRef,
    availableHotels = [],
    isEditMode = false,
  }) => {
    const [showPasswords, setShowPasswords] = useState({
      password: false,
      confirmPassword: false,
    });

    const getSectionIcon = (iconName) => {
      const icons = {
        User: User,
        Shield: Shield,
        Key: Key,
        Info: Info,
      };
      const IconComponent = icons[iconName] || Info;
      return <IconComponent size={20} />;
    };

    const togglePasswordVisibility = (fieldName) => {
      setShowPasswords((prev) => ({
        ...prev,
        [fieldName]: !prev[fieldName],
      }));
    };

    const renderField = useCallback(
      (field) => {
        if (
          isEditMode &&
          (field.name === "password" || field.name === "confirmPassword")
        ) {
          return null;
        }

        const value = formData[field.name];
        const error = errors[field.name];
        const hasError = Boolean(error);

        const baseClasses = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          hasError
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

        let fieldOptions = field.options || [];
        if (field.name === "linkedHotelId") {
          fieldOptions = availableHotels.map((hotel) => ({
            value: hotel.hotelId,
            label: hotel.businessName || hotel.hotelName,
          }));
        }

        switch (field.type) {
          case "text":
          case "email":
          case "tel":
          case "date":
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {field.label}
                  {field.required && !isEditMode && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  {field.type === "email" && (
                    <Mail
                      size={18}
                      className="absolute left-4 top-3.5 text-gray-400"
                    />
                  )}
                  {field.type === "tel" && (
                    <Phone
                      size={18}
                      className="absolute left-4 top-3.5 text-gray-400"
                    />
                  )}
                  <input
                    ref={field.name === "fullName" ? firstFieldRef : null}
                    type={field.type}
                    name={field.name}
                    value={value || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`${baseClasses} ${
                      field.type === "email" || field.type === "tel"
                        ? "pl-12"
                        : ""
                    }`}
                    disabled={disabled}
                    required={field.required && !isEditMode}
                  />
                </div>
                {field.description && (
                  <p className="text-xs text-gray-600">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "password":
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  <Key
                    size={18}
                    className="absolute left-4 top-3.5 text-gray-400"
                  />
                  <input
                    type={showPasswords[field.name] ? "text" : "password"}
                    name={field.name}
                    value={value || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`${baseClasses} pl-12 pr-12`}
                    disabled={disabled}
                    required={field.required}
                    autoComplete={
                      field.name === "password"
                        ? "new-password"
                        : "new-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.name)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPasswords[field.name] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {field.description && (
                  <p className="text-xs text-gray-600">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "textarea":
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <textarea
                  name={field.name}
                  value={value || ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  className={baseClasses}
                  disabled={disabled}
                  required={field.required}
                />
                {field.description && (
                  <p className="text-xs text-gray-600">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "select":
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  {field.name === "linkedHotelId" && (
                    <Building2
                      size={18}
                      className="absolute left-4 top-3.5 text-gray-400"
                    />
                  )}
                  {field.name === "role" && (
                    <Shield
                      size={18}
                      className="absolute left-4 top-3.5 text-gray-400"
                    />
                  )}
                  <select
                    name={field.name}
                    value={value || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className={`${baseClasses} ${
                      field.name === "linkedHotelId" || field.name === "role"
                        ? "pl-12"
                        : ""
                    }`}
                    disabled={disabled}
                    required={field.required}
                  >
                    <option value="">
                      {field.placeholder || `Select ${field.label}`}
                    </option>
                    {fieldOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {field.description && (
                  <p className="text-xs text-gray-600">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "checkbox":
            return (
              <div key={field.name} className="space-y-1">
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={Boolean(value)}
                    onChange={(e) => onChange(field.name, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={disabled}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 cursor-pointer">
                      {field.label}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {field.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    {value ? (
                      <CheckCircle size={18} className="text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded"></div>
                    )}
                  </div>
                </div>
                {hasError && (
                  <p className="text-red-600 text-sm flex items-center ml-3">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          default:
            return null;
        }
      },
      [
        formData,
        onChange,
        errors,
        disabled,
        firstFieldRef,
        availableHotels,
        isEditMode,
        showPasswords,
      ]
    );

    const sectionFields = adminFormFields[section.fields] || [];
    const relevantFields = isEditMode
      ? sectionFields.filter(
          (field) =>
            field.name !== "password" && field.name !== "confirmPassword"
        )
      : sectionFields;

    const sectionErrorCount = relevantFields.filter(
      (field) => errors[field.name]
    ).length;

    const completedFields = relevantFields.filter((field) => {
      const value = formData[field.name];
      return value !== null && value !== undefined && value !== "";
    }).length;

    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <button
          type="button"
          onClick={() => onToggle(section.fields)}
          className={`w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors ${
            isExpanded ? "bg-blue-50 border-b border-gray-200" : ""
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-xl ${
                isExpanded ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {getSectionIcon(section.icon)}
            </div>
            <div>
              <h3
                className={`font-bold text-lg ${
                  isExpanded ? "text-blue-900" : "text-gray-900"
                }`}
              >
                {section.title}
                {isEditMode && section.fields === "authCredentials" && (
                  <span className="text-xs ml-2 px-3 py-1 bg-gray-200 text-gray-600 rounded-full">
                    Hidden in edit mode
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {section.description}
              </p>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                <span>
                  {completedFields}/{relevantFields.length} completed
                </span>
                {completedFields > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${
                            (completedFields / relevantFields.length) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {sectionErrorCount > 0 && (
              <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                {sectionErrorCount} error{sectionErrorCount !== 1 ? "s" : ""}
              </span>
            )}
            {sectionErrorCount === 0 &&
              completedFields === relevantFields.length &&
              relevantFields.length > 0 && (
                <CheckCircle size={20} className="text-green-600" />
              )}
            {isExpanded ? (
              <ChevronDown className="h-6 w-6 text-gray-400" />
            ) : (
              <ChevronRight className="h-6 w-6 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-6 bg-white">
            {isEditMode && section.fields === "authCredentials" ? (
              <div className="text-center py-12 text-gray-500">
                <Key size={48} className="mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-semibold mb-2">
                  Password fields are hidden
                </h4>
                <p className="text-sm max-w-md mx-auto">
                  Password fields are hidden when editing existing admins.
                  Password changes should be handled through a separate security
                  process.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sectionFields.map(renderField).filter(Boolean)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

// Role Preset Selector
const RolePresetSelector = memo(({ currentRole, onApplyPreset, disabled }) => {
  const [showPresets, setShowPresets] = useState(false);

  const handlePresetSelect = (role) => {
    const preset = rolePermissionPresets[role];
    if (preset) {
      onApplyPreset(preset);
    }
    setShowPresets(false);
  };

  if (!showPresets) {
    return (
      <button
        type="button"
        onClick={() => setShowPresets(true)}
        disabled={disabled}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
      >
        <Settings size={16} />
        Apply Role Permissions
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-700">
        Apply permissions for role:
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(rolePermissionPresets).map(([role, preset]) => (
          <button
            key={role}
            type="button"
            onClick={() => handlePresetSelect(role)}
            disabled={disabled}
            className={`p-3 text-left border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              role === currentRole
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="text-sm font-semibold">
              {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {Object.values(preset).filter(Boolean).length} permissions
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowPresets(false)}
        className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
      >
        Hide Presets
      </button>
    </div>
  );
});

// Main AddAdmin Page Component
const AddAdminPage = () => {
  const [formData, setFormData] = useState(adminFormInitialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true, // Start with first section expanded
  });
  const firstFieldRef = useRef(null);
  const isEditMode = false; // This would come from props/router in real app

  // Auto-apply role permissions when role changes
  useEffect(() => {
    if (formData.role && rolePermissionPresets[formData.role] && !isEditMode) {
      const rolePermissions = rolePermissionPresets[formData.role];
      setFormData((prev) => ({
        ...prev,
        ...rolePermissions,
      }));
    }
  }, [formData.role, isEditMode]);

  // Real-time validation
  useEffect(() => {
    if (isDirty) {
      const validation = validateForm(formData, isEditMode);
      setErrors(validation.errors);
    }
  }, [formData, isDirty, isEditMode]);

  // Check if form can be submitted
  const canSubmit = useMemo(() => {
    const validation = validateForm(formData, isEditMode);
    return validation.isValid && !isSubmitting && isDirty;
  }, [formData, isSubmitting, isDirty, isEditMode]);

  // Calculate form completion
  const formCompletion = useMemo(() => {
    const requiredFields = [];
    adminFormSections.forEach((section) => {
      const sectionFields = adminFormFields[section.fields] || [];
      sectionFields.forEach((field) => {
        if (
          field.required &&
          !(
            isEditMode &&
            (field.name === "password" || field.name === "confirmPassword")
          )
        ) {
          requiredFields.push(field.name);
        }
      });
    });

    const completedFields = requiredFields.filter((fieldName) => {
      const value = formData[fieldName];
      return value !== null && value !== undefined && value !== "";
    }).length;

    return requiredFields.length > 0
      ? Math.round((completedFields / requiredFields.length) * 100)
      : 0;
  }, [formData, isEditMode]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setIsDirty(true);
  }, []);

  const handleApplyRolePreset = useCallback((preset) => {
    setFormData((prev) => ({ ...prev, ...preset }));
    setIsDirty(true);
  }, []);

  const handleSectionToggle = useCallback((sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validation = validateForm(formData, isEditMode);
      setErrors(validation.errors);

      if (!validation.isValid) {
        // Expand sections with errors
        const sectionsWithErrors = {};
        adminFormSections.forEach((section) => {
          const sectionFields = adminFormFields[section.fields] || [];
          if (sectionFields.some((field) => validation.errors[field.name])) {
            sectionsWithErrors[section.fields] = true;
          }
        });
        setExpandedSections((prev) => ({ ...prev, ...sectionsWithErrors }));
        return;
      }

      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Admin created:", formData);
        // Reset form or navigate away
        alert("Admin created successfully!");
      } catch (err) {
        console.error("Error creating admin:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditMode]
  );

  const handleReset = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "Are you sure you want to reset all fields? All unsaved changes will be lost."
      );
      if (!confirmed) return;
    }
    setFormData(adminFormInitialValues);
    setErrors({});
    setIsDirty(false);
    setExpandedSections({ personalInfo: true });
  }, [isDirty]);

  const expandAllSections = useCallback(() => {
    const allExpanded = {};
    adminFormSections.forEach((section) => {
      allExpanded[section.fields] = true;
    });
    setExpandedSections(allExpanded);
  }, []);

  const collapseAllSections = useCallback(() => {
    setExpandedSections({ personalInfo: true });
  }, []);

  const selectedHotel = useMemo(() => {
    if (!formData.linkedHotelId) return null;
    return availableHotels.find(
      (hotel) => hotel.hotelId === formData.linkedHotelId
    );
  }, [formData.linkedHotelId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back to Admin List</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Create New Admin
                  </h1>
                  <p className="text-sm text-gray-600">
                    Set up a new admin user with appropriate roles and
                    permissions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">
                  Progress:
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
                      style={{ width: `${formCompletion}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 min-w-[45px]">
                    {formCompletion}%
                  </span>
                </div>
              </div>

              {selectedHotel && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Assigned to</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {selectedHotel.businessName}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar - Stats & Navigation */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={20} />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sections</span>
                  <span className="text-sm font-bold text-gray-900">
                    {adminFormSections.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-bold text-green-600">
                    {Object.values(expandedSections).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Errors</span>
                  <span className="text-sm font-bold text-red-600">
                    {Object.keys(errors).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Available Hotels
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {availableHotels.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users size={20} />
                  Sections
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={expandAllSections}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={collapseAllSections}
                    className="text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {adminFormSections.map((section) => {
                  const sectionFields = adminFormFields[section.fields] || [];
                  const relevantFields = isEditMode
                    ? sectionFields.filter(
                        (field) =>
                          field.name !== "password" &&
                          field.name !== "confirmPassword"
                      )
                    : sectionFields;
                  const sectionErrorCount = relevantFields.filter(
                    (field) => errors[field.name]
                  ).length;
                  const completedFields = relevantFields.filter((field) => {
                    const value = formData[field.name];
                    return (
                      value !== null && value !== undefined && value !== ""
                    );
                  }).length;

                  return (
                    <button
                      key={section.fields}
                      type="button"
                      onClick={() => handleSectionToggle(section.fields)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        expandedSections[section.fields]
                          ? "bg-blue-50 border-2 border-blue-200"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            expandedSections[section.fields]
                              ? "bg-blue-100"
                              : "bg-gray-200"
                          }`}
                        >
                          {section.icon === "User" && <User size={16} />}
                          {section.icon === "Key" && <Key size={16} />}
                          {section.icon === "Shield" && <Shield size={16} />}
                          {section.icon === "Info" && <Info size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {section.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                            <span>
                              {completedFields}/{relevantFields.length}
                            </span>
                            {sectionErrorCount > 0 && (
                              <span className="text-red-600 font-medium">
                                {sectionErrorCount} error
                                {sectionErrorCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        {sectionErrorCount === 0 &&
                          completedFields === relevantFields.length &&
                          relevantFields.length > 0 && (
                            <CheckCircle size={16} className="text-green-600" />
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Preset Selector */}
            {formData.role && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings size={20} />
                  Role Presets
                </h3>
                <RolePresetSelector
                  currentRole={formData.role}
                  onApplyPreset={handleApplyRolePreset}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="xl:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Sections */}
              <div className="space-y-6">
                {adminFormSections.map((section) => (
                  <AdminFormSection
                    key={section.fields}
                    section={section}
                    formData={formData}
                    onChange={handleFieldChange}
                    errors={errors}
                    disabled={isSubmitting}
                    isExpanded={expandedSections[section.fields] || false}
                    onToggle={handleSectionToggle}
                    firstFieldRef={
                      section.fields === "personalInfo" ? firstFieldRef : null
                    }
                    availableHotels={availableHotels}
                    isEditMode={isEditMode}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Form Status */}
                    {Object.keys(errors).length > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">
                          {Object.keys(errors).length} error
                          {Object.keys(errors).length !== 1 ? "s" : ""} to fix
                        </span>
                      </div>
                    )}

                    {isDirty && Object.keys(errors).length === 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">
                          Ready to submit
                        </span>
                      </div>
                    )}

                    {formData.role && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Shield size={18} />
                        <span className="text-sm font-medium">
                          Role:{" "}
                          <strong>
                            {formData.role.replace("_", " ").toUpperCase()}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isSubmitting || !isDirty}
                      className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw size={18} />
                      Reset Form
                    </button>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`flex items-center justify-center gap-3 px-8 py-3 text-sm font-bold rounded-xl transition-all duration-200 min-w-[160px] ${
                        canSubmit
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          : "bg-gray-400 text-white cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Creating Admin...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          <span>Create Admin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdminPage;

// Fixed Admin Form Modal - components/FormModals/AdminFormModal.jsx
// Key changes: Fixed password field rendering and validation

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
} from "lucide-react";
import Modal from "../Modal";
import {
  adminFormFields,
  adminFormInitialValues,
  adminFormSections,
  getAdminValidationSchema,
  rolePermissionPresets,
} from "../../Constants/ConfigForms/adminFormFields";

// Helper to initialize form data using your structure
const getInitialFormData = (editData = null) => {
  if (editData) {
    // For edit mode, exclude password fields
    const { password, confirmPassword, ...editDataWithoutPasswords } = editData;
    return {
      ...adminFormInitialValues,
      ...editDataWithoutPasswords,
    };
  }
  return adminFormInitialValues;
};

// FIXED: Dynamic validation with proper edit mode handling
const validateDynamicForm = (formData, isEditMode = false) => {
  const validationSchema = getAdminValidationSchema(isEditMode);
  const errors = validationSchema.validate(formData);
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Enhanced FormSection Component for Admin
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
    isEditMode = false, // ADDED: Pass edit mode to section
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
        // FIXED: Skip password fields in edit mode
        if (
          isEditMode &&
          (field.name === "password" || field.name === "confirmPassword")
        ) {
          return null;
        }

        const value = formData[field.name];
        const error = errors[field.name];
        const hasError = Boolean(error);

        const baseClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          hasError ? "border-red-500 bg-red-50" : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

        // Special handling for linkedHotelId field
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
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && !isEditMode && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  {field.type === "email" && (
                    <Mail
                      size={16}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                  )}
                  {field.type === "tel" && (
                    <Phone
                      size={16}
                      className="absolute left-3 top-2.5 text-gray-400"
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
                        ? "pl-10"
                        : ""
                    }`}
                    disabled={disabled}
                    required={field.required && !isEditMode}
                    autoFocus={field.name === "fullName"}
                  />
                </div>
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-xs flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "password":
            // FIXED: Proper password field rendering
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  <Key
                    size={16}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                  <input
                    type={showPasswords[field.name] ? "text" : "password"}
                    name={field.name}
                    value={value || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`${baseClasses} pl-10 pr-10`}
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
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPasswords[field.name] ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-xs flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "textarea":
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
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
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-xs flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "select":
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  {field.name === "linkedHotelId" && (
                    <Building2
                      size={16}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                  )}
                  {field.name === "role" && (
                    <Shield
                      size={16}
                      className="absolute left-3 top-2.5 text-gray-400"
                    />
                  )}
                  <select
                    name={field.name}
                    value={value || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className={`${baseClasses} ${
                      field.name === "linkedHotelId" || field.name === "role"
                        ? "pl-10"
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
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
                {hasError && (
                  <p className="text-red-600 text-xs flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {error}
                  </p>
                )}
              </div>
            );

          case "checkbox":
            return (
              <div key={field.name} className="space-y-1">
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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
                      <p className="text-xs text-gray-500 mt-1">
                        {field.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    {value ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded"></div>
                    )}
                  </div>
                </div>
                {hasError && (
                  <p className="text-red-600 text-xs flex items-center ml-3">
                    <AlertCircle size={12} className="mr-1" />
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
    // FIXED: Filter out password fields for edit mode when counting
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
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => onToggle(section.fields)}
          className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${
            isExpanded ? "bg-blue-50 border-b border-gray-200" : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isExpanded ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {getSectionIcon(section.icon)}
            </div>
            <div>
              <h3
                className={`font-semibold ${
                  isExpanded ? "text-blue-900" : "text-gray-900"
                }`}
              >
                {section.title}
                {isEditMode && section.fields === "authCredentials" && (
                  <span className="text-xs ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded">
                    Hidden in edit mode
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600">{section.description}</p>
              <div className="text-xs text-gray-500 mt-1">
                {completedFields}/{relevantFields.length} completed
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {sectionErrorCount > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {sectionErrorCount} error{sectionErrorCount !== 1 ? "s" : ""}
              </span>
            )}
            {sectionErrorCount === 0 &&
              completedFields === relevantFields.length &&
              relevantFields.length > 0 && (
                <CheckCircle size={16} className="text-green-600" />
              )}
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-6 bg-white">
            {/* FIXED: Show message when section is hidden in edit mode */}
            {isEditMode && section.fields === "authCredentials" ? (
              <div className="text-center py-8 text-gray-500">
                <Key size={32} className="mx-auto mb-4 text-gray-400" />
                <p className="text-sm">
                  Password fields are hidden when editing existing admins.
                  <br />
                  Password changes should be handled through a separate security
                  process.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sectionFields.map(renderField).filter(Boolean)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

// Role Permission Preset Selector
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
        className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50 flex items-center gap-1"
      >
        <Settings size={14} />
        Apply Role Permissions
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        Apply permissions for role:
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(rolePermissionPresets).map(([role, preset]) => (
          <button
            key={role}
            type="button"
            onClick={() => handlePresetSelect(role)}
            disabled={disabled}
            className={`p-2 text-left border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              role === currentRole
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="text-sm font-medium">
              {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
            </div>
            <div className="text-xs text-gray-600">
              {Object.values(preset).filter(Boolean).length} permissions
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowPresets(false)}
        className="text-xs text-gray-600 hover:text-gray-800"
      >
        Hide Presets
      </button>
    </div>
  );
});

// Main AdminFormModal component
const AdminFormModal = memo(
  ({
    show = false,
    onClose,
    onSubmit,
    editAdmin = null,
    title,
    submitText,
    cancelText = "Cancel",
    submitting = false,
    hotelId = null,
    availableHotels = [],
    className = "",
    modalProps = {},
    ...rest
  }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const firstFieldRef = useRef(null);
    const isEditMode = Boolean(editAdmin);

    // Initialize form data
    useEffect(() => {
      if (show) {
        let initialData = getInitialFormData(editAdmin);

        // If hotelId is provided and we're creating new admin, auto-assign it
        if (hotelId && !editAdmin) {
          initialData = { ...initialData, linkedHotelId: hotelId };
        }

        setFormData(initialData);
        setErrors({});
        setIsDirty(false);

        // Expand first section by default, but skip auth section in edit mode
        const firstSection = isEditMode
          ? adminFormSections.find((s) => s.fields !== "authCredentials") ||
            adminFormSections[0]
          : adminFormSections[0];

        const initialExpanded = { [firstSection.fields]: true };
        setExpandedSections(initialExpanded);

        // Focus first field after modal opens
        setTimeout(() => {
          firstFieldRef.current?.focus();
        }, 200);
      } else {
        // Reset everything when modal closes
        setFormData({});
        setErrors({});
        setIsDirty(false);
        setExpandedSections({});
      }
    }, [show, editAdmin, hotelId, isEditMode]);

    // Auto-apply role permissions when role changes (only for new admins)
    useEffect(() => {
      if (
        formData.role &&
        rolePermissionPresets[formData.role] &&
        !isEditMode
      ) {
        const rolePermissions = rolePermissionPresets[formData.role];
        setFormData((prev) => ({
          ...prev,
          ...rolePermissions,
        }));
      }
    }, [formData.role, isEditMode]);

    // Real-time validation with edit mode consideration
    useEffect(() => {
      if (isDirty) {
        const validation = validateDynamicForm(formData, isEditMode);
        setErrors(validation.errors);
      }
    }, [formData, isDirty, isEditMode]);

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
      const validation = validateDynamicForm(formData, isEditMode);
      return validation.isValid && !isSubmitting && !submitting && isDirty;
    }, [formData, isSubmitting, submitting, isDirty, isEditMode]);

    // Calculate form completion (exclude password fields in edit mode)
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

    // Get selected hotel info
    const selectedHotel = useMemo(() => {
      if (!formData.linkedHotelId) return null;
      return availableHotels.find(
        (hotel) => hotel.hotelId === formData.linkedHotelId
      );
    }, [formData.linkedHotelId, availableHotels]);

    const handleFieldChange = useCallback((fieldName, value) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      setIsDirty(true);
    }, []);

    const handleApplyRolePreset = useCallback((preset) => {
      setFormData((prev) => ({
        ...prev,
        ...preset,
      }));
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

        const validation = validateDynamicForm(formData, isEditMode);
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
          // Scroll to first error
          setTimeout(() => {
            const firstError = document.querySelector(".text-red-600");
            firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
          return;
        }

        setIsSubmitting(true);
        try {
          const result = await onSubmit(formData, editAdmin?.adminId);
          if (result !== false) {
            handleClose();
          }
        } catch (err) {
          console.error("Error submitting admin form:", err);
        } finally {
          setIsSubmitting(false);
        }
      },
      [formData, editAdmin, onSubmit, isEditMode]
    );

    const handleClose = useCallback(() => {
      if (isSubmitting) return;
      if (isDirty) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        );
        if (!confirmed) return;
      }
      setFormData({});
      setErrors({});
      setIsDirty(false);
      setExpandedSections({});
      onClose();
    }, [isSubmitting, isDirty, onClose]);

    const expandAllSections = useCallback(() => {
      const allExpanded = {};
      adminFormSections.forEach((section) => {
        allExpanded[section.fields] = true;
      });
      setExpandedSections(allExpanded);
    }, []);

    const collapseAllSections = useCallback(() => {
      setExpandedSections({});
    }, []);

    if (!show) return null;

    return (
      <Modal
        isOpen={show}
        onClose={handleClose}
        title={title || (isEditMode ? "Edit Admin Details" : "Add New Admin")}
        size="4xl"
        closeOnBackdrop={!isDirty}
        className="max-h-[95vh]"
        {...modalProps}
      >
        <div className={`${className}`} {...rest}>
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  isEditMode ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {isEditMode ? (
                  <Edit3 className="w-6 h-6 text-blue-600" />
                ) : (
                  <Plus className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? "Update Admin Details" : "Create New Admin"}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600">
                    {isEditMode
                      ? "Modify the admin information and permissions"
                      : "Set up a new admin user with appropriate roles and permissions"}
                  </p>
                  {!isEditMode && (
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium text-gray-500">
                        Progress:
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${formCompletion}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {formCompletion}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {selectedHotel && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Assigned to</div>
                  <div className="text-sm font-medium text-blue-600">
                    {selectedHotel.businessName}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={expandAllSections}
                  className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAllSections}
                  className="text-xs text-gray-600 hover:text-gray-800 underline transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* Role Preset Selector - only show for new admins */}
          {!isEditMode && formData.role && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <RolePresetSelector
                currentRole={formData.role}
                onApplyPreset={handleApplyRolePreset}
                disabled={isSubmitting || submitting}
              />
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-h-[calc(95vh-280px)]"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {adminFormSections.map((section) => (
                <AdminFormSection
                  key={section.fields}
                  section={section}
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                  disabled={isSubmitting || submitting}
                  isExpanded={expandedSections[section.fields] || false}
                  onToggle={handleSectionToggle}
                  firstFieldRef={
                    section.fields === adminFormSections[0].fields
                      ? firstFieldRef
                      : null
                  }
                  availableHotels={availableHotels}
                  isEditMode={isEditMode}
                />
              ))}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {Object.keys(errors).length > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle size={16} />
                    <span>
                      {Object.keys(errors).length} error
                      {Object.keys(errors).length !== 1 ? "s" : ""} to fix
                    </span>
                  </div>
                )}
                {isDirty && Object.keys(errors).length === 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={16} />
                    <span>Ready to submit</span>
                  </div>
                )}
                {formData.role && (
                  <div className="flex items-center gap-1">
                    <Shield size={14} className="text-blue-500" />
                    <span>
                      Role: <strong>{formData.role.replace("_", " ")}</strong>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-sm font-semibold rounded-lg border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold rounded-lg transition-all duration-200 min-w-[140px]
                    ${
                      canSubmit
                        ? isEditMode
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                          : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <Edit3 className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>
                        {submitText || (isEditMode ? "Update" : "Create")} Admin
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
);

AdminFormModal.displayName = "AdminFormModal";
export default AdminFormModal;

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import {
  User,
  Plus,
  Edit3,
  AlertTriangle,
  Info,
  Loader,
  Save,
  Upload,
  X,
  Eye,
  EyeOff,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  Camera,
  Hash,
  CheckCircle,
  XCircle,
  Lock,
  UserCheck,
} from "lucide-react";
import Modal from "../Modal";
import {
  validateField,
  validateCaptainForm,
} from "../../validation/captainValidation";

// Form field component
const FormField = memo(
  ({ label, error, required = false, children, helpText, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
);

FormField.displayName = "FormField";

// Validation Input Component
const ValidationInput = memo(
  ({
    value,
    onChange,
    error,
    placeholder,
    disabled,
    maxLength,
    type = "text",
    icon: Icon,
    autoFocus = false,
    className = "",
    ...props
  }) => {
    const [showPassword, setShowPassword] = useState(false);
    const hasValue = value && value.toString().trim();
    const hasError = Boolean(error);
    const isValid = hasValue && !hasError;
    const isPassword = type === "password";

    return (
      <div className="relative">
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Icon className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            autoFocus={autoFocus}
            className={`
              w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60
              ${Icon ? "pl-12" : ""}
              ${isPassword ? "pr-12" : ""}
              ${
                hasError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                  : isValid
                  ? "border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
              }
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
        </div>

        {/* Validation icon */}
        {!isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {disabled && (
              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
            )}
            {!disabled && isValid && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {!disabled && hasError && (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  }
);

ValidationInput.displayName = "ValidationInput";

// TextArea Component
const ValidationTextArea = memo(
  ({
    value,
    onChange,
    error,
    placeholder,
    disabled,
    maxLength = 200,
    rows = 3,
    className = "",
    ...props
  }) => {
    const hasValue = value && value.trim();
    const hasError = Boolean(error);
    const isValid = hasValue && !hasError;

    return (
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={`
            w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60
            ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                : isValid
                ? "border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
            }
            ${className}
          `}
          {...props}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {value.length}/{maxLength}
        </div>
      </div>
    );
  }
);

ValidationTextArea.displayName = "ValidationTextArea";

// Photo Upload Component
const PhotoUpload = memo(
  ({ currentPhoto, onPhotoChange, error, disabled, className = "" }) => {
    const [preview, setPreview] = useState(currentPhoto);
    const fileInputRef = useRef(null);

    const handleFileSelect = useCallback(
      (e) => {
        const file = e.target.files[0];
        if (file) {
          // Create preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target.result);
          };
          reader.readAsDataURL(file);

          onPhotoChange(file);
        }
      },
      [onPhotoChange]
    );

    const handleRemovePhoto = useCallback(() => {
      setPreview(null);
      onPhotoChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, [onPhotoChange]);

    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-center">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Captain preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={disabled}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {preview ? "Change Photo" : "Upload Photo"}
          </button>
        </div>

        {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      </div>
    );
  }
);

PhotoUpload.displayName = "PhotoUpload";

// Captain Info Display
const CaptainInfo = memo(({ captain }) => {
  if (!captain) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <h4 className="text-sm font-semibold text-blue-900">
            Captain Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600">ID:</span>
              </div>
              <span className="font-mono text-gray-800">
                {captain.captainId}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600">Created:</span>
              </div>
              <span className="font-mono text-gray-800">
                {new Date(captain.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600">Status:</span>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  captain.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {captain.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CaptainInfo.displayName = "CaptainInfo";

// Action Buttons Component
const ActionButtons = memo(
  ({
    isEditMode,
    canSubmit,
    isSubmitting,
    onCancel,
    submitText,
    cancelText = "Cancel",
  }) => (
    <div className="flex flex-col sm:flex-row gap-3 pt-6">
      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className={`
          flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg
          transition-all duration-200 transform hover:scale-105 active:scale-95
          disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            canSubmit && !isSubmitting
              ? isEditMode
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm"
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>{isEditMode ? "Updating..." : "Adding..."}</span>
          </>
        ) : (
          <>
            {isEditMode ? (
              <Edit3 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>
              {submitText || (isEditMode ? "Update Captain" : "Add Captain")}
            </span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className={`
          px-6 py-3 text-sm font-semibold rounded-lg border-2 transition-all duration-200
          transform hover:scale-105 active:scale-95 disabled:transform-none
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          ${
            isSubmitting
              ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white"
          }
        `}
      >
        {cancelText}
      </button>
    </div>
  )
);

ActionButtons.displayName = "ActionButtons";

// Main Captain Form Modal
const CaptainFormModal = memo(
  ({
    show = false,
    onClose,
    onSubmit,
    editCaptain = null,
    existingCaptains = [],
    title,
    submitText,
    cancelText = "Cancel",
    submitting = false,
    className = "",
    modalProps = {},
    ...rest
  }) => {
    // Form state
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      adharNo: "",
      panNo: "",
      experience: "",
      address: "",
      photoFile: null,
      password: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const isEditMode = Boolean(editCaptain);

    // Auto-generate title if not provided
    const modalTitle = useMemo(() => {
      if (title) return title;
      return isEditMode ? "Edit Captain" : "Add Captain";
    }, [title, isEditMode]);

    // Reset form when modal opens/closes or captain changes
    useEffect(() => {
      if (show) {
        const initialData = editCaptain
          ? {
              firstName: editCaptain.firstName || "",
              lastName: editCaptain.lastName || "",
              email: editCaptain.email || "",
              mobileNo: editCaptain.mobileNo || "",
              adharNo: editCaptain.adharNo || "",
              panNo: editCaptain.panNo || "",
              experience: editCaptain.experience?.toString() || "",
              address: editCaptain.address || "",
              photoFile: null,
              existingPhotoUrl: editCaptain.photoUrl || null,
              password: "", // Never populate password field for security
            }
          : {
              firstName: "",
              lastName: "",
              email: "",
              mobileNo: "",
              adharNo: "",
              panNo: "",
              experience: "",
              address: "",
              photoFile: null,
              password: "",
            };

        setFormData(initialData);
        setErrors({});
        setIsDirty(false);
      }
    }, [show, editCaptain]);

    // Handle field changes with real-time validation
    const handleFieldChange = useCallback(
      (fieldName, value) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
        setIsDirty(true);

        // Real-time validation
        if (value !== "" || fieldName === "experience") {
          const validation = validateField(
            fieldName,
            value,
            existingCaptains,
            editCaptain?.captainId
          );
          setErrors((prev) => ({
            ...prev,
            [fieldName]: validation.isValid ? null : validation.error,
          }));
        } else {
          setErrors((prev) => ({ ...prev, [fieldName]: null }));
        }
      },
      [existingCaptains, editCaptain]
    );

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "mobileNo",
        "adharNo",
        "panNo",
        "experience",
        "address",
      ];

      // For new captains, password is required
      if (!isEditMode) {
        requiredFields.push("password");
      }

      const hasAllRequired = requiredFields.every((field) =>
        formData[field]?.toString().trim()
      );
      const hasNoErrors = Object.values(errors).every((error) => !error);

      return hasAllRequired && hasNoErrors && !isSubmitting && !submitting;
    }, [formData, errors, isSubmitting, submitting, isEditMode]);

    // Handle form submission
    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();

        // Final validation
        const validation = validateCaptainForm(
          formData,
          existingCaptains,
          editCaptain?.captainId
        );
        if (!validation.isValid) {
          setErrors(validation.errors);
          return;
        }

        setIsSubmitting(true);

        try {
          const result = await onSubmit(formData, editCaptain?.captainId);
          if (result !== false) {
            onClose();
          }
        } catch (error) {
          console.error("Error submitting captain form:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      [formData, existingCaptains, editCaptain, onSubmit, onClose]
    );

    // Handle modal close
    const handleClose = useCallback(() => {
      if (isSubmitting) return;

      if (isDirty) {
        const shouldClose = window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        );
        if (!shouldClose) return;
      }

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        adharNo: "",
        panNo: "",
        experience: "",
        address: "",
        photoFile: null,
        password: "",
      });
      setErrors({});
      setIsDirty(false);
      onClose();
    }, [isSubmitting, isDirty, onClose]);

    if (!show) return null;

    return (
      <Modal
        isOpen={show}
        onClose={handleClose}
        title={modalTitle}
        size="lg"
        closeOnBackdrop={!isDirty}
        {...modalProps}
      >
        <form
          onSubmit={handleSubmit}
          className={`p-6 space-y-6 max-h-[80vh] overflow-y-auto ${className}`}
          {...rest}
        >
          {/* Header */}
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
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Update Captain Details" : "Add New Captain"}
              </h3>
              <p className="text-sm text-gray-600">
                {isEditMode
                  ? "Modify the captain information below"
                  : "Fill in the details for the new captain"}
              </p>
            </div>
          </div>

          {/* Photo Upload */}
          <PhotoUpload
            currentPhoto={editCaptain?.photoUrl}
            onPhotoChange={(file) => handleFieldChange("photoFile", file)}
            error={errors.photo}
            disabled={isSubmitting || submitting}
          />

          {/* Login Credentials Section */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-900">
                Login Credentials
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email (used as login credential) */}
              <FormField
                label="Email Address"
                error={errors.email}
                required
                helpText="Used for captain login"
              >
                <ValidationInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  error={errors.email}
                  placeholder="captain@example.com"
                  disabled={isSubmitting || submitting}
                  icon={Mail}
                />
              </FormField>

              {/* Password */}
              <FormField
                label="Password"
                error={errors.password}
                required={!isEditMode}
                helpText={
                  isEditMode
                    ? "Leave blank to keep current password"
                    : "Minimum 6 characters"
                }
              >
                <ValidationInput
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  error={errors.password}
                  placeholder={
                    isEditMode
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                  disabled={isSubmitting || submitting}
                  maxLength={50}
                  icon={Lock}
                />
              </FormField>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <FormField
              label="First Name"
              error={errors.firstName}
              required
              helpText="Enter the captain's first name"
            >
              <ValidationInput
                value={formData.firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                error={errors.firstName}
                placeholder="Enter first name"
                disabled={isSubmitting || submitting}
                maxLength={30}
                icon={User}
                autoFocus
              />
            </FormField>

            {/* Last Name */}
            <FormField
              label="Last Name"
              error={errors.lastName}
              required
              helpText="Enter the captain's last name"
            >
              <ValidationInput
                value={formData.lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                error={errors.lastName}
                placeholder="Enter last name"
                disabled={isSubmitting || submitting}
                maxLength={30}
                icon={User}
              />
            </FormField>

            {/* Mobile Number */}
            <FormField
              label="Mobile Number"
              error={errors.mobileNo}
              required
              helpText="10-digit mobile number"
            >
              <ValidationInput
                type="tel"
                value={formData.mobileNo}
                onChange={(e) => handleFieldChange("mobileNo", e.target.value)}
                error={errors.mobileNo}
                placeholder="9876543210"
                disabled={isSubmitting || submitting}
                maxLength={10}
                icon={Phone}
              />
            </FormField>

            {/* Aadhar Number */}
            <FormField
              label="Aadhar Number"
              error={errors.adharNo}
              required
              helpText="12-digit Aadhar number"
            >
              <ValidationInput
                type="text"
                value={formData.adharNo}
                onChange={(e) => handleFieldChange("adharNo", e.target.value)}
                error={errors.adharNo}
                placeholder="123456789012"
                disabled={isSubmitting || submitting}
                maxLength={12}
                icon={CreditCard}
              />
            </FormField>

            {/* PAN Number */}
            <FormField
              label="PAN Number"
              error={errors.panNo}
              required
              helpText="10-character PAN (e.g., ABCDE1234F)"
            >
              <ValidationInput
                type="text"
                value={formData.panNo}
                onChange={(e) =>
                  handleFieldChange("panNo", e.target.value.toUpperCase())
                }
                error={errors.panNo}
                placeholder="ABCDE1234F"
                disabled={isSubmitting || submitting}
                maxLength={10}
                icon={CreditCard}
              />
            </FormField>

            {/* Experience */}
            <FormField
              label="Experience (Years)"
              error={errors.experience}
              required
              helpText="Years of work experience"
            >
              <ValidationInput
                type="number"
                value={formData.experience}
                onChange={(e) =>
                  handleFieldChange("experience", e.target.value)
                }
                error={errors.experience}
                placeholder="0"
                disabled={isSubmitting || submitting}
                min="0"
                max="99"
                icon={Calendar}
              />
            </FormField>
          </div>

          {/* Address */}
          <FormField
            label="Address"
            error={errors.address}
            required
            helpText="Complete residential address"
          >
            <ValidationTextArea
              value={formData.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              error={errors.address}
              placeholder="Enter complete address including city, state, and pincode"
              disabled={isSubmitting || submitting}
              maxLength={200}
              rows={3}
            />
          </FormField>

          {/* Captain Info (Edit Mode) */}
          {isEditMode && <CaptainInfo captain={editCaptain} />}

          {/* Action Buttons */}
          <ActionButtons
            isEditMode={isEditMode}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting || submitting}
            onCancel={handleClose}
            submitText={submitText}
            cancelText={cancelText}
          />
        </form>
      </Modal>
    );
  }
);

CaptainFormModal.displayName = "CaptainFormModal";

export default CaptainFormModal;

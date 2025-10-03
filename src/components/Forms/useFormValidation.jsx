// =============================================================================
// CORRECTED REUSABLE FORM COMPONENTS - All Major Issues Fixed
// =============================================================================

import React, {
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
  useEffect,
} from "react";
import {
  AlertTriangle,
  Info,
  Loader,
  Save,
  Upload,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Camera,
  Plus,
  Edit3,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  Lock,
  Tag,
  Hash,
} from "lucide-react";

// =============================================================================
// 1. UTILITY FUNCTIONS - FIXED
// =============================================================================

export const findFieldInConfig = (config, fieldName) => {
  if (!config || !config.sections || !fieldName) return null;

  for (const section of config.sections) {
    if (section.fields) {
      const field = section.fields.find((f) => f && f.name === fieldName);
      if (field) return field;
    }
  }
  return null;
};

export const getAllFieldsFromConfig = (config) => {
  if (!config || !config.sections) return [];

  const fields = [];
  config.sections.forEach((section) => {
    if (section.fields && Array.isArray(section.fields)) {
      section.fields.forEach((field) => {
        if (field && field.name) {
          fields.push(field);
        }
      });
    }
  });
  return fields;
};

export const getDefaultFormData = (config) => {
  if (!config || !config.sections) return {};

  const defaultData = {};
  config.sections.forEach((section) => {
    if (section.fields && Array.isArray(section.fields)) {
      section.fields.forEach((field) => {
        if (!field || !field.name) return;

        if (field.type === "checkbox") {
          defaultData[field.name] =
            field.defaultValue !== undefined ? field.defaultValue : false;
        } else if (
          field.type === "object" &&
          field.name === "nutritionalInfo"
        ) {
          defaultData[field.name] = {
            protein: "",
            carbs: "",
            fat: "",
            fiber: "",
          };
        } else if (field.name === "allergens") {
          defaultData[field.name] = [];
        } else if (field.type === "file" || field.type === "photo") {
          defaultData[field.name] = null;
        } else {
          defaultData[field.name] = field.defaultValue || "";
        }
      });
    }
  });
  return defaultData;
};

// Get icon component by name
export const getIcon = (iconName) => {
  const icons = {
    User,
    Mail,
    Phone,
    CreditCard,
    MapPin,
    Calendar,
    Camera,
    Lock,
    Edit3,
    Plus,
    Tag,
    Hash,
  };
  return icons[iconName] || User;
};

// =============================================================================
// 2. VALIDATION HOOK - FIXED
// =============================================================================

export const useFormValidation = (config, existingData = [], editId = null) => {
  const [errors, setErrors] = useState({});

  const validateField = useCallback(
    (fieldName, value, formData = {}) => {
      const field = findFieldInConfig(config, fieldName);
      if (!field) return null;

      // Skip validation if field is conditionally hidden
      if (field.conditionalField && field.hideWhen && field.dependsOn) {
        const dependentValue = formData[field.dependsOn];
        if (dependentValue && field.hideWhen.includes(dependentValue)) {
          return null;
        }
      }

      // Required field validation
      if (field.required || field.validation === "required") {
        if (
          value === null ||
          value === undefined ||
          (typeof value === "string" && !value.trim()) ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return `${field.label} is required`;
        }
      }

      // Skip other validations if field is empty (unless required)
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && !value.trim())
      ) {
        return null;
      }

      // Handle different validation types
      if (field.validation) {
        switch (field.validation) {
          case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return "Please enter a valid email address";
            }
            break;

          case "phone":
            const phoneRegex = /^[6-9]\d{9}$/;
            const cleanPhone = value.toString().replace(/\D/g, "");
            if (!phoneRegex.test(cleanPhone)) {
              return "Please enter a valid 10-digit phone number";
            }
            break;

          case "unique":
            if (existingData && Array.isArray(existingData)) {
              const isDuplicate = existingData.some(
                (item) =>
                  item &&
                  item[fieldName] &&
                  item[fieldName].toString().toLowerCase() ===
                    value.toString().toLowerCase() &&
                  item.id !== editId,
              );
              if (isDuplicate) {
                return `${field.label} already exists`;
              }
            }
            break;

          case "positiveNumber":
            const num = parseFloat(value);
            if (isNaN(num) || num <= 0) {
              return `${field.label} must be a positive number`;
            }
            break;

          case "percentage":
            const percent = parseFloat(value);
            if (isNaN(percent) || percent < 0 || percent > 100) {
              return "Enter a valid percentage (0-100)";
            }
            break;

          case "validFrom":
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const fromDate = new Date(value);
            if (fromDate < today) {
              return "Start date cannot be in the past";
            }
            break;

          case "validUntil":
            if (formData.validFrom && value) {
              const fromDate = new Date(formData.validFrom);
              const untilDate = new Date(value);
              if (untilDate <= fromDate) {
                return "End date must be after start date";
              }
            }
            break;

          case "discountValue":
            if (
              formData.offerType === "free_delivery" ||
              formData.offerType === "buy_one_get_one"
            ) {
              return null; // Not required for these types
            }
            const discountNum = parseFloat(value);
            if (isNaN(discountNum) || discountNum <= 0) {
              return "Discount value must be a positive number";
            }
            if (formData.offerType === "percentage" && discountNum > 100) {
              return "Percentage discount cannot exceed 100%";
            }
            break;

          case "minimumOrder":
            const minOrder = parseFloat(value);
            if (value && (isNaN(minOrder) || minOrder < 0)) {
              return "Minimum order amount must be a valid positive number";
            }
            break;

          default:
            // Custom validation function
            if (typeof field.validation === "function") {
              return field.validation(value, formData, field);
            }
            break;
        }
      }

      // Additional field-specific validations
      if (field.minLength && value.toString().length < field.minLength) {
        return `${field.label} must be at least ${field.minLength} characters`;
      }

      if (field.maxLength && value.toString().length > field.maxLength) {
        return `${field.label} cannot exceed ${field.maxLength} characters`;
      }

      if (field.min && parseFloat(value) < parseFloat(field.min)) {
        return `${field.label} must be at least ${field.min}`;
      }

      if (field.max && parseFloat(value) > parseFloat(field.max)) {
        return `${field.label} cannot exceed ${field.max}`;
      }

      return null;
    },
    [config, existingData, editId],
  );

  const validateForm = useCallback(
    (formData) => {
      const newErrors = {};
      const allFields = getAllFieldsFromConfig(config);

      allFields.forEach((field) => {
        if (!field || !field.name) return;

        // Skip conditional fields that are hidden
        if (field.conditionalField && field.hideWhen && field.dependsOn) {
          const dependentValue = formData[field.dependsOn];
          if (dependentValue && field.hideWhen.includes(dependentValue)) {
            return;
          }
        }

        const error = validateField(field.name, formData[field.name], formData);
        if (error) {
          newErrors[field.name] = error;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [validateField, config],
  );

  const clearError = useCallback((fieldName) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  const setError = useCallback((fieldName, error) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    setError,
    setErrors,
  };
};

// =============================================================================
// 3. UNIVERSAL INPUT COMPONENT - FIXED
// =============================================================================

export const UniversalInput = memo(
  ({
    field,
    value = "",
    onChange,
    error,
    disabled = false,
    autoFocus = false,
    className = "",
    externalOptions = {},
    formData = {},
    ...props
  }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const readerRef = useRef(null);

    // Cleanup file reader on unmount
    useEffect(() => {
      return () => {
        if (readerRef.current) {
          readerRef.current.abort();
        }
      };
    }, []);

    // Initialize preview for existing images
    useEffect(() => {
      if (field.type === "photo" && value) {
        if (typeof value === "string") {
          setPreview(value);
        } else if (value instanceof File) {
          const reader = new FileReader();
          readerRef.current = reader;
          reader.onload = (e) => setPreview(e.target.result);
          reader.readAsDataURL(value);
        }
      }
    }, [field.type, value]);

    const hasValue =
      value !== null && value !== undefined && value.toString().trim() !== "";
    const hasError = Boolean(error);
    const isValid = hasValue && !hasError;
    const isPassword = field.type === "password";

    // Dynamic props for different field types
    const getDynamicProps = () => {
      const baseProps = {
        placeholder: field.placeholder,
        max: field.max,
        min: field.min,
        step: field.step,
      };

      if (field.dynamicProps && field.name === "discountValue" && formData) {
        const isPercentage = formData.offerType === "percentage";
        return {
          ...baseProps,
          placeholder: isPercentage ? "10" : "100",
          max: isPercentage ? "100" : field.max,
        };
      }
      return baseProps;
    };

    const dynamicProps = getDynamicProps();
    const IconComponent = field.icon ? getIcon(field.icon) : null;

    // Base input classes
    const baseClassName = `
      w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60
      ${IconComponent ? "pl-12" : ""}
      ${isPassword || field.type === "file" ? "pr-12" : ""}
      ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
          : isValid
            ? "border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
      }
      ${className}
    `.trim();

    // Handle file upload for photo fields
    const handleFileSelect = useCallback(
      (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (
          field.accept &&
          !file.type.match(field.accept.replace(/\*/g, ".*"))
        ) {
          console.error("Invalid file type");
          return;
        }

        // Validate file size (default 5MB limit)
        const maxSize = field.maxSize || 5 * 1024 * 1024;
        if (file.size > maxSize) {
          console.error("File too large");
          return;
        }

        if (field.type === "photo") {
          const reader = new FileReader();
          readerRef.current = reader;
          reader.onload = (e) => setPreview(e.target.result);
          reader.onerror = () => console.error("Failed to read file");
          reader.readAsDataURL(file);
        }

        // Call onChange with proper event structure
        if (onChange) {
          onChange({
            target: {
              name: field.name,
              value: file,
              type: "file",
            },
          });
        }
      },
      [field.name, field.accept, field.maxSize, field.type, onChange],
    );

    // Handle change with transformations
    const handleChange = useCallback(
      (e) => {
        if (!onChange) return;

        let newValue = e.target.value;

        // Apply field transformations
        if (field.transform === "uppercase") {
          newValue = newValue.toUpperCase();
        } else if (field.transform === "lowercase") {
          newValue = newValue.toLowerCase();
        } else if (field.transform === "trim") {
          newValue = newValue.trim();
        }

        // Call onChange with proper event structure
        onChange({
          target: {
            name: field.name,
            value: newValue,
            type: e.target.type || "text",
          },
        });
      },
      [field.name, field.transform, onChange],
    );

    // Handle checkbox change
    const handleCheckboxChange = useCallback(
      (e) => {
        if (!onChange) return;

        onChange({
          target: {
            name: field.name,
            value: e.target.checked,
            type: "checkbox",
          },
        });
      },
      [field.name, onChange],
    );

    // Handle array changes (for multi-select, etc.)
    const handleArrayChange = useCallback(
      (newValue) => {
        if (!onChange) return;

        onChange({
          target: {
            name: field.name,
            value: newValue,
            type: "array",
          },
        });
      },
      [field.name, onChange],
    );

    // Clear file/photo
    const clearFile = useCallback(() => {
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onChange) {
        onChange({
          target: {
            name: field.name,
            value: null,
            type: "file",
          },
        });
      }
    }, [field.name, onChange]);

    // Render different input types
    const renderInput = () => {
      switch (field.type) {
        case "photo":
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
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
                  accept={field.accept || "image/*"}
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
            </div>
          );

        case "textarea":
          return (
            <div className="relative">
              <textarea
                name={field.name}
                value={value || ""}
                onChange={handleChange}
                placeholder={dynamicProps.placeholder}
                disabled={disabled}
                maxLength={field.maxLength}
                rows={field.rows || 3}
                className={baseClassName}
                autoFocus={autoFocus}
                {...props}
              />
              {field.maxLength && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
                  {(value || "").length}/{field.maxLength}
                </div>
              )}
            </div>
          );

        case "select":
          const options =
            field.options || externalOptions[field.optionsSource] || [];
          return (
            <div className="relative">
              {IconComponent && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconComponent className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <select
                name={field.name}
                value={value || ""}
                onChange={handleChange}
                disabled={disabled}
                className={baseClassName}
                autoFocus={autoFocus}
                {...props}
              >
                <option value="">
                  {field.placeholder || `Select ${field.label}`}
                </option>
                {options.map((option, index) => {
                  const optionValue = option.value ?? option.id ?? option;
                  const optionLabel = option.label ?? option.name ?? option;
                  return (
                    <option key={optionValue || index} value={optionValue}>
                      {optionLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          );

        case "checkbox":
          return (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name={field.name}
                checked={Boolean(value)}
                onChange={handleCheckboxChange}
                disabled={disabled}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:opacity-50"
                autoFocus={autoFocus}
              />
              <span className="ml-2 text-sm text-gray-700">{field.label}</span>
            </label>
          );

        case "radio":
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={handleChange}
                    disabled={disabled}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          );

        case "file":
          return (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                name={field.name}
                onChange={handleFileSelect}
                disabled={disabled}
                accept={field.accept}
                multiple={field.multiple}
                className={baseClassName}
                autoFocus={autoFocus}
                {...props}
              />
              <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          );

        case "number":
          return (
            <div className="relative">
              {IconComponent && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconComponent className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <input
                type="number"
                name={field.name}
                value={value || ""}
                onChange={handleChange}
                placeholder={dynamicProps.placeholder}
                disabled={disabled}
                min={dynamicProps.min}
                max={dynamicProps.max}
                step={dynamicProps.step || "0.01"}
                className={baseClassName}
                autoFocus={autoFocus}
                {...props}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
            </div>
          );

        default:
          return (
            <div className="relative">
              {IconComponent && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconComponent className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <input
                type={
                  isPassword
                    ? showPassword
                      ? "text"
                      : "password"
                    : field.type || "text"
                }
                name={field.name}
                value={value || ""}
                onChange={handleChange}
                placeholder={dynamicProps.placeholder}
                disabled={disabled}
                maxLength={field.maxLength}
                minLength={field.minLength}
                min={dynamicProps.min}
                max={dynamicProps.max}
                step={dynamicProps.step}
                className={baseClassName}
                autoFocus={autoFocus}
                {...props}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={disabled}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              )}
              {!isPassword && field.type !== "file" && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
    };

    return renderInput();
  },
);

UniversalInput.displayName = "UniversalInput";

// =============================================================================
// 4. FORM FIELD WRAPPER - FIXED
// =============================================================================

export const FormField = memo(
  ({
    field,
    value,
    onChange,
    error,
    disabled = false,
    className = "",
    externalOptions = {},
    formData = {},
    ...props
  }) => {
    if (!field || !field.name) {
      console.error("FormField: Invalid field provided", field);
      return null;
    }

    // For checkbox and radio, don't show label separately
    if (field.type === "checkbox" || field.type === "radio") {
      return (
        <div className={field.gridCols || "w-full"}>
          <UniversalInput
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
            externalOptions={externalOptions}
            formData={formData}
            {...props}
          />
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    // For photo fields, render without wrapper
    if (field.type === "photo") {
      return (
        <div className={field.gridCols || "w-full"}>
          <UniversalInput
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
            externalOptions={externalOptions}
            formData={formData}
            {...props}
          />
          {error && (
            <p className="text-xs text-red-600 text-center mt-2">{error}</p>
          )}
        </div>
      );
    }

    // Standard field with label
    return (
      <div className={field.gridCols || "w-full"}>
        <div className="space-y-2">
          <label
            htmlFor={field.name}
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            {field.label}
            {field.required && <span className="text-red-500 text-xs">*</span>}
          </label>
          <UniversalInput
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
            externalOptions={externalOptions}
            formData={formData}
            id={field.name}
            {...props}
          />
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {field.helpText && !error && (
            <p className="text-xs text-gray-500">{field.helpText}</p>
          )}
        </div>
      </div>
    );
  },
);

FormField.displayName = "FormField";

// =============================================================================
// 5. FORM SECTION COMPONENT - FIXED
// =============================================================================

export const FormSection = memo(
  ({
    section,
    formData,
    onChange,
    errors = {},
    disabled = false,
    externalOptions = {},
    ...props
  }) => {
    const handleFieldChange = useCallback(
      (e) => {
        if (!e || !e.target) {
          console.error("Invalid event object passed to handleFieldChange:", e);
          return;
        }

        const { name, value, type } = e.target;

        if (!name) {
          console.error("Field name is missing from event target:", e.target);
          return;
        }

        if (typeof onChange === "function") {
          onChange((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      },
      [onChange],
    );

    if (!section) {
      console.error("FormSection: No section provided");
      return null;
    }

    if (!section.fields || !Array.isArray(section.fields)) {
      console.error("FormSection: Section has no valid fields array", section);
      return null;
    }

    const IconComponent = section.icon;

    // Filter visible fields
    const visibleFields = section.fields.filter((field) => {
      if (!field || !field.name) return false;

      // Check conditional visibility
      if (field.conditionalField && field.hideWhen && field.dependsOn) {
        const dependentValue = formData[field.dependsOn];
        if (dependentValue && field.hideWhen.includes(dependentValue)) {
          return false;
        }
      }

      return true;
    });

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div
          className={`bg-gradient-to-r ${
            section.gradient || "from-blue-500 to-purple-600"
          } px-6 py-4`}
        >
          <div className="flex items-center space-x-3">
            {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
            <h3 className="text-lg font-semibold text-white">
              {section.title}
            </h3>
          </div>
          {section.description && (
            <p className="text-white/80 text-sm mt-1">{section.description}</p>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleFields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                value={formData[field.name] || ""}
                onChange={handleFieldChange}
                error={errors[field.name]}
                disabled={disabled}
                externalOptions={externalOptions}
                formData={formData}
                {...props}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
);

FormSection.displayName = "FormSection";

// =============================================================================
// 6. ACTION BUTTONS COMPONENT - IMPROVED
// =============================================================================

export const ActionButtons = memo(
  ({
    isEditMode = false,
    canSubmit = true,
    isSubmitting = false,
    onCancel,
    onSubmit,
    submitText,
    cancelText = "Cancel",
    additionalButtons = [],
    className = "",
    showCancel = true,
  }) => {
    const handleSubmit = useCallback(
      (e) => {
        e?.preventDefault?.();
        if (
          onSubmit &&
          typeof onSubmit === "function" &&
          canSubmit &&
          !isSubmitting
        ) {
          onSubmit(e);
        }
      },
      [onSubmit, canSubmit, isSubmitting],
    );

    const handleCancel = useCallback(
      (e) => {
        e?.preventDefault?.();
        if (onCancel && typeof onCancel === "function") {
          onCancel();
        }
      },
      [onCancel],
    );

    return (
      <div className={`flex flex-col sm:flex-row gap-3 pt-6 ${className}`}>
        <button
          type="submit"
          onClick={handleSubmit}
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
          `.trim()}
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
              <span>{submitText || (isEditMode ? "Update" : "Add")}</span>
            </>
          )}
        </button>

        {additionalButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.onClick}
            disabled={isSubmitting}
            className={
              button.className ||
              "px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
            }
          >
            {button.icon &&
              React.createElement(button.icon, { className: "w-4 h-4 mr-2" })}
            {button.label}
          </button>
        ))}

        {showCancel && (
          <button
            type="button"
            onClick={handleCancel}
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
            `.trim()}
          >
            {cancelText}
          </button>
        )}
      </div>
    );
  },
);

ActionButtons.displayName = "ActionButtons";

// =============================================================================
// 7. UNIVERSAL MODAL WRAPPER - IMPROVED
// =============================================================================

export const UniversalModal = memo(
  ({
    show,
    onClose,
    title,
    isEditMode = false,
    icon: IconComponent,
    children,
    className = "",
    size = "lg",
    closeOnBackdrop = true,
    closeOnEscape = true,
    ...props
  }) => {
    // Handle escape key
    useEffect(() => {
      if (!show || !closeOnEscape) return;

      const handleEscape = (e) => {
        if (e.key === "Escape") {
          onClose?.();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [show, closeOnEscape, onClose]);

    // Prevent scroll when modal is open
    useEffect(() => {
      if (show) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    }, [show]);

    const handleBackdropClick = useCallback(
      (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose?.();
        }
      },
      [closeOnBackdrop, onClose],
    );

    if (!show) return null;

    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      xl: "max-w-6xl",
      full: "max-w-full mx-4",
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden ${className}`}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isEditMode
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : "bg-gradient-to-r from-green-600 to-blue-600"
              }`}
            >
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <div className="p-2 bg-white/20 rounded-lg">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                )}
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-white"
                >
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

UniversalModal.displayName = "UniversalModal";

// =============================================================================
// 8. FORM HOOK FOR STATE MANAGEMENT - FIXED
// =============================================================================

export const useUniversalForm = (config, options = {}) => {
  const {
    onSubmit,
    existingData = [],
    editData = null,
    transformSubmissionData = (data) => data,
    resetOnSubmit = true,
  } = options;

  const [formData, setFormData] = useState(() => {
    if (editData) {
      const defaultData = getDefaultFormData(config);
      return { ...defaultData, ...editData };
    }
    return getDefaultFormData(config);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const isEditMode = Boolean(editData);

  const { errors, validateForm, validateField, clearError, setErrors } =
    useFormValidation(config, existingData, editData?.id);

  // Reset form when config changes
  useEffect(() => {
    if (!isEditMode) {
      setFormData(getDefaultFormData(config));
      setErrors({});
      setIsDirty(false);
    }
  }, [config, isEditMode, setErrors]);

  const handleFieldChange = useCallback(
    (e) => {
      if (!e || !e.target) {
        console.error("Invalid event object in handleFieldChange:", e);
        return;
      }

      const { name, value, type } = e.target;

      if (!name) {
        console.error("Field name is missing from event target:", e.target);
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
      setIsDirty(true);

      // Real-time validation with debounce
      setTimeout(() => {
        const updatedFormData = { ...formData, [name]: value };
        const error = validateField(name, value, updatedFormData);
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }));
        } else {
          clearError(name);
        }
      }, 300);
    },
    [formData, validateField, clearError, setErrors],
  );

  const canSubmit = useMemo(() => {
    const requiredFields = getAllFieldsFromConfig(config)
      .filter((field) => {
        if (!field || !field.required) return false;

        // Check if field is conditionally hidden
        if (field.conditionalField && field.hideWhen && field.dependsOn) {
          const dependentValue = formData[field.dependsOn];
          if (dependentValue && field.hideWhen.includes(dependentValue)) {
            return false;
          }
        }

        return true;
      })
      .map((field) => field.name);

    const hasAllRequired = requiredFields.every((fieldName) => {
      const value = formData[fieldName];
      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (typeof value !== "string" || value.trim() !== "")
      );
    });

    const hasNoErrors = Object.values(errors).every((error) => !error);

    return hasAllRequired && hasNoErrors && !isSubmitting;
  }, [formData, errors, isSubmitting, config]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      if (!validateForm(formData)) {
        return false;
      }

      setIsSubmitting(true);

      try {
        const transformedData = transformSubmissionData(formData);
        const result = await onSubmit(transformedData, editData?.id);

        if (result !== false) {
          if (resetOnSubmit) {
            setFormData(getDefaultFormData(config));
            setIsDirty(false);
            setErrors({});
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Form submission error:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      validateForm,
      onSubmit,
      editData,
      transformSubmissionData,
      config,
      setErrors,
      resetOnSubmit,
    ],
  );

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData(config));
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [config, setErrors]);

  const setFieldValue = useCallback((fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback(
    (fieldName, error) => {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    },
    [setErrors],
  );

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isDirty,
    isEditMode,
    canSubmit,
    handleFieldChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateForm: () => validateForm(formData),
  };
};

// =============================================================================
// EXPORT ALL COMPONENTS
// =============================================================================

export default {
  UniversalInput,
  FormField,
  FormSection,
  ActionButtons,
  UniversalModal,
  useUniversalForm,
  useFormValidation,
  findFieldInConfig,
  getAllFieldsFromConfig,
  getDefaultFormData,
  getIcon,
};

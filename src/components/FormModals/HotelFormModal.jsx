import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { Edit3, Plus, Loader, Building2 } from "lucide-react";
import Modal from "../Modal";
import { FormCancelButton, FormSubmitButton } from "../Forms/FormActions";
// Import your reusable field components - Make sure these paths are correct
import TextInputField from "../Forms/TextInputField";
import TextareaField from "../Forms/TextareaField";
import NumberField from "../Forms/NumberField";
import SelectField from "../Forms/SelectField";
import CheckboxField from "../Forms/CheckboxField";
import DateField from "../Forms/DateField";
import PasswordInputField from "../Forms/PasswordInputField";

import {
  hotelFormSections,
  hotelFormFields,
  hotelFormInitialValues,
  getHotelValidationSchema,
} from "../../Constants/ConfigForms/addHotelFormConfig";

// Helper function to get initial form data
const getInitialFormData = (editData = null) => {
  if (editData) {
    return {
      ...hotelFormInitialValues,
      ...editData,
    };
  }
  return hotelFormInitialValues;
};

// Field component mapping
const fieldComponentMap = {
  text: TextInputField,
  url: TextInputField,
  email: TextInputField,
  tel: TextInputField,
  number: NumberField,
  textarea: TextareaField,
  select: SelectField,
  checkbox: CheckboxField,
  date: DateField,
  password: PasswordInputField,
};

// Enhanced Field Renderer using your reusable components
const renderField = (
  field,
  value,
  error,
  onChange,
  disabled,
  inputRef = null
) => {
  const FieldComponent = fieldComponentMap[field.type];

  if (!FieldComponent) {
    console.warn(`No component found for field type: ${field.type}`);
    return null;
  }

  // Handle nested fields (like socialMedia.facebook)
  const fieldProps = {
    ...field,
    value: value,
    error,
    onChange: (name, val) => onChange(field.name, val), // Always use field.name for consistency
    disabled,
    inputRef,
  };

  // Special handling for minimum order amount with currency prefix
  if (field.name === "minimumOrderAmount") {
    return (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            ₹
          </span>
          <input
            ref={inputRef}
            type="number"
            name={field.name}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            min={field.min || 0}
            max={field.max || 10000}
            step={field.step || 1}
            disabled={disabled}
            required={field.required}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 ${
              error ? "border-red-400 bg-red-50" : "border-gray-200"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </div>
        {field.description && (
          <p className="text-xs text-gray-500 mt-1">{field.description}</p>
        )}
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div key={field.name} className="mb-4">
      <FieldComponent {...fieldProps} />
    </div>
  );
};

// Simple Form Section Component - MAKE SURE TO USE THIS ONE
const HotelFormSection = memo(
  ({ section, formData, onChange, errors, disabled, firstFieldRef }) => {
    // Get the actual fields array from the mapping
    const sectionFields = hotelFormFields[section.fields] || [];

    // Safety check
    if (!Array.isArray(sectionFields)) {
      console.error(
        `Expected array for section ${section.title}, got:`,
        typeof sectionFields,
        sectionFields
      );
      return (
        <div className="mb-8">
          <div className="text-red-600 p-4 border border-red-300 rounded-lg">
            Error: Invalid field configuration for section "{section.title}"
          </div>
        </div>
      );
    }

    return (
      <div className="mb-8">
        {/* Section Header */}
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
          )}
        </div>

        {/* Fields in responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectionFields.map((field, index) => {
            // Handle nested field values
            let fieldValue;
            if (field.name.includes(".")) {
              const [parent, child] = field.name.split(".");
              fieldValue = formData[parent]?.[child];
            } else {
              fieldValue = formData[field.name];
            }

            return renderField(
              field,
              fieldValue,
              errors[field.name],
              onChange,
              disabled,
              index === 0 && firstFieldRef ? firstFieldRef : null
            );
          })}
        </div>
      </div>
    );
  }
);

// Main AddHotelFormModal component
const AddHotelFormModal = memo(
  ({
    show = false,
    onClose,
    onSubmit,
    editHotel = null,
    title,
    submitText,
    cancelText = "Cancel",
    submitting = false,
    className = "",
    modalProps = {},
    ...rest
  }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firstFieldRef = useRef(null);
    const isEditMode = Boolean(editHotel);

    const validationSchema = useMemo(() => getHotelValidationSchema(), []);

    // Initialize form data
    useEffect(() => {
      if (show) {
        const initialData = getInitialFormData(editHotel);
        setFormData(initialData);
        setErrors({});
        setIsDirty(false);

        // Focus first field after modal opens
        setTimeout(() => {
          if (firstFieldRef.current) {
            firstFieldRef.current.focus();
          }
        }, 300);
      } else {
        // Reset everything when modal closes
        setFormData({});
        setErrors({});
        setIsDirty(false);
      }
    }, [show, editHotel]);

    // Real-time validation
    useEffect(() => {
      if (isDirty) {
        const validation = validationSchema.validate(formData);
        setErrors(validation);
      }
    }, [formData, isDirty, validationSchema]);

    const handleFieldChange = useCallback((fieldName, value) => {
      setFormData((prev) => {
        // Handle nested fields
        if (fieldName.includes(".")) {
          const [parent, child] = fieldName.split(".");
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: value,
            },
          };
        }
        return { ...prev, [fieldName]: value };
      });
      setIsDirty(true);
    }, []);

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();

        const validation = validationSchema.validate(formData);
        setErrors(validation);

        if (Object.keys(validation).length > 0) {
          // Scroll to first error
          setTimeout(() => {
            const firstErrorElement = document.querySelector(".text-red-600");
            if (firstErrorElement) {
              firstErrorElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 100);
          return;
        }

        setIsSubmitting(true);
        try {
          const result = await onSubmit(formData, editHotel?.hotelId);
          if (result !== false) {
            handleClose();
          }
        } catch (error) {
          console.error("Error submitting form:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      [formData, editHotel, onSubmit, validationSchema]
    );

    const handleClose = useCallback(() => {
      if (isSubmitting) return;

      // Check if user has unsaved changes
      if (isDirty) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        );
        if (!confirmed) return;
      }

      setFormData({});
      setErrors({});
      setIsDirty(false);
      onClose();
    }, [isSubmitting, isDirty, onClose]);

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
      const validation = validationSchema.validate(formData);
      return (
        Object.keys(validation).length === 0 &&
        !isSubmitting &&
        !submitting &&
        isDirty
      );
    }, [formData, isSubmitting, submitting, isDirty, validationSchema]);

    // Calculate completion percentage for progress
    const formCompletion = useMemo(() => {
      const requiredFields = [];

      hotelFormSections.forEach((section) => {
        const sectionFieldsArray = hotelFormFields[section.fields] || [];
        sectionFieldsArray.forEach((field) => {
          if (field.required) {
            requiredFields.push(field.name);
          }
        });
      });

      const completedFields = requiredFields.filter((fieldName) => {
        if (fieldName.includes(".")) {
          const [parent, child] = fieldName.split(".");
          return formData[parent]?.[child]?.toString().trim();
        }
        return formData[fieldName]?.toString().trim();
      }).length;

      return requiredFields.length > 0
        ? Math.round((completedFields / requiredFields.length) * 100)
        : 0;
    }, [formData]);

    // Get current hotel status for display
    const hotelStatus = formData.isActive || "active";
    const statusColors = {
      active: "text-green-600",
      in_active: "text-red-600",
      pending: "text-yellow-600",
      suspended: "text-gray-600",
    };

    if (!show) return null;

    return (
      <Modal
        isOpen={show}
        onClose={handleClose}
        title={title || (isEditMode ? "Edit Hotel Details" : "Add New Hotel")}
        size="4xl"
        closeOnBackdrop={!isDirty}
        className="max-h-[90vh]"
        {...modalProps}
      >
        <div className={`${className}`} {...rest}>
          {/* Clean Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  isEditMode ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {isEditMode ? (
                  <Edit3 className="w-6 h-6 text-blue-600" />
                ) : (
                  <Building2 className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? "Update Hotel" : "Add New Hotel"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? "Modify the hotel details below"
                    : "Set up a new hotel in your system"}
                </p>
              </div>
            </div>

            {/* Status and Progress Display */}
            <div className="flex items-center gap-6">
              {/* Progress indicator for new hotels */}
              {!isEditMode && (
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${formCompletion}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {formCompletion}%
                    </span>
                  </div>
                </div>
              )}

              {/* Hotel Status Display */}
              {formData.businessName && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Hotel Status</div>
                  <div
                    className={`text-sm font-bold ${statusColors[hotelStatus]}`}
                  >
                    {hotelStatus.charAt(0).toUpperCase() +
                      hotelStatus.slice(1).replace("_", " ")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-h-[calc(90vh-200px)]"
          >
            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {hotelFormSections.map((section, index) => (
                <HotelFormSection // USE HotelFormSection, NOT FormSection
                  key={section.title}
                  section={section}
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                  disabled={isSubmitting || submitting}
                  firstFieldRef={index === 0 ? firstFieldRef : null}
                />
              ))}
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
              {/* Error Summary */}
              <div className="flex items-center gap-2 text-sm">
                {Object.keys(errors).length > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <span>⚠️</span>
                    <span>
                      {Object.keys(errors).length} error
                      {Object.keys(errors).length !== 1 ? "s" : ""} to fix
                    </span>
                  </div>
                )}
                {isDirty && Object.keys(errors).length === 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <span>✅</span>
                    <span>Ready to submit</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <FormCancelButton
                  onCancel={handleClose}
                  disabled={isSubmitting}
                  text={cancelText}
                />
                <FormSubmitButton
                  disabled={!canSubmit}
                  isEditMode={isEditMode}
                  isLoading={isSubmitting}
                  text={
                    submitText || (isEditMode ? "Update Hotel" : "Add Hotel")
                  }
                />
              </div>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
);

AddHotelFormModal.displayName = "AddHotelFormModal";
export default AddHotelFormModal;

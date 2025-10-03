import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { Edit3, Plus, Loader, UserPlus } from "lucide-react";
import Modal from "../Modal";
import { FormCancelButton, FormSubmitButton } from "../Forms/FormActions";
// Import your reusable field components
import TextInputField from "../Forms/TextInputField";
import SelectField from "../Forms/SelectField";
import PasswordInputField from "../Forms/PasswordInputField";

// Admin form configuration
const adminFormSections = [
  {
    title: "Personal Information",
    description: "Basic details of the admin user",
    fields: "personalInfo",
  },
  {
    title: "Account Settings",
    description: "Login credentials and permissions",
    fields: "accountSettings",
  },
  {
    title: "Hotel Assignment",
    description: "Link admin to specific hotel",
    fields: "hotelAssignment",
  },
];

const adminFormFields = {
  personalInfo: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      required: true,
    },
  ],
  accountSettings: [
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
      required: true,
    },
    {
      name: "role",
      label: "Admin Role",
      type: "select",
      required: true,
      options: [
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "super_admin", label: "Super Admin" },
      ],
      placeholder: "Select role",
    },
    {
      name: "status",
      label: "Account Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "suspended", label: "Suspended" },
      ],
      placeholder: "Select status",
    },
  ],
  hotelAssignment: [
    {
      name: "linkedHotelId",
      label: "Assign to Hotel",
      type: "select",
      required: false,
      options: [], // Will be populated dynamically
      placeholder: "Select hotel (optional)",
    },
  ],
};

const adminFormInitialValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  status: "active",
  linkedHotelId: "",
};

const getAdminValidationSchema = () => ({
  validate: (values) => {
    const errors = {};

    if (!values.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!values.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (!values.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\+]?[0-9]{10,15}$/.test(values.phone)) {
      errors.phone = "Invalid phone number";
    }

    if (!values.password?.trim()) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!values.role) {
      errors.role = "Admin role is required";
    }

    if (!values.status) {
      errors.status = "Account status is required";
    }

    return errors;
  },
});

// Helper function to get initial form data
const getInitialFormData = (editData = null, defaultHotelId = null) => {
  if (editData) {
    return {
      ...adminFormInitialValues,
      ...editData,
    };
  }
  return {
    ...adminFormInitialValues,
    linkedHotelId: defaultHotelId || "",
  };
};

// Field component mapping
const fieldComponentMap = {
  text: TextInputField,
  email: TextInputField,
  tel: TextInputField,
  password: PasswordInputField,
  select: SelectField,
};

// Enhanced Field Renderer
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

  const fieldProps = {
    ...field,
    value,
    error,
    onChange: (name, val) => onChange(field.name, val),
    disabled,
    inputRef,
  };

  return (
    <div key={field.name} className="mb-4">
      <FieldComponent {...fieldProps} />
    </div>
  );
};

// Simple Form Section Component
const AdminFormSection = memo(
  ({
    section,
    formData,
    onChange,
    errors,
    disabled,
    firstFieldRef,
    availableHotels,
  }) => {
    const sectionFields = adminFormFields[section.fields] || [];

    // Update hotel options for hotel assignment section
    const processedFields = useMemo(() => {
      return sectionFields.map((field) => {
        if (field.name === "linkedHotelId") {
          return {
            ...field,
            options: [
              { value: "", label: "No hotel assigned" },
              ...availableHotels.map((hotel) => ({
                value: hotel.hotelId,
                label: hotel.businessName || hotel.hotelName,
              })),
            ],
          };
        }
        return field;
      });
    }, [sectionFields, availableHotels]);

    return (
      <div className="mb-8">
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedFields.map((field, index) =>
            renderField(
              field,
              formData[field.name],
              errors[field.name],
              onChange,
              disabled,
              index === 0 && firstFieldRef ? firstFieldRef : null
            )
          )}
        </div>
      </div>
    );
  }
);

// Main AddAdminFormModal component
const AddAdminFormModal = memo(
  ({
    show = false,
    onClose,
    onSubmit,
    editAdmin = null,
    availableHotels = [],
    defaultHotelId = null,
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
    const isEditMode = Boolean(editAdmin);

    const validationSchema = useMemo(() => getAdminValidationSchema(), []);

    // Initialize form data
    useEffect(() => {
      if (show) {
        const initialData = getInitialFormData(editAdmin, defaultHotelId);
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
        setFormData({});
        setErrors({});
        setIsDirty(false);
      }
    }, [show, editAdmin, defaultHotelId]);

    // Real-time validation
    useEffect(() => {
      if (isDirty) {
        const validation = validationSchema.validate(formData);
        setErrors(validation);
      }
    }, [formData, isDirty, validationSchema]);

    const handleFieldChange = useCallback((fieldName, value) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      setIsDirty(true);
    }, []);

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();

        const validation = validationSchema.validate(formData);
        setErrors(validation);

        if (Object.keys(validation).length > 0) {
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
          const result = await onSubmit(formData, editAdmin?.adminId);
          if (result !== false) {
            handleClose();
          }
        } catch (error) {
          console.error("Error submitting form:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      [formData, editAdmin, onSubmit, validationSchema]
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
      onClose();
    }, [isSubmitting, isDirty, onClose]);

    const canSubmit = useMemo(() => {
      const validation = validationSchema.validate(formData);
      return (
        Object.keys(validation).length === 0 &&
        !isSubmitting &&
        !submitting &&
        isDirty
      );
    }, [formData, isSubmitting, submitting, isDirty, validationSchema]);

    if (!show) return null;

    return (
      <Modal
        isOpen={show}
        onClose={handleClose}
        title={title || (isEditMode ? "Edit Admin Details" : "Add New Admin")}
        size="3xl"
        closeOnBackdrop={!isDirty}
        className="max-h-[90vh]"
        {...modalProps}
      >
        <div className={`${className}`} {...rest}>
          {/* Header */}
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
                  <UserPlus className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? "Update Admin" : "Add New Admin"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? "Modify the admin details below"
                    : "Create a new admin account"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-h-[calc(90vh-200px)]"
          >
            <div className="flex-1 overflow-y-auto p-6">
              {adminFormSections.map((section, index) => (
                <AdminFormSection
                  key={section.title}
                  section={section}
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                  disabled={isSubmitting || submitting}
                  firstFieldRef={index === 0 ? firstFieldRef : null}
                  availableHotels={availableHotels}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
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
                    submitText || (isEditMode ? "Update Admin" : "Add Admin")
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

AddAdminFormModal.displayName = "AddAdminFormModal";
export default AddAdminFormModal;

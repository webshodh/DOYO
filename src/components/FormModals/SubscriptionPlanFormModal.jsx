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
  Loader,
  Info,
  Star,
  Zap,
  BarChart,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Clock,
  Check,
  X,
} from "lucide-react";
import Modal from "../Modal";
import {
  subscriptionFormFields,
  subscriptionFormSections,
  subscriptionFormInitialValues,
  getSubscriptionValidationSchema,
  planTemplates,
} from "../../Constants/ConfigForms/subscriptionFormFields";

// Helper function to get initial form data
const getInitialFormData = (editData = null) => {
  if (editData) {
    return {
      ...subscriptionFormInitialValues,
      ...editData,
    };
  }
  return subscriptionFormInitialValues;
};

// Form Section Component
const FormSection = memo(
  ({
    section,
    formData,
    onChange,
    errors,
    disabled,
    isExpanded,
    onToggle,
    firstFieldRef,
  }) => {
    const getSectionIcon = (iconName) => {
      const icons = {
        Info: Info,
        Star: Star,
        Zap: Zap,
        BarChart: BarChart,
      };
      const IconComponent = icons[iconName] || Info;
      return <IconComponent size={20} />;
    };

    const renderField = useCallback(
      (field) => {
        const value = formData[field.name];
        const error = errors[field.name];
        const hasError = Boolean(error);

        const baseClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          hasError ? "border-red-500 bg-red-50" : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

        switch (field.type) {
          case "text":
          case "url":
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  ref={field.name === "planName" ? firstFieldRef : null}
                  type={field.type}
                  name={field.name}
                  value={value || ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
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

          case "number":
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  {field.name === "price" && (
                    <span className="absolute left-3 top-2 text-gray-500">
                      ₹
                    </span>
                  )}
                  <input
                    type="number"
                    name={field.name}
                    value={value || ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className={`${baseClasses} ${
                      field.name === "price" ? "pl-8" : ""
                    }`}
                    disabled={disabled}
                    required={field.required}
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
                <select
                  name={field.name}
                  value={value || ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className={baseClasses}
                  disabled={disabled}
                  required={field.required}
                >
                  <option value="">
                    {field.placeholder || `Select ${field.label}`}
                  </option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
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
                  {value ? (
                    <Check size={16} className="text-green-600 mt-0.5" />
                  ) : (
                    <X size={16} className="text-gray-400 mt-0.5" />
                  )}
                </div>
                {hasError && (
                  <p className="text-red-600 text-xs flex items-center">
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
      [formData, onChange, errors, disabled, firstFieldRef]
    );

    const sectionFields = subscriptionFormFields[section.fields] || [];
    const sectionErrorCount = sectionFields.filter(
      (field) => errors[field.name]
    ).length;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => onToggle(section.title)}
          className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${
            isExpanded ? "bg-purple-50 border-b border-gray-200" : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isExpanded ? "bg-purple-100" : "bg-gray-100"
              }`}
            >
              {getSectionIcon(section.icon)}
            </div>
            <div>
              <h3
                className={`font-semibold ${
                  isExpanded ? "text-purple-900" : "text-gray-900"
                }`}
              >
                {section.title}
              </h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {sectionErrorCount > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {sectionErrorCount} error{sectionErrorCount !== 1 ? "s" : ""}
              </span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectionFields.map(renderField)}
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Quick Template Selector Component
const TemplateSelector = memo(({ onSelectTemplate, disabled }) => {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (templateKey) => {
    const template = planTemplates[templateKey];
    onSelectTemplate(template);
    setShowTemplates(false);
  };

  if (!showTemplates) {
    return (
      <button
        type="button"
        onClick={() => setShowTemplates(true)}
        disabled={disabled}
        className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
      >
        Use Template
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Quick Templates:</div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(planTemplates).map(([key, template]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTemplateSelect(key)}
            disabled={disabled}
            className="p-2 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-sm font-medium text-gray-900">
              {template.planName}
            </div>
            <div className="text-xs text-gray-600">₹{template.price}/month</div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowTemplates(false)}
        className="text-xs text-gray-600 hover:text-gray-800"
      >
        Hide Templates
      </button>
    </div>
  );
});

// Main SubscriptionFormModal component
const SubscriptionFormModal = memo(
  ({
    show = false,
    onClose,
    onSubmit,
    editPlan = null,
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const firstFieldRef = useRef(null);
    const isEditMode = Boolean(editPlan);

    const validationSchema = useMemo(
      () => getSubscriptionValidationSchema(),
      []
    );

    // Initialize form data
    useEffect(() => {
      if (show) {
        const initialData = getInitialFormData(editPlan);
        setFormData(initialData);
        setErrors({});
        setIsDirty(false);

        // Expand first section by default
        const initialExpanded = { [subscriptionFormSections.title]: true };
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
    }, [show, editPlan]);

    // Real-time validation
    useEffect(() => {
      if (isDirty) {
        const validation = validationSchema.validate(formData);
        setErrors(validation);
      }
    }, [formData, isDirty, validationSchema]);

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

    // Calculate form completion
    const formCompletion = useMemo(() => {
      const requiredFields = [];
      subscriptionFormSections.forEach((section) => {
        const sectionFields = subscriptionFormFields[section.fields] || [];
        sectionFields.forEach((field) => {
          if (field.required) {
            requiredFields.push(field.name);
          }
        });
      });

      const completedFields = requiredFields.filter((fieldName) =>
        formData[fieldName]?.toString().trim()
      ).length;

      return requiredFields.length > 0
        ? Math.round((completedFields / requiredFields.length) * 100)
        : 0;
    }, [formData]);

    // Calculate monthly revenue based on price
    const monthlyRevenue = useMemo(() => {
      const price = parseFloat(formData.price) || 0;
      return price;
    }, [formData.price]);

    const handleFieldChange = useCallback((fieldName, value) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      setIsDirty(true);
    }, []);

    const handleTemplateSelect = useCallback((template) => {
      setFormData((prev) => ({
        ...prev,
        ...template,
      }));
      setIsDirty(true);
    }, []);

    const handleSectionToggle = useCallback((sectionTitle) => {
      setExpandedSections((prev) => ({
        ...prev,
        [sectionTitle]: !prev[sectionTitle],
      }));
    }, []);

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();

        const validation = validationSchema.validate(formData);
        setErrors(validation);

        if (Object.keys(validation).length > 0) {
          // Expand sections with errors
          const sectionsWithErrors = {};
          subscriptionFormSections.forEach((section) => {
            const sectionFields = subscriptionFormFields[section.fields] || [];
            if (sectionFields.some((field) => validation[field.name])) {
              sectionsWithErrors[section.title] = true;
            }
          });
          setExpandedSections((prev) => ({ ...prev, ...sectionsWithErrors }));

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
          const result = await onSubmit(formData, editPlan?.planId);
          if (result !== false) {
            handleClose();
          }
        } catch (error) {
          console.error("Error submitting form:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      [formData, editPlan, onSubmit, validationSchema]
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
      setExpandedSections({});
      onClose();
    }, [isSubmitting, isDirty, onClose]);

    const expandAllSections = useCallback(() => {
      const allExpanded = {};
      subscriptionFormSections.forEach((section) => {
        allExpanded[section.title] = true;
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
        title={
          title || (isEditMode ? "Edit Subscription Plan" : "Create New Plan")
        }
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
                  isEditMode ? "bg-purple-100" : "bg-green-100"
                }`}
              >
                {isEditMode ? (
                  <Edit3 className="w-6 h-6 text-purple-600" />
                ) : (
                  <Plus className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? "Update Subscription Plan" : "Create New Plan"}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600">
                    {isEditMode
                      ? "Modify the subscription plan details below"
                      : "Define features, pricing, and limits for your new plan"}
                  </p>
                  {!isEditMode && (
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium text-gray-500">
                        Progress:
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all duration-300 ease-out"
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
              {monthlyRevenue > 0 && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Monthly Price</div>
                  <div className="text-lg font-bold text-purple-600">
                    ₹{monthlyRevenue}
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

          {/* Template Selector */}
          {!isEditMode && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <TemplateSelector
                onSelectTemplate={handleTemplateSelect}
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
              {subscriptionFormSections.map((section) => (
                <FormSection
                  key={section.title}
                  section={section}
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={errors}
                  disabled={isSubmitting || submitting}
                  isExpanded={expandedSections[section.title] || false}
                  onToggle={handleSectionToggle}
                  firstFieldRef={
                    section.title === subscriptionFormSections.title
                      ? firstFieldRef
                      : null
                  }
                />
              ))}
            </div>

            {/* Enhanced Form Actions */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl"
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
                        {submitText ||
                          (isEditMode ? "Update Plan" : "Create Plan")}
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

SubscriptionFormModal.displayName = "SubscriptionFormModal";
export default SubscriptionFormModal;

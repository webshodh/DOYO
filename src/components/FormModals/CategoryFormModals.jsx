import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { Edit3, Plus, Check, X, AlertTriangle, Loader } from "lucide-react";
import Modal from "../Modal";
import { validateCategoryName } from "../../validation/categoryValidation";

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

// Input component with validation states
const ValidationInput = memo(
  ({
    value,
    onChange,
    error,
    placeholder,
    disabled,
    maxLength = 50,
    autoFocus = false,
    className = "",
    ...props
  }) => {
    const hasValue = value && value.trim();
    const hasError = Boolean(error);
    const isValid = hasValue && !hasError;

    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className={`
          w-full px-4 py-3 pr-12 text-sm border rounded-lg transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
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

        {/* Validation icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {disabled && (
            <Loader className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          {!disabled && isValid && <Check className="w-4 h-4 text-green-500" />}
          {!disabled && hasError && <X className="w-4 h-4 text-red-500" />}
        </div>
      </div>
    );
  }
);

ValidationInput.displayName = "ValidationInput";

// Action buttons component
const ActionButtons = memo(
  ({
    isEditMode,
    canSubmit,
    isSubmitting,
    onCancel,
    submitText,
    cancelText = "Cancel",
  }) => (
    <div className="flex flex-row sm:flex-row gap-3 pt-4">
      <button
        type="submit"
        disabled={!canSubmit}
        className={`
        flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg
        transition-all duration-200 transform hover:scale-105 active:scale-95
        disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          canSubmit
            ? isEditMode
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500"
            : "bg-orange-500 text-white cursor-not-allowed shadow-sm"
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
            <span>{submitText || (isEditMode ? "Update" : "Add")}</span>
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

// Main CategoryFormModal component
const CategoryFormModal = memo(
  ({
    // Core props
    show = false,
    onClose,
    onSubmit,
    editCategory = null,

    // Configuration
    title,
    submitText,
    cancelText = "Cancel",
    placeholder = "Enter category name (e.g., Breakfast, Appetizers)",
    maxLength = 50,

    // State
    submitting = false,

    // Styling
    className = "",
    modalProps = {},

    // Validation
    customValidation,

    // Events
    onChange,
    onValidationChange,

    ...rest
  }) => {
    const [categoryName, setCategoryName] = useState("");
    const [validationError, setValidationError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const inputRef = useRef(null);
    const isEditMode = Boolean(editCategory);

    // Auto-generate title if not provided
    const modalTitle = useMemo(() => {
      if (title) return title;
      return isEditMode ? "Edit Category" : "Add Category";
    }, [title, isEditMode]);

    // Reset form when modal opens/closes or category changes
    useEffect(() => {
      if (show) {
        const initialValue = editCategory?.categoryName || "";
        setCategoryName(initialValue);
        setValidationError("");
        setIsDirty(false);

        // Focus input after modal animation
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      } else {
        setCategoryName("");
        setValidationError("");
        setIsDirty(false);
      }
    }, [show, editCategory]);

    // Real-time validation
    useEffect(() => {
      if (!categoryName.trim()) {
        setValidationError("");
        return;
      }

      // Use custom validation if provided, otherwise use default
      const validation = customValidation
        ? customValidation(categoryName)
        : validateCategoryName(categoryName);

      const error = validation.isValid ? "" : validation.error;
      setValidationError(error);

      // Notify parent of validation changes
      if (onValidationChange) {
        onValidationChange({ isValid: validation.isValid, error });
      }
    }, [categoryName, customValidation, onValidationChange]);

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
      const trimmedName = categoryName.trim();
      return (
        trimmedName &&
        trimmedName !== (editCategory?.categoryName || "") &&
        !validationError &&
        !isSubmitting &&
        !submitting
      );
    }, [categoryName, editCategory, validationError, isSubmitting, submitting]);

    // Handle input change
    const handleInputChange = useCallback(
      (e) => {
        const value = e.target.value;
        setCategoryName(value);
        setIsDirty(true);

        if (onChange) {
          onChange(value);
        }
      },
      [onChange]
    );

    // Handle form submission
    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();

        const trimmedName = categoryName.trim();
        if (!trimmedName) {
          setValidationError("Category name cannot be empty");
          return;
        }

        // Final validation
        const validation = customValidation
          ? customValidation(trimmedName)
          : validateCategoryName(trimmedName);

        if (!validation.isValid) {
          setValidationError(validation.error);
          return;
        }

        setIsSubmitting(true);

        try {
          const result = await onSubmit(trimmedName, editCategory?.categoryId);
          if (result !== false) {
            // Allow onSubmit to return false to prevent closing
            handleClose();
          }
        } catch (error) {
          console.error("Error submitting category:", error);
          setValidationError(
            "An error occurred while saving. Please try again."
          );
        } finally {
          setIsSubmitting(false);
        }
      },
      [categoryName, editCategory, customValidation, onSubmit]
    );

    // Handle modal close
    const handleClose = useCallback(() => {
      if (isSubmitting) return; // Prevent closing while submitting

      setCategoryName("");
      setValidationError("");
      setIsDirty(false);
      onClose();
    }, [isSubmitting, onClose]);

    if (!show) return null;

    return (
      <Modal
        isOpen={show}
        onClose={handleClose}
        title={modalTitle}
        size="md"
        closeOnBackdrop={!isDirty}
        {...modalProps}
      >
        <form
          onSubmit={handleSubmit}
          className={`p-6 space-y-6 ${className}`}
          {...rest}
        >
          {/* Header */}
          {/* <div className="flex items-center gap-4">
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
                {isEditMode ? "Update Category" : "Create New Category"}
              </h3>
              <p className="text-sm text-gray-600">
                {isEditMode
                  ? "Modify the category information below"
                  : "Enter details for the new category"}
              </p>
            </div>
          </div> */}

          {/* Form Fields */}
          <div className="space-y-4">
            <FormField
              label="Category Name"
              error={validationError}
              required
              helpText="Choose a clear, descriptive name for this category"
            >
              <ValidationInput
                ref={inputRef}
                value={categoryName}
                onChange={handleInputChange}
                error={validationError}
                placeholder={placeholder}
                disabled={isSubmitting || submitting}
                maxLength={maxLength}
                autoFocus
              />
            </FormField>
          </div>

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

CategoryFormModal.displayName = "CategoryFormModal";

// Default props
CategoryFormModal.defaultProps = {
  show: false,
  onClose: () => {},
  onSubmit: async () => true,
  editCategory: null,
  submitting: false,
  placeholder: "Enter category name (e.g., Breakfast, Appetizers)",
  maxLength: 50,
  cancelText: "Cancel",
};

export default CategoryFormModal;

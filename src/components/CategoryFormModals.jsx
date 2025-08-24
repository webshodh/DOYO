import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { PageTitle } from "../Atoms";
import { validateCategoryName } from "../Validation/categoryValidation";

const CategoryFormModal = ({
  show,
  onClose,
  onSubmit,
  editCategory = null,
  title = "Add Category",
  submitting = false
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const isEditMode = Boolean(editCategory);

  // Set category name when editing or reset when adding
  useEffect(() => {
    if (editCategory) {
      setCategoryName(editCategory.categoryName || "");
    } else {
      setCategoryName("");
    }
    setValidationError("");
  }, [editCategory, show]);

  // Real-time validation
  useEffect(() => {
    if (categoryName.trim()) {
      const validation = validateCategoryName(categoryName);
      setValidationError(validation.isValid ? "" : validation.error);
    } else {
      setValidationError("");
    }
  }, [categoryName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setValidationError("Category name cannot be empty");
      return;
    }

    // Final validation before submit
    const validation = validateCategoryName(trimmedName);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSubmit(trimmedName, editCategory?.categoryId);
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategoryName("");
    setValidationError("");
    onClose();
  };

  const handleInputChange = (e) => {
    setCategoryName(e.target.value);
  };

  const canSubmit = categoryName.trim() && !validationError && !isSubmitting && !submitting;

  if (!show) return null;

  return (
    <Modal title={title} handleClose={handleClose}>
      <div 
        className="p-10 bg-white rounded-lg shadow-md" 
        style={{ width: "40%", marginRight: "10px" }}
      >
        <PageTitle pageTitle={isEditMode ? "Edit Category" : "Add Category"} />

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={categoryName}
              onChange={handleInputChange}
              placeholder="Enter Category Name"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                validationError 
                  ? 'border-red-300 focus:ring-red-500' 
                  : categoryName.trim() 
                    ? 'border-green-300 focus:ring-green-500' 
                    : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={isSubmitting || submitting}
              required
              maxLength={50}
              autoFocus
            />
            
            {/* Character counter */}
            <div className="flex justify-between mt-1">
              <div>
                {validationError && (
                  <span className="text-red-500 text-sm">{validationError}</span>
                )}
              </div>
              <span className="text-gray-400 text-sm">
                {categoryName.length}/50
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                canSubmit
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting || submitting 
                ? (isEditMode ? "Updating..." : "Adding...") 
                : (isEditMode ? "Update" : "Add Category")
              }
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || submitting}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isSubmitting || submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Cancel
            </button>
          </div>

          {/* Additional info for edit mode */}
          {isEditMode && editCategory && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Category ID:</strong> {editCategory.categoryId}
              </p>
              {editCategory.createdAt && (
                <p className="text-sm text-gray-600">
                  <strong>Created:</strong> {new Date(editCategory.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default CategoryFormModal;
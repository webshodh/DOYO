import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import PageTitle from "../../Atoms/PageTitle";
import { validateCategoryName } from "../../Validation/categoryValidation";

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
      <div className="bg-white rounded-xl shadow-2xl max-w-md mx-auto">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isEditMode ? 'bg-blue-100' : 'bg-green-100'}`}>
              <svg 
                className={`w-5 h-5 ${isEditMode ? 'text-blue-600' : 'text-green-600'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isEditMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit Category" : "Add New Category"}
              </h3>
              <p className="text-sm text-gray-500">
                {isEditMode ? "Update category information" : "Create a new category for your hotel"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Input Field */}
          <div className="space-y-2">
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={handleInputChange}
                placeholder="Enter category name (e.g., Breakfast, Appetizers)"
                className={`
                  w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  disabled:bg-gray-50 disabled:cursor-not-allowed
                  ${validationError 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : categoryName.trim() && !validationError
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                  }
                `}
                disabled={isSubmitting || submitting}
                required
                maxLength={50}
                autoFocus
                autoComplete="off"
              />
              
              {/* Input Icon */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {categoryName.trim() && !validationError ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : validationError ? (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : null}
              </div>
            </div>
            
            {/* Validation Error & Character Counter */}
            <div className="flex justify-between items-center">
              <div className="flex-1">
                {validationError && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium">{validationError}</span>
                  </div>
                )}
              </div>
              <span className={`text-xs font-mono ${
                categoryName.length > 45 ? 'text-red-500' : 
                categoryName.length > 35 ? 'text-yellow-500' : 'text-gray-400'
              }`}>
                {categoryName.length}/50
              </span>
            </div>
          </div>

          {/* Edit Mode Info */}
          {isEditMode && editCategory && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">Category Information</p>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex items-center justify-between">
                      <span>Category ID:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border">
                        {editCategory.categoryId}
                      </span>
                    </div>
                    {editCategory.createdAt && (
                      <div className="flex items-center justify-between">
                        <span>Created:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border">
                          {new Date(editCategory.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`
                flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg
                transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                disabled:hover:scale-100 disabled:active:scale-100
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${canSubmit
                  ? isEditMode
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-sm'
                }
              `}
            >
              {isSubmitting || submitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{isEditMode ? "Updating..." : "Adding..."}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isEditMode ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                  <span>{isEditMode ? "Update Category" : "Add Category"}</span>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || submitting}
              className={`
                px-6 py-3 text-sm font-medium rounded-lg border-2
                transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                disabled:hover:scale-100 disabled:active:scale-100
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isSubmitting || submitting
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 bg-white'
                }
              `}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CategoryFormModal;
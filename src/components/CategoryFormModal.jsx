// components/CategoryFormModal.js
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { PageTitle } from "../Atoms";

const CategoryFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  editCategory = null,
  title = "Add Category"
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = Boolean(editCategory);

  // Set category name when editing
  useEffect(() => {
    if (editCategory) {
      setCategoryName(editCategory.categoryName || "");
    } else {
      setCategoryName("");
    }
  }, [editCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(categoryName.trim(), editCategory?.categoryId);
      if (success) {
        setCategoryName("");
        // Close modal after successful submission with slight delay
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCategoryName("");
    onClose();
  };

  if (!show) return null;

  return (
    <Modal title={title} handleClose={handleCancel}>
      <div className="p-10 bg-white rounded-lg shadow-md" style={{ width: "40%", marginRight: "10px" }}>
        <PageTitle pageTitle={isEditMode ? "Edit Category" : "Add Special Category"} />
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter Category Name"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isSubmitting}
            required
          />
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !categoryName.trim()}
              className="px-4 py-2 text-white bg-green-600 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-red-600 rounded-md disabled:bg-gray-400"
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
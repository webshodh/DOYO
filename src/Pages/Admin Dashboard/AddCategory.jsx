import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "../../styles/AddCategory.css";
import { PageTitle } from "../../Atoms";
import { ViewCategoryColumns } from "../../Constants/Columns";
import { DynamicTable } from "../../components";
import { useParams } from "react-router-dom";
import SearchWithButton from "components/SearchWithAddButton";
import CategoryFormModal from "../../components/FormModals/CategoryFormModals";
import { useCategory } from "../../customHooks/useCategory";

function AddCategory() {
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { hotelName } = useParams();

  // Use custom hook for category management
  const {
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,
    handleFormSubmit,
    handleSearchChange,
    deleteCategory,
    prepareForEdit,
    categoryCount,
    hasCategories,
    hasSearchResults,
  } = useCategory(hotelName);

  // Handle add button click
  const handleAddClick = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  // Handle edit button click
  const handleEditClick = async (category) => {
    const categoryToEdit = await prepareForEdit(category);
    if (categoryToEdit) {
      setEditingCategory(categoryToEdit);
      setShowModal(true);
    }
  };

  // Handle delete button click
  const handleDeleteClick = async (category) => {
    await deleteCategory(category);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // Handle form submission from modal
  const handleModalSubmit = async (categoryName, categoryId = null) => {
    const success = await handleFormSubmit(categoryName, categoryId);
    return success;
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="d-flex justify-center items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ margin: "20px" }}>
        {/* Category Form Modal */}
        <CategoryFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editCategory={editingCategory}
          title={editingCategory ? "Edit Category" : "Add Category"}
          submitting={submitting}
        />

        <div style={{ width: "100%" }}>
          {/* Page Title with Stats */}
          <div className="d-flex justify-between align-items-center mb-3">
            <PageTitle pageTitle="View Categories" />
            {hasCategories && (
              <div className="text-sm text-gray-600">
                {searchTerm
                  ? `Showing ${filteredCategories.length} of ${categoryCount} categories`
                  : `Total: ${categoryCount} categories`}
              </div>
            )}
          </div>
          {/* Search and Add Button */}
          <div className="mb-4">
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              buttonText="Add Category"
              onButtonClick={handleAddClick}
              disabled={submitting}
              placeholder="Search categories..."
            />
          </div>

          {/* Categories Table */}
          {hasCategories ? (
            <>
              {hasSearchResults ? (
                <DynamicTable
                  columns={ViewCategoryColumns}
                  data={filteredCategories}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  loading={submitting}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">
                    <i className="fas fa-search fa-3x"></i>
                  </div>
                  <h5 className="text-gray-600">No categories found</h5>
                  <p className="text-gray-500">
                    No categories match your search "{searchTerm}"
                  </p>
                  <button
                    className="btn btn-outline-primary mt-2"
                    onClick={() => handleSearchChange("")}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <i className="fas fa-tags fa-4x"></i>
              </div>
              <h5 className="text-gray-600 mb-2">No Categories Found</h5>
              <p className="text-gray-500 mb-4">
                Get started by adding your first category
              </p>
              <button
                className="btn btn-primary"
                onClick={handleAddClick}
                disabled={submitting}
              >
                <i className="fas fa-plus me-2"></i>
                Add Your First Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}

export default AddCategory;

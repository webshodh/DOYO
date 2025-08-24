// components/AddCategory.js
import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "../../styles/AddCategory.css";
import { PageTitle } from "../../Atoms";
import { ViewCategoryColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useParams } from "react-router-dom";
import SearchWithButton from "components/SearchWithAddButton";
import CategoryFormModal from "components/CategoryFormModal";
import categoryService from "../../services/categoryService";

function AddCategory() {
  // State management
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { hotelName } = useParams();

  // Subscribe to categories data on component mount
  useEffect(() => {
    console.log("hotelName", hotelName);

    if (!hotelName) return;

    const unsubscribe = categoryService.subscribeToCategories(
      hotelName,
      (data) => {
        setCategories(data);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [hotelName]);

  // Handle adding new category
  const handleAddCategory = async (categoryName) => {
    const success = await categoryService.addCategory(
      hotelName,
      categoryName,
      categories
    );
    return success;
  };

  // Handle updating existing category
  const handleUpdateCategory = async (categoryName, categoryId) => {
    const success = await categoryService.updateCategory(
      hotelName,
      categoryId,
      categoryName,
      categories
    );
    return success;
  };

  // Handle form submission (both add and edit)
  const handleFormSubmit = async (categoryName, categoryId = null) => {
    if (categoryId) {
      // Edit mode
      return await handleUpdateCategory(categoryName, categoryId);
    } else {
      // Add mode
      return await handleAddCategory(categoryName);
    }
  };

  // Handle edit button click
  const handleEditClick = async (category) => {
    const categoryToEdit = await categoryService.prepareEdit(
      hotelName,
      category
    );
    if (categoryToEdit) {
      setEditingCategory(categoryToEdit);
      setShowModal(true);
    }
  };

  // Handle delete button click
  const handleDeleteClick = async (category) => {
    await categoryService.deleteCategory(hotelName, category);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // Handle add button click
  const handleAddClick = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  // Filter and prepare categories for display
  const filteredCategories = categoryService.filterCategories(
    categories,
    searchTerm
  );

  return (
    <>
      <div className="d-flex justify-between">
        {/* Category Form Modal */}
        <CategoryFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleFormSubmit}
          editCategory={editingCategory}
          title={editingCategory ? "Edit Category" : "Add Category"}
        />

        <div style={{ width: "100%" }}>
          {/* Search and Add Button */}
          <div>
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              buttonText="Add Category"
              onButtonClick={handleAddClick}
            />
          </div>

          {/* Page Title */}
          <PageTitle pageTitle="View Categories" />

          {/* Categories Table */}
          <DynamicTable
            columns={ViewCategoryColumns}
            data={filteredCategories}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}

export default AddCategory;

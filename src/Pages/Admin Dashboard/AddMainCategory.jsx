// components/CategoryManager.js
import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageTitle from "../../Atoms/PageTitle";
import { ViewCategoryColumns } from "../../Constants/Columns";
import { DynamicTable } from "../../components";
import SearchWithButton from "../../components/SearchWithAddButton";
import CategoryFormModal from "../../components/FormModals/CategoryFormModals";
import { useCategoryManager } from "../../customHooks/mainCategory";

const CategoryManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const { hotelName } = useParams();

  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryManager(hotelName);

  // Filter and format categories for table
  const categoriesData = useMemo(() => {
    return categories
      .filter((category) =>
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((category, index) => ({
        srNo: index + 1,
        ...category,
      }));
  }, [categories, searchTerm]);

  const handleAdd = () => {
    setEditCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    await deleteCategory(category.categoryId);
  };

  const handleSubmit = async (categoryName, categoryId = null) => {
    if (categoryId) {
      // Update existing category
      return await updateCategory(categoryId, categoryName);
    } else {
      // Add new category
      return await addCategory(categoryName);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditCategory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ margin: "20px" }}>
        <PageTitle pageTitle="View Special Categories" />
        <CategoryFormModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editCategory={editCategory}
          title={editCategory ? "Edit Category" : "Add Category"}
          type="specialcategory"
        />

        <div style={{ width: "100%" }}>
          <SearchWithButton
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            buttonText="Add Special Category"
            onButtonClick={handleAdd}
          />

          <DynamicTable
            columns={ViewCategoryColumns}
            data={categoriesData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default CategoryManager;

// useCategoryManager.js
import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { createCategoryService } from "../services/api/mainCategoryService";

export const useMainCategory = (hotelName) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const adminId = auth.currentUser?.uid;
  const categoryService = createCategoryService(hotelName);

  useEffect(() => {
    if (!hotelName) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = categoryService.subscribeToCategories(
      (categoriesArray) => {
        setCategories(categoriesArray);
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [hotelName]);

  const filteredCategories = categories.filter((category) =>
    category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addCategory = useCallback(
    async (categoryName) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        await categoryService.addCategory(categoryName, adminId);
        toast.success("Category Added Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return true;
      } catch (error) {
        console.error("Error adding category:", error);
        toast.error(
          error.message || "Error adding category. Please try again.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  const updateCategory = useCallback(
    async (categoryId, categoryName) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        await categoryService.updateCategory(categoryId, categoryName, adminId);
        toast.success("Category Updated Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return true;
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error(
          error.message || "Error updating category. Please try again.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  const deleteCategory = useCallback(
    async (category) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      const confirmed = window.confirm(
        `Are you sure you want to delete "${category.categoryName}"? This action cannot be undone.`
      );
      if (!confirmed) {
        setSubmitting(false);
        return false;
      }

      try {
        await categoryService.deleteCategory(category.categoryId, adminId);
        toast.success("Category Deleted Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return true;
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error(
          error.message || "Error deleting category. Please try again.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  const prepareForEdit = useCallback(async (category) => {
    try {
      // no additional preparation needed, just return category
      return category;
    } catch (error) {
      console.error("Error preparing category for edit:", error);
      setError(error);
      return null;
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (categoryName, categoryId = null) => {
      if (categoryId) {
        return await updateCategory(categoryId, categoryName);
      } else {
        return await addCategory(categoryName);
      }
    },
    [addCategory, updateCategory]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const refreshCategories = useCallback(() => {
    setError(null);
    // Firestore subscription handles auto refresh
  }, []);

  return {
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    refreshCategories,
    categoryCount: categories.length,
    filteredCount: filteredCategories.length,
    hasCategories: categories.length > 0,
    hasSearchResults: filteredCategories.length > 0,
  };
};

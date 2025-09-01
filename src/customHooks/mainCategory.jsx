// hooks/useCategoryManager.js
import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { createCategoryService } from "../services/mainCategoryService";

export const useCategoryManager = (hotelName) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = getAuth();
  const adminId = auth.currentUser?.uid;
  const categoryService = createCategoryService(hotelName);

  // Subscribe to categories
  useEffect(() => {
    if (!hotelName) return;

    setLoading(true);
    const unsubscribe = categoryService.subscribeToCategories((categoriesArray) => {
      setCategories(categoriesArray);
      setLoading(false);
    });

    return unsubscribe;
  }, [hotelName]);

  // Add category
  const addCategory = useCallback(async (categoryName) => {
    try {
      setError(null);
      await categoryService.addCategory(categoryName, adminId);
      toast.success("Category Added Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Error adding category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setError(error.message);
      return false;
    }
  }, [adminId, categoryService]);

  // Update category
  const updateCategory = useCallback(async (categoryId, categoryName) => {
    try {
      setError(null);
      await categoryService.updateCategory(categoryId, categoryName, adminId);
      toast.success("Category Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.message || "Error updating category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setError(error.message);
      return false;
    }
  }, [adminId, categoryService]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      setError(null);
      const confirmed = window.confirm("Are you sure you want to delete this category?");
      if (!confirmed) return false;

      await categoryService.deleteCategory(categoryId, adminId);
      toast.error("Category Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Error deleting category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setError(error.message);
      return false;
    }
  }, [adminId, categoryService]);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
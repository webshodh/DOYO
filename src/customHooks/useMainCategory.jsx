import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { createCategoryService } from "../services/mainCategoryService";

export const useCategoryManager = (hotelName) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const adminId = auth.currentUser?.uid;
  const categoryService = createCategoryService(hotelName);

  // Subscribe to categories
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

    // Handle potential connection errors
    // const errorTimeout = setTimeout(() => {
    //   if (loading) {
    //     setError(new Error("Taking longer than expected to load categories"));
    //     setLoading(false);
    //   }
    // }, 50000);

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      unsubscribe();
      // clearTimeout(errorTimeout);
    };
  }, [hotelName]);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add category
  const addCategory = useCallback(
    async (categoryName) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        await categoryService.addCategory(categoryName, adminId);
        toast.success("Category Added Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return true;
      } catch (error) {
        console.error("Error adding category:", error);
        const errorMessage =
          error.message || "Error adding category. Please try again.";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  // Update category
  const updateCategory = useCallback(
    async (categoryId, categoryName) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        await categoryService.updateCategory(categoryId, categoryName, adminId);
        toast.success("Category Updated Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return true;
      } catch (error) {
        console.error("Error updating category:", error);
        const errorMessage =
          error.message || "Error updating category. Please try again.";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (category) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const confirmed = window.confirm(
          `Are you sure you want to delete "${category.categoryName}"? This action cannot be undone.`
        );
        if (!confirmed) {
          setSubmitting(false);
          return false;
        }

        await categoryService.deleteCategory(category.categoryId, adminId);
        toast.error("Category Deleted Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return true;
      } catch (error) {
        console.error("Error deleting category:", error);
        const errorMessage =
          error.message || "Error deleting category. Please try again.";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  // Prepare category for editing
  const prepareForEdit = useCallback(async (category) => {
    try {
      return category; // Return the category for editing
    } catch (error) {
      console.error("Error preparing category for edit:", error);
      setError(error);
      return null;
    }
  }, []);

  // Handle form submission (both add and edit)
  const handleFormSubmit = useCallback(
    async (categoryName, categoryId = null) => {
      if (categoryId) {
        // Edit mode
        return await updateCategory(categoryId, categoryName);
      } else {
        // Add mode
        return await addCategory(categoryName);
      }
    },
    [addCategory, updateCategory]
  );

  // Handle search change
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Refresh categories data
  const refreshCategories = useCallback(() => {
    setError(null);
    // The real-time subscription will automatically refresh the data
    // This function exists for UI consistency
  }, []);

  // Get category statistics
  const getCategoryStats = useCallback(async () => {
    try {
      const stats = await categoryService.getCategoryStats();
      return stats;
    } catch (error) {
      console.error("Error getting category stats:", error);
      setError(error);
      return null;
    }
  }, [categoryService]);

  // Check if category name already exists
  const checkDuplicateCategory = useCallback(
    (categoryName, excludeId = null) => {
      return categories.some(
        (category) =>
          category.categoryName?.toLowerCase() === categoryName.toLowerCase() &&
          category.categoryId !== excludeId
      );
    },
    [categories]
  );

  // Get categories with item counts
  const getCategoriesWithItemCounts = useCallback(async () => {
    try {
      return await categoryService.getCategoriesWithItemCounts();
    } catch (error) {
      console.error("Error getting categories with item counts:", error);
      setError(error);
      return [];
    }
  }, [categoryService]);

  // Toggle category status (if supported)
  const toggleCategoryStatus = useCallback(
    async (categoryId, currentStatus) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        await categoryService.updateCategoryStatus(
          categoryId,
          newStatus,
          adminId
        );
        toast.success(
          `Category ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully!`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return true;
      } catch (error) {
        console.error("Error toggling category status:", error);
        const errorMessage =
          error.message || "Error updating category status. Please try again.";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  return {
    // State
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,
    error,

    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    refreshCategories,
    toggleCategoryStatus,

    // Utilities
    getCategoryStats,
    checkDuplicateCategory,
    getCategoriesWithItemCounts,

    // Computed values
    categoryCount: categories.length,
    filteredCount: filteredCategories.length,
    hasCategories: categories.length > 0,
    hasSearchResults: filteredCategories.length > 0,
    activeCategories: categories.filter((cat) => cat.status === "active")
      .length,
    inactiveCategories: categories.filter((cat) => cat.status === "inactive")
      .length,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setCategories,
    setError,
  };
};

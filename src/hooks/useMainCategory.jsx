// useCategoryManager.js (OPTIMIZED)
import { useState, useEffect, useCallback, useMemo } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { createCategoryService } from "../services/api/mainCategoryService";

export const useMainCategory = (hotelName) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Memoize auth and service instances to prevent recreation
  const auth = useMemo(() => getAuth(), []);
  const adminId = useMemo(() => auth.currentUser?.uid, [auth.currentUser?.uid]);
  const categoryService = useMemo(
    () => createCategoryService(hotelName),
    [hotelName]
  );

  useEffect(() => {
    if (!hotelName) {
      setCategories([]);
      setLoading(false);
      return;
    }

    let unsubscribe;
    let isMounted = true; // Prevent state updates if component unmounted

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      unsubscribe = categoryService.subscribeToCategories((categoriesArray) => {
        if (!isMounted) return; // Component unmounted during callback
        setCategories(categoriesArray);
        setLoading(false);
        setError(null);
      });
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [hotelName, categoryService]); // Added categoryService to dependencies

  // Memoize filtered categories to prevent recalculation
  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

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
        const errorMessage =
          error.message || "Error adding category. Please try again.";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setError(errorMessage);
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
        const errorMessage =
          error.message || "Error updating category. Please try again.";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setError(errorMessage);
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
        const errorMessage =
          error.message || "Error deleting category. Please try again.";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [adminId, categoryService, submitting]
  );

  const prepareForEdit = useCallback(async (category) => {
    try {
      // No additional preparation needed, just return category
      return category;
    } catch (error) {
      console.error("Error preparing category for edit:", error);
      const errorMessage = error.message || "Error preparing category for edit";
      setError(errorMessage);
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

  // Memoize utility functions to prevent recreation
  const utilityFunctions = useMemo(
    () => ({
      checkDuplicateCategory: (name, excludeId = null) =>
        categories.some(
          (category) =>
            category.categoryName?.toLowerCase() === name.toLowerCase() &&
            category.categoryId !== excludeId
        ),

      getCategoryById: (categoryId) =>
        categories.find((category) => category.categoryId === categoryId),

      getCategoriesByName: (searchName) =>
        categories.filter((category) =>
          category.categoryName
            ?.toLowerCase()
            .includes(searchName.toLowerCase())
        ),

      validateCategoryName: (name) => {
        if (!name || !name.trim()) {
          return { valid: false, message: "Category name is required" };
        }
        if (name.trim().length < 2) {
          return {
            valid: false,
            message: "Category name must be at least 2 characters",
          };
        }
        if (name.trim().length > 50) {
          return {
            valid: false,
            message: "Category name must be less than 50 characters",
          };
        }
        return { valid: true };
      },

      sortCategories: (sortBy = "name", order = "asc") => {
        const sorted = [...categories].sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case "name":
              comparison = a.categoryName?.localeCompare(b.categoryName) || 0;
              break;
            case "created":
              comparison = new Date(a.createdAt) - new Date(b.createdAt);
              break;
            default:
              comparison = 0;
          }
          return order === "desc" ? -comparison : comparison;
        });
        return sorted;
      },

      clearAllFilters: () => {
        setSearchTerm("");
      },
    }),
    [categories]
  );

  // Memoize computed values to prevent recalculation
  const computedValues = useMemo(
    () => ({
      categoryCount: categories.length,
      filteredCount: filteredCategories.length,
      hasCategories: categories.length > 0,
      hasSearchResults: filteredCategories.length > 0,
      isEmpty: categories.length === 0,
      hasFilters: searchTerm.length > 0,
    }),
    [categories.length, filteredCategories.length, searchTerm.length]
  );

  // Memoize error handling functions
  const errorHandlers = useMemo(
    () => ({
      clearError: () => setError(null),

      handleError: (error, defaultMessage = "An error occurred") => {
        const errorMessage = error.message || defaultMessage;
        setError(errorMessage);
        console.error(errorMessage, error);
        return errorMessage;
      },
    }),
    []
  );

  return {
    // Data
    categories,
    filteredCategories,
    searchTerm,

    // State
    loading,
    submitting,
    error,

    // CRUD Actions
    addCategory,
    updateCategory,
    deleteCategory,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    refreshCategories,

    // Utility functions (memoized)
    ...utilityFunctions,

    // Computed values (memoized)
    ...computedValues,

    // Error handlers (memoized)
    ...errorHandlers,

    // Setters for advanced usage
    setSearchTerm,
    setCategories,
    setError,
  };
};

// hooks/useCategory.js (CORRECTED VERSION)
import { useState, useEffect, useCallback, useMemo } from "react";
import { categoryServices } from "../services/api/categoryService";

export const useCategory = (hotelName) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to categories using the service
  useEffect(() => {
    if (!hotelName) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = categoryServices.subscribeToCategories(
      hotelName,
      (categoriesData) => {
        setCategories(categoriesData || []);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [hotelName]);

  // Memoized filtered categories using service
  const filteredCategories = useMemo(() => {
    return categoryServices.filterCategories(categories, searchTerm);
  }, [categories, searchTerm]);

  // Add category using service
  const addCategory = useCallback(
    async (categoryName) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const result = await categoryServices.addCategory(
          hotelName,
          categoryName,
          categories
        );
        return result;
      } catch (err) {
        console.error("Error adding category:", err);
        setError(err.message || "Error adding category");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting, categories]
  );

  // Update category using service
  const updateCategory = useCallback(
    async (categoryName, categoryId) => {
      if (submitting) return false;
      if (!categoryId) {
        console.error("Category ID is required for update");
        setError("Category ID is required for update");
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        console.log("Hook - Updating category:", {
          categoryName,
          categoryId,
          hotelName,
        });
        const result = await categoryServices.updateCategory(
          hotelName,
          categoryId,
          categoryName,
          categories
        );
        return result;
      } catch (err) {
        console.error("Error updating category:", err);
        setError(err.message || "Error updating category");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting, categories]
  );

  // Delete category using service
  const deleteCategory = useCallback(
    async (category) => {
      if (submitting) return false;
      if (!category) {
        console.error("Category object is required for delete");
        setError("Category information is missing");
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        console.log("Hook - Deleting category:", category);
        const result = await categoryServices.deleteCategory(
          hotelName,
          category
        );
        return result;
      } catch (err) {
        console.error("Error deleting category:", err);
        setError(err.message || "Error deleting category");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Prepare category for editing using service
  const prepareForEdit = useCallback(
    async (category) => {
      try {
        console.log("Hook - Preparing for edit:", category);
        return await categoryServices.prepareForEdit(hotelName, category);
      } catch (err) {
        console.error("Error preparing category for edit:", err);
        setError(err.message || "Error preparing category for editing");
        return null;
      }
    },
    [hotelName]
  );

  // Handle form submission (add or update)
  const handleFormSubmit = useCallback(
    async (categoryName, categoryId = null) => {
      console.log("Hook - Form submit:", { categoryName, categoryId });

      if (categoryId) {
        return await updateCategory(categoryName, categoryId);
      } else {
        return await addCategory(categoryName);
      }
    },
    [addCategory, updateCategory]
  );

  // Handle search change
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term || "");
  }, []);

  // Refresh categories function - FIXED
  const refreshCategories = useCallback(async () => {
    if (!hotelName) return [];

    try {
      setLoading(true);
      setError(null);
      const categoriesData = await categoryServices.getCategories(hotelName);
      setCategories(categoriesData || []);
      return categoriesData;
    } catch (err) {
      console.error("Error refreshing categories:", err);
      setError(err.message || "Error refreshing categories");
      return [];
    } finally {
      setLoading(false);
    }
  }, [hotelName]);

  // Get category stats using service
  const getCategoryStats = useCallback(async () => {
    try {
      return await categoryServices.getCategoryStats(hotelName);
    } catch (err) {
      console.error("Error getting category stats:", err);
      return null;
    }
  }, [hotelName]);

  // Check duplicate category
  const checkDuplicateCategory = useMemo(() => {
    return (name, excludeId = null) => {
      if (!name || !categories) return false;
      return categories.some(
        (c) =>
          (c?.categoryName || "").toLowerCase() === name.toLowerCase() &&
          (c.categoryId || c.id) !== excludeId
      );
    };
  }, [categories]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Memoized computed values - FIXED
  const computedValues = useMemo(
    () => ({
      categoryCount: categories?.length || 0,
      filteredCount: filteredCategories?.length || 0,
      hasCategories: (categories?.length || 0) > 0,
      hasSearchResults: (filteredCategories?.length || 0) > 0,
    }),
    [categories, filteredCategories]
  );

  return {
    // Data
    categories: categories || [],
    filteredCategories: filteredCategories || [],
    searchTerm,

    // State
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
    refreshCategories, // NOW PROPERLY INCLUDED

    // Utility functions
    getCategoryStats,
    checkDuplicateCategory,
    clearAllFilters,

    // Computed values - PROPERLY SPREAD
    categoryCount: computedValues.categoryCount,
    filteredCount: computedValues.filteredCount,
    hasCategories: computedValues.hasCategories,
    hasSearchResults: computedValues.hasSearchResults,

    // Setters (if needed for direct manipulation)
    setSearchTerm,
    setCategories,
    setError,
  };
};

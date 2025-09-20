import { useState, useEffect, useCallback } from "react";
import { categoryServices } from "../services/api/categoryService";

export const useCategory = (hotelName) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Subscribe to categories data
  useEffect(() => {
    if (!hotelName) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = categoryServices.subscribeToCategories(
      hotelName,
      (data) => {
        setCategories(data);
        setLoading(false);
      }
    );

    // Cleanup subscription on component unmount or hotelName change
    return () => unsubscribe();
  }, [hotelName]);

  // Filter categories based on search term
  const filteredCategories = categoryServices.filterCategories(
    categories,
    searchTerm
  );

  // Add new category
  const addCategory = useCallback(
    async (categoryName) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await categoryServices.addCategory(
          hotelName,
          categoryName,
          categories
        );
        return success;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, categories, submitting]
  );

  // Update existing category
  const updateCategory = useCallback(
    async (categoryName, categoryId) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await categoryServices.updateCategory(
          hotelName,
          categoryId,
          categoryName,
          categories
        );
        return success;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, categories, submitting]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (category) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await categoryServices.deleteCategory(
          hotelName,
          category
        );
        return success;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Prepare category for editing
  const prepareForEdit = useCallback(
    async (category) => {
      const categoryToEdit = await categoryServices.prepareForEdit(
        hotelName,
        category
      );
      return categoryToEdit;
    },
    [hotelName]
  );

  // Handle form submission (both add and edit)
  const handleFormSubmit = useCallback(
    async (categoryName, categoryId = null) => {
      if (categoryId) {
        // Edit mode
        return await updateCategory(categoryName, categoryId);
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

  // Get category statistics
  const getCategoryStats = useCallback(async () => {
    return await categoryServices.getCategoryStats(hotelName);
  }, [hotelName]);

  // Check if category name already exists
  const checkDuplicateCategory = useCallback(
    (categoryName, excludeId = null) => {
      return categories.some(
        (category) =>
          category.categoryName.toLowerCase() === categoryName.toLowerCase() &&
          category.categoryId !== excludeId
      );
    },
    [categories]
  );

  return {
    // State
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,

    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,

    // Utilities
    getCategoryStats,
    checkDuplicateCategory,

    // Computed values
    categoryCount: categories.length,
    filteredCount: filteredCategories.length,
    hasCategories: categories.length > 0,
    hasSearchResults: filteredCategories.length > 0,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setCategories,
  };
};

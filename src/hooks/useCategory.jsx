// useCategory.js
import { useState, useEffect, useCallback } from "react";
import { categoryServices } from "../services/api/categoryService";

export const useCategory = (hotelName) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

    return () => unsubscribe();
  }, [hotelName]);

  const filteredCategories = categoryServices.filterCategories(
    categories,
    searchTerm
  );

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

  const prepareForEdit = useCallback(
    async (category) => {
      return await categoryServices.prepareForEdit(hotelName, category);
    },
    [hotelName]
  );

  const handleFormSubmit = useCallback(
    async (categoryName, categoryId = null) => {
      if (categoryId) {
        return await updateCategory(categoryName, categoryId);
      } else {
        return await addCategory(categoryName);
      }
    },
    [addCategory, updateCategory]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const getCategoryStats = useCallback(async () => {
    return await categoryServices.getCategoryStats(hotelName);
  }, [hotelName]);

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
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,
    addCategory,
    updateCategory,
    deleteCategory,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    getCategoryStats,
    checkDuplicateCategory,
    categoryCount: categories.length,
    filteredCount: filteredCategories.length,
    hasCategories: categories.length > 0,
    hasSearchResults: filteredCategories.length > 0,
    setSearchTerm,
    setCategories,
  };
};

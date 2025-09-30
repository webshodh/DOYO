// hooks/useCategory.js (FIXED)

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";

export const useCategory = (hotelName) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to Firestore categories collection
  useEffect(() => {
    if (!hotelName) {
      setCategories([]);
      setLoading(false);
      return;
    }

    let unsubscribe;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      const colRef = collection(db, `hotels/${hotelName}/categories`);
      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const categoriesData = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setCategories(categoriesData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching categories:", err);
          const errorMessage = err.message || "Error fetching categories";
          setError(errorMessage);
          setLoading(false);
        }
      );
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [hotelName]);

  // Memoized filtered categories with null safety
  const filteredCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    return categories.filter((category) => {
      // Add null safety checks
      const categoryName = category?.categoryName || "";
      const searchLower = (searchTerm || "").toLowerCase();
      return categoryName.toLowerCase().includes(searchLower);
    });
  }, [categories, searchTerm]);

  // Add category
  const addCategory = useCallback(
    async (categoryName) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        await addDoc(collection(db, `hotels/${hotelName}/categories`), {
          categoryName,
          createdAt: new Date(),
        });
        return true;
      } catch (err) {
        console.error("Error adding category:", err);
        const errorMessage = err.message || "Error adding category";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Update category
  const updateCategory = useCallback(
    async (categoryName, categoryId) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const docRef = doc(db, `hotels/${hotelName}/categories`, categoryId);
        await updateDoc(docRef, { categoryName });
        return true;
      } catch (err) {
        console.error("Error updating category:", err);
        const errorMessage = err.message || "Error updating category";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (categoryId) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const docRef = doc(db, `hotels/${hotelName}/categories`, categoryId);
        await deleteDoc(docRef);
        return true;
      } catch (err) {
        console.error("Error deleting category:", err);
        const errorMessage = err.message || "Error deleting category";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const prepareForEdit = useCallback(async (category) => {
    return { id: category.id, categoryName: category.categoryName || "" };
  }, []);

  const handleFormSubmit = useCallback(
    (categoryName, categoryId = null) =>
      categoryId
        ? updateCategory(categoryName, categoryId)
        : addCategory(categoryName),
    [addCategory, updateCategory]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term || "");
  }, []);

  // Memoize duplicate check function with null safety
  const checkDuplicateCategory = useMemo(() => {
    return (name, excludeId = null) => {
      if (!name || !categories) return false;
      return categories.some(
        (c) =>
          (c?.categoryName || "").toLowerCase() === name.toLowerCase() &&
          c.id !== excludeId
      );
    };
  }, [categories]);

  // Memoize category stats with null safety
  const getCategoryStats = useMemo(() => {
    return () => ({
      total: categories?.length || 0,
      filtered: filteredCategories?.length || 0,
    });
  }, [categories?.length, filteredCategories?.length]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Memoize computed values with null safety
  const computedValues = useMemo(
    () => ({
      categoryCount: categories?.length || 0,
      filteredCount: filteredCategories?.length || 0,
      hasCategories: (categories?.length || 0) > 0,
      hasSearchResults: (filteredCategories?.length || 0) > 0,
    }),
    [categories?.length, filteredCategories?.length]
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

    // Utility functions (memoized)
    getCategoryStats,
    checkDuplicateCategory,
    clearAllFilters,

    // Computed values (memoized)
    ...computedValues,

    // Setters
    setSearchTerm,
    setCategories,
    setError,
  };
};

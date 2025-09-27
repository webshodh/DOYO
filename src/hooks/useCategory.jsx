// hooks/useCategory.js

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

    setLoading(true);
    setError(null);

    const colRef = collection(db, `hotels/${hotelName}/categories`);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching categories:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hotelName]);

  // Memoized filtered categories
  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [categories, searchTerm]
  );

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
        setError(err);
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
        setError(err);
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
        setError(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const prepareForEdit = useCallback(async (category) => {
    return { id: category.id, categoryName: category.categoryName };
  }, []);

  const handleFormSubmit = useCallback(
    (categoryName, categoryId = null) =>
      categoryId
        ? updateCategory(categoryName, categoryId)
        : addCategory(categoryName),
    [addCategory, updateCategory]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const checkDuplicateCategory = useCallback(
    (name, excludeId = null) =>
      categories.some(
        (c) =>
          c.categoryName.toLowerCase() === name.toLowerCase() &&
          c.id !== excludeId
      ),
    [categories]
  );

  const getCategoryStats = useCallback(
    () => ({ total: categories.length, filtered: filteredCategories.length }),
    [categories, filteredCategories]
  );

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
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

    getCategoryStats,
    checkDuplicateCategory,
    clearAllFilters,

    categoryCount: categories.length,
    filteredCount: filteredCategories.length,
    hasCategories: categories.length > 0,
    hasSearchResults: filteredCategories.length > 0,
    setSearchTerm,
    setCategories,
  };
};

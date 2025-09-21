// src/hooks/useCategory.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { categoryServices } from "../services/api/categoryService";
import { useAuth } from "../context/AuthContext";
import { useHotelContext } from "../context/HotelContext";

export const useCategory = (hotelName) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // ✅ NEW: Additional state for enhanced functionality
  const [sortOrder, setSortOrder] = useState("name_asc");
  const [retryCount, setRetryCount] = useState(0);

  // Refs for cleanup
  const unsubscribeRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // Context hooks for enhanced functionality
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // ✅ ENHANCED: Auto-use selected hotel if no hotelName provided
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Subscribe to categories data
  useEffect(() => {
    if (!activeHotelName) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Clear previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Clear previous error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    const unsubscribe = categoryServices.subscribeToCategories(
      activeHotelName,
      (data) => {
        setCategories(data || []);
        setLoading(false);
        setError(null);
        setLastFetch(new Date());
        setRetryCount(0);
      },
      (error) => {
        console.error("Category subscription error:", error);
        setError(error);
        setLoading(false);
        setRetryCount((prev) => prev + 1);
      }
    );

    unsubscribeRef.current = unsubscribe;

    // ✅ ENHANCED: Connection timeout with retry logic
    errorTimeoutRef.current = setTimeout(() => {
      if (loading && retryCount < 3) {
        setError(
          new Error(
            "Taking longer than expected to load categories. Retrying..."
          )
        );
        setRetryCount((prev) => prev + 1);
      } else if (retryCount >= 3) {
        setError(
          new Error("Failed to load categories after multiple attempts")
        );
        setLoading(false);
      }
    }, 15000);

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, [activeHotelName, retryCount]);

  // ✅ ENHANCED: Filter and sort categories
  const getFilteredAndSortedCategories = useCallback(() => {
    let filtered = categoryServices.filterCategories(categories, searchTerm);

    // Apply sorting
    switch (sortOrder) {
      case "name_asc":
        filtered.sort((a, b) =>
          (a.categoryName || "").localeCompare(b.categoryName || "")
        );
        break;
      case "name_desc":
        filtered.sort((a, b) =>
          (b.categoryName || "").localeCompare(a.categoryName || "")
        );
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt || 0);
          return dateA - dateB;
        });
        break;
      case "usage":
        // Sort by menu count (requires category stats)
        filtered.sort((a, b) => (b.menuCount || 0) - (a.menuCount || 0));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [categories, searchTerm, sortOrder]);

  const filteredCategories = getFilteredAndSortedCategories();

  // ✅ ENHANCED: Add new category with validation
  const addCategory = useCallback(
    async (categoryName) => {
      if (submitting) return false;

      // Additional client-side validation
      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      if (!categoryName?.trim()) {
        setError(new Error("Category name is required"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await categoryServices.addCategory(
          activeHotelName,
          categoryName,
          categories
        );

        if (success) {
          // Clear search to show new category
          setSearchTerm("");
        }

        return success;
      } catch (error) {
        console.error("Error in addCategory:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, categories, submitting]
  );

  // Update existing category
  const updateCategory = useCallback(
    async (categoryName, categoryId) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      if (!categoryName?.trim()) {
        setError(new Error("Category name is required"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await categoryServices.updateCategory(
          activeHotelName,
          categoryId,
          categoryName,
          categories
        );
        return success;
      } catch (error) {
        console.error("Error in updateCategory:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, categories, submitting]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (category) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await categoryServices.deleteCategory(
          activeHotelName,
          category
        );
        return success;
      } catch (error) {
        console.error("Error in deleteCategory:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // ✅ NEW: Toggle category status (if supported by your service)
  const toggleCategoryStatus = useCallback(
    async (categoryId, currentStatus) => {
      if (submitting) return false;

      setSubmitting(true);
      setError(null);

      try {
        const success = await categoryServices.toggleCategoryStatus?.(
          activeHotelName,
          categoryId,
          currentStatus
        );
        return success;
      } catch (error) {
        console.error("Error in toggleCategoryStatus:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // Prepare category for editing
  const prepareForEdit = useCallback(
    async (category) => {
      try {
        const categoryToEdit = await categoryServices.prepareForEdit(
          activeHotelName,
          category
        );
        return categoryToEdit;
      } catch (error) {
        console.error("Error in prepareForEdit:", error);
        setError(error);
        return null;
      }
    },
    [activeHotelName]
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

  // ✅ NEW: Handle sorting change
  const handleSortChange = useCallback((order) => {
    setSortOrder(order);
  }, []);

  // ✅ NEW: Clear search and filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSortOrder("name_asc");
  }, []);

  // ✅ ENHANCED: Refresh categories data with retry logic
  const refreshCategories = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setLastFetch(new Date());
    // The real-time subscription will automatically refresh the data
  }, []);

  // Get category statistics
  const getCategoryStats = useCallback(async () => {
    try {
      return await categoryServices.getCategoryStats(activeHotelName);
    } catch (error) {
      console.error("Error getting category stats:", error);
      setError(error);
      return null;
    }
  }, [activeHotelName]);

  // Check if category name already exists
  const checkDuplicateCategory = useCallback(
    (categoryName, excludeId = null) => {
      return categories.some(
        (category) =>
          category.categoryName?.toLowerCase() ===
            categoryName?.toLowerCase() &&
          category.categoryId !== excludeId &&
          category.id !== excludeId
      );
    },
    [categories]
  );

  // ✅ NEW: Get category by ID
  const getCategoryById = useCallback(
    (categoryId) => {
      return categories.find(
        (c) => c.categoryId === categoryId || c.id === categoryId
      );
    },
    [categories]
  );

  // ✅ NEW: Get category by name
  const getCategoryByName = useCallback(
    (categoryName) => {
      return categories.find(
        (c) => c.categoryName?.toLowerCase() === categoryName?.toLowerCase()
      );
    },
    [categories]
  );

  // ✅ NEW: Get category options for dropdowns
  const getCategoryOptions = useCallback(() => {
    return categories.map((category) => ({
      value: category.categoryId || category.id,
      label: category.categoryName,
      category: category,
    }));
  }, [categories]);

  // ✅ NEW: Get categories with menu counts
  const getCategoriesWithMenuCounts = useCallback(async () => {
    try {
      const stats = await getCategoryStats();
      if (!stats) return categories;

      return categories.map((category) => ({
        ...category,
        menuCount: stats.categoryUsage[category.categoryName] || 0,
      }));
    } catch (error) {
      console.error("Error getting categories with menu counts:", error);
      return categories;
    }
  }, [categories, getCategoryStats]);

  // ✅ NEW: Bulk operations
  const bulkDeleteCategories = useCallback(
    async (categoryIds) => {
      if (submitting || !categoryIds.length) return false;

      setSubmitting(true);
      setError(null);

      try {
        const promises = categoryIds.map((id) => {
          const category = getCategoryById(id);
          return category
            ? categoryServices.deleteCategory(activeHotelName, category)
            : Promise.resolve(false);
        });

        const results = await Promise.allSettled(promises);
        const failures = results.filter(
          (r) => r.status === "rejected" || r.value === false
        );

        if (failures.length > 0) {
          console.warn("Some bulk operations failed:", failures);
        }

        return failures.length === 0;
      } catch (error) {
        console.error("Error in bulk delete:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting, getCategoryById]
  );

  // ✅ NEW: Export categories data
  const exportCategories = useCallback(() => {
    const dataToExport = filteredCategories.map((category) => ({
      Name: category.categoryName,
      "Created Date": category.createdAt?.toDate
        ? category.createdAt.toDate().toLocaleDateString()
        : new Date(category.createdAt).toLocaleDateString(),
      Status: category.isActive ? "Active" : "Inactive",
    }));

    return dataToExport;
  }, [filteredCategories]);

  // ✅ NEW: Validate category operations
  const canDeleteCategory = useCallback(
    async (categoryId) => {
      try {
        const category = getCategoryById(categoryId);
        if (!category) return false;

        const isInUse = await categoryServices.checkCategoryUsage?.(
          activeHotelName,
          category.categoryName
        );

        return !isInUse;
      } catch (error) {
        console.error("Error checking if category can be deleted:", error);
        return false;
      }
    },
    [activeHotelName, getCategoryById]
  );

  return {
    // State
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,
    error,
    lastFetch,
    retryCount,
    sortOrder,

    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    handleSortChange,
    refreshCategories,
    clearFilters,

    // Utilities
    getCategoryStats,
    checkDuplicateCategory,
    getCategoryById,
    getCategoryByName,
    getCategoryOptions,
    getCategoriesWithMenuCounts,
    bulkDeleteCategories,
    exportCategories,
    canDeleteCategory,

    // Computed values
    categoryCount: categories.length,
    filteredCount: filteredCategories.length,
    hasCategories: categories.length > 0,
    hasSearchResults: filteredCategories.length > 0,
    hasFiltersApplied: searchTerm || sortOrder !== "name_asc",

    // ✅ NEW: Additional computed values
    connectionStatus: error ? "error" : loading ? "connecting" : "connected",
    isRetrying: retryCount > 0 && loading,
    canRetry: retryCount < 3 && error,
    dataAge: lastFetch ? Date.now() - lastFetch.getTime() : null,

    // Meta info
    activeHotelName,
    currentUser,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setCategories,
    setError,
    setSortOrder,
  };
};

// ✅ NEW: Hook for category selection/management in forms
export const useCategorySelection = (hotelName) => {
  const {
    categories,
    loading,
    error,
    getCategoryOptions,
    getCategoryById,
    getCategoryByName,
  } = useCategory(hotelName);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const selectCategory = useCallback(
    (categoryId) => {
      const category = getCategoryById(categoryId);
      if (category && !selectedCategories.find((c) => c.id === categoryId)) {
        setSelectedCategories((prev) => [...prev, category]);
      }
    },
    [getCategoryById, selectedCategories]
  );

  const unselectCategory = useCallback((categoryId) => {
    setSelectedCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const isSelected = useCallback(
    (categoryId) => {
      return selectedCategories.some((c) => c.id === categoryId);
    },
    [selectedCategories]
  );

  return {
    categories,
    loading,
    error,
    selectedCategories,
    categoryOptions: getCategoryOptions(),
    selectCategory,
    unselectCategory,
    clearSelection,
    isSelected,
    hasSelection: selectedCategories.length > 0,
    selectionCount: selectedCategories.length,
  };
};

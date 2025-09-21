// src/hooks/useMenu.jsx
import { useState, useEffect, useCallback, useRef } from "react";
// ✅ FIRESTORE IMPORTS (replacing Realtime Database)
import { db } from "../services/firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { menuServices } from "../services/api/menuService";
import { useAuth } from "../context/AuthContext";
import { useHotelContext } from "../context/HotelContext";

export const useMenu = (hotelName) => {
  // State management
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NEW: Additional state for enhanced functionality
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [filterStatus, setFilterStatus] = useState("all"); // all, available, unavailable
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  // Refs for cleanup
  const menuUnsubscribeRef = useRef(null);
  const categoryUnsubscribeRef = useRef(null);
  const mainCategoryUnsubscribeRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  // Context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // ✅ ENHANCED: Auto-use selected hotel if no hotelName provided
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // ✅ FIRESTORE: Subscribe to menus data
  useEffect(() => {
    if (!activeHotelName) {
      setMenus([]);
      setLoading(false);
      setConnectionStatus("disconnected");
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionStatus("connecting");

    // Clear previous subscription
    if (menuUnsubscribeRef.current) {
      menuUnsubscribeRef.current();
    }

    // Clear previous error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    try {
      const menusRef = collection(db, `hotels/${activeHotelName}/menu`);
      const q = query(menusRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const menuData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setMenus(menuData);
          setLoading(false);
          setError(null);
          setConnectionStatus("connected");
          setLastFetch(new Date());
          setRetryCount(0);
        },
        (error) => {
          console.error("Error fetching menus:", error);
          setError(error);
          setLoading(false);
          setConnectionStatus("error");
          setRetryCount((prev) => prev + 1);
        }
      );

      menuUnsubscribeRef.current = unsubscribe;

      // ✅ ENHANCED: Connection timeout with retry logic
      errorTimeoutRef.current = setTimeout(() => {
        if (loading && retryCount < 3) {
          setError(
            new Error(
              "Taking longer than expected to load menu items. Retrying..."
            )
          );
          setRetryCount((prev) => prev + 1);
        } else if (retryCount >= 3) {
          setError(
            new Error("Failed to load menu items after multiple attempts")
          );
          setLoading(false);
          setConnectionStatus("error");
        }
      }, 15000);
    } catch (error) {
      console.error("Error setting up menu subscription:", error);
      setError(error);
      setLoading(false);
      setConnectionStatus("error");
    }

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      if (menuUnsubscribeRef.current) {
        menuUnsubscribeRef.current();
        menuUnsubscribeRef.current = null;
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, [activeHotelName, retryCount]);

  // ✅ FIRESTORE: Subscribe to categories data
  useEffect(() => {
    if (!activeHotelName) {
      setCategories([]);
      return;
    }

    // Clear previous subscription
    if (categoryUnsubscribeRef.current) {
      categoryUnsubscribeRef.current();
    }

    try {
      const categoriesRef = collection(
        db,
        `hotels/${activeHotelName}/categories`
      );
      const q = query(categoriesRef, orderBy("categoryName", "asc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const categoryData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoryData);
        },
        (error) => {
          console.error("Error fetching categories:", error);
          setError(error);
        }
      );

      categoryUnsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("Error setting up categories subscription:", error);
      setError(error);
    }

    return () => {
      if (categoryUnsubscribeRef.current) {
        categoryUnsubscribeRef.current();
        categoryUnsubscribeRef.current = null;
      }
    };
  }, [activeHotelName]);

  // ✅ FIRESTORE: Subscribe to main categories data
  useEffect(() => {
    if (!activeHotelName) {
      setMainCategories([]);
      return;
    }

    // Clear previous subscription
    if (mainCategoryUnsubscribeRef.current) {
      mainCategoryUnsubscribeRef.current();
    }

    try {
      const mainCategoriesRef = collection(
        db,
        `hotels/${activeHotelName}/mainCategories`
      );
      const q = query(mainCategoriesRef, orderBy("mainCategoryName", "asc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const mainCategoryData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMainCategories(mainCategoryData);
        },
        (error) => {
          console.error("Error fetching main categories:", error);
          // Don't set error for main categories as it's not critical
          console.warn(
            "Main categories failed to load, continuing without them"
          );
        }
      );

      mainCategoryUnsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("Error setting up main categories subscription:", error);
      // Don't set error for main categories
    }

    return () => {
      if (mainCategoryUnsubscribeRef.current) {
        mainCategoryUnsubscribeRef.current();
        mainCategoryUnsubscribeRef.current = null;
      }
    };
  }, [activeHotelName]);

  // Calculate menu counts by category
  useEffect(() => {
    const counts = menuServices.calculateMenuCountsByCategory(menus);
    setMenuCountsByCategory(counts);
  }, [menus]);

  // ✅ ENHANCED: Filter and sort menus with additional filters
  const getFilteredAndSortedMenus = useCallback(() => {
    let filtered = menuServices.filterAndSortMenus(
      menus,
      searchTerm,
      selectedCategory,
      sortOrder
    );

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((menu) => {
        if (filterStatus === "available")
          return menu.availability === "Available";
        if (filterStatus === "unavailable")
          return menu.availability === "Unavailable";
        return true;
      });
    }

    // Apply price range filter
    filtered = filtered.filter((menu) => {
      const price = parseFloat(menu.finalPrice || menu.menuPrice || 0);
      return price >= priceRange.min && price <= priceRange.max;
    });

    return filtered;
  }, [
    menus,
    searchTerm,
    selectedCategory,
    sortOrder,
    filterStatus,
    priceRange,
  ]);

  const filteredAndSortedMenus = getFilteredAndSortedMenus();

  // ✅ ENHANCED: Add new menu with validation
  const addMenu = useCallback(
    async (menuData) => {
      if (submitting) return false;

      // Additional client-side validation
      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      if (!menuData.menuName?.trim()) {
        setError(new Error("Menu name is required"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await menuServices.addMenu(
          menuData,
          activeHotelName,
          currentAdminId
        );

        if (success) {
          // Clear search to show new menu
          setSearchTerm("");
          setSelectedCategory("");
          setActiveCategory("");
        }

        return success;
      } catch (error) {
        console.error("Error in addMenu:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, currentAdminId, submitting]
  );

  // Update existing menu
  const updateMenu = useCallback(
    async (menuData, menuId) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await menuServices.updateMenu(
          menuData,
          menuId,
          activeHotelName,
          currentAdminId
        );
        return success;
      } catch (error) {
        console.error("Error in updateMenu:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, currentAdminId, submitting]
  );

  // Delete menu
  const deleteMenu = useCallback(
    async (menuId) => {
      if (submitting) return false;

      if (!activeHotelName) {
        setError(new Error("No hotel selected"));
        return false;
      }

      setSubmitting(true);
      setError(null);

      try {
        const success = await menuServices.deleteMenu(menuId, activeHotelName);
        return success;
      } catch (error) {
        console.error("Error in deleteMenu:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // ✅ ENHANCED: Toggle menu availability with better service integration
  const toggleMenuAvailability = useCallback(
    async (menuId, currentAvailability) => {
      if (submitting) return false;

      setSubmitting(true);
      setError(null);

      try {
        const success = await menuServices.toggleMenuAvailability?.(
          menuId,
          activeHotelName,
          currentAvailability
        );
        return success;
      } catch (error) {
        console.error("Error in toggleMenuAvailability:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // Prepare menu for editing
  const prepareForEdit = useCallback(
    async (menu) => {
      try {
        const menuToEdit = await menuServices.prepareForEdit?.(
          activeHotelName,
          menu
        );
        return menuToEdit || menu; // Fallback to original menu if service doesn't exist
      } catch (error) {
        console.error("Error in prepareForEdit:", error);
        setError(error);
        return menu; // Return original menu as fallback
      }
    },
    [activeHotelName]
  );

  // Handle form submission (both add and edit)
  const handleFormSubmit = useCallback(
    async (menuData, menuId = null) => {
      if (menuId) {
        // Edit mode
        return await updateMenu(menuData, menuId);
      } else {
        // Add mode
        return await addMenu(menuData);
      }
    },
    [addMenu, updateMenu]
  );

  // Filter handlers with useCallback
  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
    setActiveCategory(category);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleSortChange = useCallback((order) => {
    setSortOrder(order);
  }, []);

  // ✅ NEW: Handle status filter
  const handleStatusFilter = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  // ✅ NEW: Handle price range filter
  const handlePriceRangeChange = useCallback((min, max) => {
    setPriceRange({ min, max });
  }, []);

  // ✅ ENHANCED: Refresh menus data with retry logic
  const refreshMenus = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setLastFetch(new Date());
    setConnectionStatus("connecting");
    // The real-time subscription will automatically refresh the data
  }, []);

  // Get menu statistics
  const getMenuStats = useCallback(async () => {
    try {
      return await menuServices.getMenuStats?.(activeHotelName);
    } catch (error) {
      console.error("Error getting menu stats:", error);
      setError(error);
      return null;
    }
  }, [activeHotelName]);

  // Check if menu name already exists
  const checkDuplicateMenu = useCallback(
    (menuName, excludeId = null) => {
      return menus.some(
        (menu) =>
          menu.menuName?.toLowerCase() === menuName.toLowerCase() &&
          menu.uuid !== excludeId &&
          menu.id !== excludeId &&
          menu._id !== excludeId
      );
    },
    [menus]
  );

  // Get menus by category
  const getMenusByCategory = useCallback(
    (categoryName) => {
      return menus.filter((menu) => menu.menuCategory === categoryName);
    },
    [menus]
  );

  // Get available menus only
  const getAvailableMenus = useCallback(() => {
    return menus.filter((menu) => menu.availability === "Available");
  }, [menus]);

  // Get discounted menus
  const getDiscountedMenus = useCallback(() => {
    return menus.filter((menu) => menu.discount > 0);
  }, [menus]);

  // ✅ NEW: Get featured/popular menus
  const getFeaturedMenus = useCallback(() => {
    return menus.filter(
      (menu) =>
        menu.isPopular ||
        menu.chefSpecial ||
        menu.isRecommended ||
        menu.isMostOrdered
    );
  }, [menus]);

  // ✅ NEW: Get menus by price range
  const getMenusByPriceRange = useCallback(
    (minPrice, maxPrice) => {
      return menus.filter((menu) => {
        const price = parseFloat(menu.finalPrice || menu.menuPrice || 0);
        return price >= minPrice && price <= maxPrice;
      });
    },
    [menus]
  );

  // ✅ ENHANCED: Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setActiveCategory("");
    setSortOrder("default");
    setFilterStatus("all");
    setPriceRange({ min: 0, max: 10000 });
  }, []);

  // ✅ NEW: Bulk operations
  const bulkUpdateAvailability = useCallback(
    async (menuIds, availability) => {
      if (submitting || !menuIds.length) return false;

      setSubmitting(true);
      setError(null);

      try {
        const promises = menuIds.map((id) =>
          menuServices.toggleMenuAvailability?.(
            id,
            activeHotelName,
            availability === "Available" ? "Unavailable" : "Available"
          )
        );

        const results = await Promise.allSettled(promises);
        const failures = results.filter(
          (r) => r.status === "rejected" || r.value === false
        );

        if (failures.length > 0) {
          console.warn("Some bulk operations failed:", failures);
        }

        return failures.length === 0;
      } catch (error) {
        console.error("Error in bulk update:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // ✅ NEW: Export menus data
  const exportMenus = useCallback(() => {
    const dataToExport = filteredAndSortedMenus.map((menu) => ({
      Name: menu.menuName,
      Category: menu.menuCategory,
      Price: menu.menuPrice,
      "Final Price": menu.finalPrice,
      Availability: menu.availability,
      "Cooking Time": menu.menuCookingTime,
      Ingredients: menu.ingredients,
      "Created Date": menu.createdAt?.toDate
        ? menu.createdAt.toDate().toLocaleDateString()
        : new Date(menu.createdAt).toLocaleDateString(),
    }));

    return dataToExport;
  }, [filteredAndSortedMenus]);

  // ✅ NEW: Get menu by ID
  const getMenuById = useCallback(
    (menuId) => {
      return menus.find((m) => m.id === menuId || m.uuid === menuId);
    },
    [menus]
  );

  return {
    // State
    menus,
    categories,
    mainCategories,
    filteredAndSortedMenus,
    menuCountsByCategory,
    searchTerm,
    selectedCategory,
    sortOrder,
    activeCategory,
    loading,
    submitting,
    error,
    currentAdminId,
    lastFetch,
    retryCount,
    connectionStatus,
    filterStatus,
    priceRange,

    // Actions
    addMenu,
    updateMenu,
    deleteMenu,
    toggleMenuAvailability,
    prepareForEdit,
    handleFormSubmit,
    handleCategoryFilter,
    handleSearchChange,
    handleSortChange,
    handleStatusFilter,
    handlePriceRangeChange,
    refreshMenus,

    // Utilities
    getMenuStats,
    checkDuplicateMenu,
    getMenusByCategory,
    getAvailableMenus,
    getDiscountedMenus,
    getFeaturedMenus,
    getMenusByPriceRange,
    getMenuById,
    clearAllFilters,
    bulkUpdateAvailability,
    exportMenus,

    // Computed values
    menuCount: menus.length,
    filteredCount: filteredAndSortedMenus.length,
    hasMenus: menus.length > 0,
    hasSearchResults: filteredAndSortedMenus.length > 0,
    availableMenuCount: menus.filter(
      (menu) => menu.availability === "Available"
    ).length,
    unavailableMenuCount: menus.filter(
      (menu) => menu.availability === "Unavailable"
    ).length,
    categoryCount: categories.length,
    mainCategoryCount: mainCategories.length,

    // ✅ NEW: Additional computed values
    hasFiltersApplied:
      searchTerm ||
      selectedCategory ||
      filterStatus !== "all" ||
      priceRange.min > 0 ||
      priceRange.max < 10000,
    discountedMenuCount: menus.filter((menu) => menu.discount > 0).length,
    featuredMenuCount: menus.filter(
      (menu) =>
        menu.isPopular ||
        menu.chefSpecial ||
        menu.isRecommended ||
        menu.isMostOrdered
    ).length,
    averagePrice:
      menus.length > 0
        ? menus.reduce(
            (sum, menu) =>
              sum + (parseFloat(menu.finalPrice || menu.menuPrice) || 0),
            0
          ) / menus.length
        : 0,
    isRetrying: retryCount > 0 && loading,
    canRetry: retryCount < 3 && error,
    dataAge: lastFetch ? Date.now() - lastFetch.getTime() : null,

    // Meta info
    activeHotelName,
    currentUser,

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setSelectedCategory,
    setSortOrder,
    setActiveCategory,
    setMenus,
    setCategories,
    setMainCategories,
    setError,
    setFilterStatus,
    setPriceRange,
  };
};

// ✅ NEW: Hook for menu selection in forms
export const useMenuSelection = (hotelName) => {
  const {
    menus,
    categories,
    loading,
    error,
    getMenusByCategory,
    getAvailableMenus,
    getMenuById,
  } = useMenu(hotelName);

  const [selectedMenus, setSelectedMenus] = useState([]);

  const selectMenu = useCallback(
    (menuId) => {
      const menu = getMenuById(menuId);
      if (menu && !selectedMenus.find((m) => m.id === menuId)) {
        setSelectedMenus((prev) => [...prev, menu]);
      }
    },
    [getMenuById, selectedMenus]
  );

  const unselectMenu = useCallback((menuId) => {
    setSelectedMenus((prev) => prev.filter((m) => m.id !== menuId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMenus([]);
  }, []);

  const isSelected = useCallback(
    (menuId) => {
      return selectedMenus.some((m) => m.id === menuId);
    },
    [selectedMenus]
  );

  return {
    menus,
    categories,
    availableMenus: getAvailableMenus(),
    loading,
    error,
    selectedMenus,
    selectMenu,
    unselectMenu,
    clearSelection,
    isSelected,
    hasSelection: selectedMenus.length > 0,
    selectionCount: selectedMenus.length,
    getMenusByCategory,
  };
};

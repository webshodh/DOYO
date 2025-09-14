import { useState, useEffect, useCallback } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { menuServices } from "../services/menuService";

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

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  // Subscribe to menus data
  useEffect(() => {
    if (!hotelName) {
      setMenus([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const menuRef = ref(db, `/hotels/${hotelName}/menu`);
    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        const data = snapshot.val();
        setMenus(data ? Object.values(data) : []);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching menus:", error);
        setError(error);
        setLoading(false);
      }
    );

    // Handle potential connection errors
    const errorTimeout = setTimeout(() => {
      if (loading) {
        setError(new Error("Taking longer than expected to load menu items"));
        setLoading(false);
      }
    }, 10000);

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      unsubscribe();
      clearTimeout(errorTimeout);
    };
  }, [hotelName]);

  // Subscribe to categories data
  useEffect(() => {
    if (!hotelName) {
      setCategories([]);
      return;
    }

    const categoryRef = ref(db, `/hotels/${hotelName}/categories/`);
    const unsubscribe = onValue(
      categoryRef,
      (snapshot) => {
        const data = snapshot.val();
        setCategories(data ? Object.values(data) : []);
      },
      (error) => {
        console.error("Error fetching categories:", error);
        setError(error);
      }
    );

    return () => unsubscribe();
  }, [hotelName]);

  // Subscribe to main categories data
  useEffect(() => {
    if (!hotelName) {
      setMainCategories([]);
      return;
    }

    const mainCategoryRef = ref(db, `/hotels/${hotelName}/Maincategories/`);
    const unsubscribe = onValue(
      mainCategoryRef,
      (snapshot) => {
        const data = snapshot.val();
        setMainCategories(data ? Object.values(data) : []);
      },
      (error) => {
        console.error("Error fetching main categories:", error);
        setError(error);
      }
    );

    return () => unsubscribe();
  }, [hotelName]);

  // Calculate menu counts by category
  useEffect(() => {
    const counts = menuServices.calculateMenuCountsByCategory(menus);
    setMenuCountsByCategory(counts);
  }, [menus]);

  // Filter and sort menus
  const filteredAndSortedMenus = menuServices.filterAndSortMenus(
    menus,
    searchTerm,
    selectedCategory,
    sortOrder
  );

  // Add new menu
  const addMenu = useCallback(
    async (menuData) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await menuServices.addMenu(
          menuData,
          hotelName,
          currentAdminId
        );
        return success;
      } catch (error) {
        console.error("Error in addMenu:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, currentAdminId, submitting]
  );

  // Update existing menu
  const updateMenu = useCallback(
    async (menuData, menuId) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await menuServices.updateMenu(
          menuData,
          menuId,
          hotelName,
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
    [hotelName, currentAdminId, submitting]
  );

  // Delete menu
  const deleteMenu = useCallback(
    async (menuId) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const success = await menuServices.deleteMenu(menuId, hotelName);
        return success;
      } catch (error) {
        console.error("Error in deleteMenu:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Toggle menu availability
  const toggleMenuAvailability = useCallback(
    async (menuId, currentAvailability) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        const newAvailability =
          currentAvailability === "Available" ? "Unavailable" : "Available";
        const success = await menuServices.updateMenuAvailability(
          menuId,
          newAvailability,
          hotelName
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
    [hotelName, submitting]
  );

  // Prepare menu for editing
  const prepareForEdit = useCallback(
    async (menu) => {
      try {
        const menuToEdit = await menuServices.prepareForEdit(hotelName, menu);
        return menuToEdit;
      } catch (error) {
        console.error("Error in prepareForEdit:", error);
        setError(error);
        return null;
      }
    },
    [hotelName]
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

  // Refresh menus data
  const refreshMenus = useCallback(() => {
    setError(null);
    // The real-time subscription will automatically refresh the data
    // This function exists for UI consistency
  }, []);

  // Get menu statistics
  const getMenuStats = useCallback(async () => {
    try {
      return await menuServices.getMenuStats(hotelName);
    } catch (error) {
      console.error("Error getting menu stats:", error);
      setError(error);
      return null;
    }
  }, [hotelName]);

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

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setActiveCategory("");
    setSortOrder("default");
  }, []);

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
    refreshMenus,

    // Utilities
    getMenuStats,
    checkDuplicateMenu,
    getMenusByCategory,
    getAvailableMenus,
    getDiscountedMenus,
    clearAllFilters,

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

    // Direct setters (if needed for specific cases)
    setSearchTerm,
    setSelectedCategory,
    setSortOrder,
    setActiveCategory,
    setMenus,
    setCategories,
    setMainCategories,
    setError,
  };
};

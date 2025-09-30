
// hooks/useMenu.jsx (OPTIMIZED)

import { useState, useEffect, useCallback, useMemo } from "react";
import { menuServices } from "../services/api/menuService";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig"; // Firestore instance

export const useMenu = (hotelName) => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Real-time subscriptions (optimized)
  useEffect(() => {
    if (!hotelName) {
      setLoading(false);
      return;
    }

    let isMounted = true; // Prevent state updates if component unmounted
    const unsubscribes = [];

    const setupSubscriptions = () => {
      setLoading(true);
      setError(null);

      // Helper to subscribe to a collection with mounted check
      const subscribe = (path, setter) => {
        const ref = collection(db, path);
        const unsub = onSnapshot(
          ref,
          (snap) => {
            if (!isMounted) return; // Component unmounted during callback

            setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
          },
          (err) => {
            if (!isMounted) return; // Component unmounted during error

            console.error(`Error fetching ${path}:`, err);
            const errorMessage = err.message || `Error fetching ${path}`;
            setError(errorMessage);
            setLoading(false);
          }
        );
        unsubscribes.push(unsub);
      };

      subscribe(`hotels/${hotelName}/menu`, setMenus);
      subscribe(`hotels/${hotelName}/categories`, setCategories);
      subscribe(`hotels/${hotelName}/Maincategories`, setMainCategories);
    };

    setupSubscriptions();

    return () => {
      isMounted = false;
      unsubscribes.forEach((u) => u());
    };
  }, [hotelName]); // Only re-subscribe if hotelName changes

  // Memoize menu counts by category to prevent recalculation
  const menuCountsByCategory = useMemo(() => {
    return menuServices.calculateMenuCountsByCategory(menus);
  }, [menus]);

  // Memoize filtered and sorted menus
  const filteredAndSortedMenus = useMemo(
    () =>
      menuServices.filterAndSortMenus(
        menus,
        searchTerm,
        selectedCategory,
        sortOrder
      ),
    [menus, searchTerm, selectedCategory, sortOrder]
  );

  // Memoize auth user ID to prevent getAuth calls on every render
  const currentUserId = useMemo(() => {
    return getAuth().currentUser?.uid;
  }, []);

  // CRUD operations wrapped in useCallback to avoid recreating functions
  const addMenu = useCallback(
    async (menuData) => {
      setSubmitting(true);
      try {
        const adminId = currentUserId || getAuth().currentUser?.uid;
        return await menuServices.addMenu(menuData, hotelName, adminId);
      } catch (err) {
        console.error("Error in addMenu:", err);
        const errorMessage = err.message || "Error adding menu";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, currentUserId]
  );

  const updateMenu = useCallback(
    async (menuData, menuId) => {
      setSubmitting(true);
      try {
        const adminId = currentUserId || getAuth().currentUser?.uid;
        return await menuServices.updateMenu(
          menuData,
          menuId,
          hotelName,
          adminId
        );
      } catch (err) {
        console.error("Error in updateMenu:", err);
        const errorMessage = err.message || "Error updating menu";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, currentUserId]
  );

  const deleteMenu = useCallback(
    async (menuId) => {
      setSubmitting(true);
      try {
        return await menuServices.deleteMenu(menuId, hotelName);
      } catch (err) {
        console.error("Error in deleteMenu:", err);
        const errorMessage = err.message || "Error deleting menu";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName]
  );

  const toggleMenuAvailability = useCallback(
    async (menuId, currentAvailability) => {
      setSubmitting(true);
      try {
        const newAvail =
          currentAvailability === "Available" ? "Unavailable" : "Available";
        return await menuServices.updateMenuAvailability(
          menuId,
          newAvail,
          hotelName
        );
      } catch (err) {
        console.error("Error in toggleMenuAvailability:", err);
        const errorMessage = err.message || "Error toggling menu availability";
        setError(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName]
  );

  const prepareForEdit = useCallback(
    async (menu) => {
      try {
        return await menuServices.prepareForEdit(hotelName, menu);
      } catch (err) {
        console.error("Error in prepareForEdit:", err);
        const errorMessage = err.message || "Error preparing menu for edit";
        setError(errorMessage);
        return null;
      }
    },
    [hotelName]
  );

  const handleFormSubmit = useCallback(
    (menuData, menuId = null) =>
      menuId ? updateMenu(menuData, menuId) : addMenu(menuData),
    [addMenu, updateMenu]
  );

  // Filter, search, sort handlers
  const handleCategoryFilter = useCallback(
    (cat) => setSelectedCategory(cat),
    []
  );
  const handleSearchChange = useCallback((term) => setSearchTerm(term), []);
  const handleSortChange = useCallback((order) => setSortOrder(order), []);
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setActiveCategory("");
    setSortOrder("default");
  }, []);

  // Memoize utility functions to prevent recreation
  const utilityFunctions = useMemo(() => ({
    getMenuStats: async () => menuServices.getMenuStats(hotelName),

    checkDuplicateMenu: (name, excludeId = null) =>
      menus.some(
        (m) =>
          m.menuName?.toLowerCase() === name.toLowerCase() && m.id !== excludeId
      ),

    getMenusByCategory: (cat) => menus.filter((m) => m.menuCategory === cat),

    getAvailableMenus: () => menus.filter((m) => m.availability === "Available"),

    getDiscountedMenus: () => menus.filter((m) => m.discount > 0),
  }), [hotelName, menus]);

  // Memoize computed statistics to prevent recalculation
  const computedStats = useMemo(() => {
    const availableMenus = menus.filter((m) => m.availability === "Available");
    const unavailableMenus = menus.filter((m) => m.availability === "Unavailable");

    return {
      menuCount: menus.length,
      filteredCount: filteredAndSortedMenus.length,
      hasMenus: menus.length > 0,
      hasSearchResults: filteredAndSortedMenus.length > 0,
      availableMenuCount: availableMenus.length,
      unavailableMenuCount: unavailableMenus.length,
      categoryCount: categories.length,
      mainCategoryCount: mainCategories.length,
    };
  }, [
    menus.length, 
    filteredAndSortedMenus.length, 
    categories.length, 
    mainCategories.length,
    menus // Need full menus array for availability filtering
  ]);

  return {
    // Data
    menus,
    categories,
    mainCategories,
    filteredAndSortedMenus,
    menuCountsByCategory,
    searchTerm,
    selectedCategory,
    sortOrder,
    activeCategory,

    // State
    loading,
    submitting,
    error,

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
    clearAllFilters,

    // Utility functions (memoized)
    ...utilityFunctions,

    // Computed stats (memoized)
    ...computedStats,

    // Setters
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

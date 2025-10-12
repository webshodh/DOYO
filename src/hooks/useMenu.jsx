// hooks/useMenu.js (CORRECTED VERSION WITH IMPROVED FILTERING)
import { useState, useEffect, useCallback, useMemo } from "react";
import { menuServices } from "../services/api/menuService";
import { categoryServices } from "../services/api/categoryService";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

const firestore = getFirestore();

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

  // Real-time subscriptions
  useEffect(() => {
    if (!hotelName) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const unsubscribes = [];

    const setupSubscriptions = () => {
      setLoading(true);
      setError(null);

      // Subscribe to menus
      const menuUnsubscribe = menuServices.subscribeToMenus(
        hotelName,
        (menusData) => {
          if (!isMounted) return;
          console.log("Menus updated:", menusData?.length || 0);
          setMenus(menusData || []);
          setLoading(false);
        }
      );
      unsubscribes.push(menuUnsubscribe);

      // Subscribe to categories
      const categoryUnsubscribe = categoryServices.subscribeToCategories(
        hotelName,
        (categoriesData) => {
          if (!isMounted) return;
          console.log("Categories updated:", categoriesData?.length || 0);
          setCategories(categoriesData || []);
        }
      );
      unsubscribes.push(categoryUnsubscribe);

      // Subscribe to main categories
      const mainCategoriesRef = collection(
        firestore,
        `hotels/${hotelName}/Maincategories`
      );
      const mainCategoryUnsubscribe = onSnapshot(
        mainCategoriesRef,
        (snapshot) => {
          if (!isMounted) return;
          const mainCategoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log(
            "Main categories updated:",
            mainCategoriesData?.length || 0
          );
          setMainCategories(mainCategoriesData);
        },
        (err) => {
          if (!isMounted) return;
          console.error("Error fetching main categories:", err);
          setError(err.message || "Error fetching main categories");
        }
      );
      unsubscribes.push(mainCategoryUnsubscribe);
    };

    setupSubscriptions();

    return () => {
      isMounted = false;
      unsubscribes.forEach((unsub) => {
        if (typeof unsub === "function") {
          unsub();
        }
      });
    };
  }, [hotelName]);

  // Memoize menu counts by category - IMPROVED
  const menuCountsByCategory = useMemo(() => {
    console.log("Calculating menu counts, menus:", menus?.length || 0);

    if (!menus || menus.length === 0) {
      return {};
    }

    const counts = {};

    menus.forEach((menu) => {
      const categoryId = menu.menuCategory;
      const categoryName = menu.menuCategoryName || menu.categoryName;

      // Count by ID
      if (categoryId) {
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      }

      // Count by name
      if (categoryName) {
        counts[categoryName] = (counts[categoryName] || 0) + 1;
      }

      // Fallback to the category value itself
      if (!categoryId && !categoryName && menu.menuCategory) {
        counts[menu.menuCategory] = (counts[menu.menuCategory] || 0) + 1;
      }
    });

    console.log("Menu counts by category:", counts);
    return counts;
  }, [menus]);

  // IMPROVED: Custom filtering function that handles both ID and name matching
  const filterMenusByCategory = useCallback((menusList, category) => {
    if (!category || category === "" || category === "All") {
      return menusList;
    }

    return menusList.filter((menu) => {
      const menuCategoryId = menu.menuCategory;
      const menuCategoryName = menu.menuCategoryName || menu.categoryName;

      // Check direct matches
      if (menuCategoryId === category || menuCategoryName === category) {
        return true;
      }

      // Check if category matches any variation
      if (menu.menuCategory === category) {
        return true;
      }

      // Case-insensitive string comparison for names
      if (
        typeof menuCategoryName === "string" &&
        typeof category === "string"
      ) {
        return menuCategoryName.toLowerCase() === category.toLowerCase();
      }

      return false;
    });
  }, []);

  // IMPROVED: Memoized filtered and sorted menus
  const filteredAndSortedMenus = useMemo(() => {
    console.log(
      "Filtering menus - selectedCategory:",
      selectedCategory,
      "searchTerm:",
      searchTerm
    );

    let filtered = [...menus];

    // Apply category filter
    if (
      selectedCategory &&
      selectedCategory !== "" &&
      selectedCategory !== "All"
    ) {
      filtered = filterMenusByCategory(filtered, selectedCategory);
      console.log("After category filter:", filtered.length);
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((menu) => {
        const menuName = (menu.menuName || "").toLowerCase();
        const categoryName = (
          menu.menuCategoryName ||
          menu.categoryName ||
          menu.menuCategory ||
          ""
        ).toLowerCase();
        const description = (
          menu.menuDescription ||
          menu.description ||
          ""
        ).toLowerCase();

        return (
          menuName.includes(searchLower) ||
          categoryName.includes(searchLower) ||
          description.includes(searchLower)
        );
      });
      console.log("After search filter:", filtered.length);
    }

    // Apply sorting
    if (sortOrder && sortOrder !== "default") {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOrder) {
          case "name-asc":
            return (a.menuName || "").localeCompare(b.menuName || "");
          case "name-desc":
            return (b.menuName || "").localeCompare(a.menuName || "");
          case "price-asc":
            return Number(a.menuPrice || 0) - Number(b.menuPrice || 0);
          case "price-desc":
            return Number(b.menuPrice || 0) - Number(a.menuPrice || 0);
          default:
            return 0;
        }
      });
    }

    console.log("Final filtered menus:", filtered.length);
    return filtered;
  }, [menus, selectedCategory, searchTerm, sortOrder, filterMenusByCategory]);

  // Memoize current user ID
  const currentUserId = useMemo(() => {
    return getAuth().currentUser?.uid;
  }, []);

  // CRUD operations
  const addMenu = useCallback(
    async (menuData) => {
      setSubmitting(true);
      try {
        const adminId = currentUserId || getAuth().currentUser?.uid;
        return await menuServices.addMenu(menuData, hotelName, adminId);
      } catch (err) {
        console.error("Error in addMenu:", err);
        setError(err.message || "Error adding menu");
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
        setError(err.message || "Error updating menu");
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
        setError(err.message || "Error deleting menu");
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
        setError(err.message || "Error toggling menu availability");
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
        setError(err.message || "Error preparing menu for edit");
        return null;
      }
    },
    [hotelName]
  );

  const handleFormSubmit = useCallback(
    async (menuData, menuId = null) => {
      if (menuId) {
        return await updateMenu(menuData, menuId);
      } else {
        return await addMenu(menuData);
      }
    },
    [addMenu, updateMenu]
  );

  // IMPROVED: Filter, search, sort handlers with better logging
  const handleCategoryFilter = useCallback((cat) => {
    console.log("Category filter changed to:", cat);
    setSelectedCategory(cat);
    setActiveCategory(cat);
  }, []);

  const handleSearchChange = useCallback((term) => {
    console.log("Search term changed to:", term);
    setSearchTerm(term);
  }, []);

  const handleSortChange = useCallback((order) => {
    console.log("Sort order changed to:", order);
    setSortOrder(order);
  }, []);

  const clearAllFilters = useCallback(() => {
    console.log("Clearing all filters");
    setSearchTerm("");
    setSelectedCategory("");
    setActiveCategory("");
    setSortOrder("default");
  }, []);

  // Refresh menus function
  const refreshMenus = useCallback(async () => {
    if (!hotelName) return [];

    try {
      setLoading(true);
      setError(null);
      const menusData = await menuServices.getMenus(hotelName);
      setMenus(menusData || []);
      return menusData;
    } catch (err) {
      console.error("Error refreshing menus:", err);
      setError(err.message || "Error refreshing menus");
      return [];
    } finally {
      setLoading(false);
    }
  }, [hotelName]);

  // Get single menu item
  const getMenuById = useCallback(
    async (menuId) => {
      try {
        return await menuServices.getMenuItemById(hotelName, menuId);
      } catch (err) {
        console.error("Error getting menu by ID:", err);
        setError(err.message || "Error fetching menu");
        return null;
      }
    },
    [hotelName]
  );

  // Utility functions
  const utilityFunctions = useMemo(
    () => ({
      getMenuStats: async () => menuServices.getMenuStats(hotelName),

      checkDuplicateMenu: (name, excludeId = null) =>
        menus.some(
          (m) =>
            m.menuName?.toLowerCase() === name.toLowerCase() &&
            m.id !== excludeId
        ),

      getMenusByCategory: (cat) => filterMenusByCategory(menus, cat),

      getAvailableMenus: () =>
        menus.filter((m) => m.availability === "Available"),

      getUnavailableMenus: () =>
        menus.filter((m) => m.availability === "Unavailable"),

      getDiscountedMenus: () => menus.filter((m) => m.discount > 0),

      getPopularMenus: () => menus.filter((m) => m.isPopular),

      getChefSpecialMenus: () => menus.filter((m) => m.chefSpecial),
    }),
    [hotelName, menus, filterMenusByCategory]
  );

  // Computed statistics
  const computedStats = useMemo(() => {
    const availableMenus = menus.filter((m) => m.availability === "Available");
    const unavailableMenus = menus.filter(
      (m) => m.availability === "Unavailable"
    );
    const discountedMenus = menus.filter((m) => m.discount > 0);

    return {
      menuCount: menus.length,
      filteredCount: filteredAndSortedMenus.length,
      hasMenus: menus.length > 0,
      hasSearchResults: filteredAndSortedMenus.length > 0,
      availableMenuCount: availableMenus.length,
      unavailableMenuCount: unavailableMenus.length,
      discountedMenuCount: discountedMenus.length,
      categoryCount: categories.length,
      mainCategoryCount: mainCategories.length,
    };
  }, [menus, filteredAndSortedMenus, categories, mainCategories]);

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
    refreshMenus,
    getMenuById,

    // Utility functions
    ...utilityFunctions,

    // Computed stats
    menuCount: computedStats.menuCount,
    filteredCount: computedStats.filteredCount,
    hasMenus: computedStats.hasMenus,
    hasSearchResults: computedStats.hasSearchResults,
    availableMenuCount: computedStats.availableMenuCount,
    unavailableMenuCount: computedStats.unavailableMenuCount,
    discountedMenuCount: computedStats.discountedMenuCount,
    categoryCount: computedStats.categoryCount,
    mainCategoryCount: computedStats.mainCategoryCount,

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

// hooks/useMenu.jsx

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
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Real-time subscriptions
  useEffect(() => {
    if (!hotelName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const unsubscribes = [];

    // helper to subscribe to a collection
    const subscribe = (path, setter) => {
      const ref = collection(db, path);
      const unsub = onSnapshot(
        ref,
        (snap) => {
          setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${path}:`, err);
          setError(err);
          setLoading(false);
        }
      );
      unsubscribes.push(unsub);
    };

    subscribe(`hotels/${hotelName}/menu`, setMenus);
    subscribe(`hotels/${hotelName}/categories`, setCategories);
    subscribe(`hotels/${hotelName}/Maincategories`, setMainCategories);

    return () => unsubscribes.forEach((u) => u());
  }, [hotelName]);

  // Update counts when menus change
  useEffect(() => {
    setMenuCountsByCategory(menuServices.calculateMenuCountsByCategory(menus));
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

  // CRUD operations wrapped in useCallback to avoid recreating functions
  const addMenu = useCallback(
    async (menuData) => {
      setSubmitting(true);
      try {
        const adminId = getAuth().currentUser?.uid;
        return await menuServices.addMenu(menuData, hotelName, adminId);
      } catch (err) {
        console.error("Error in addMenu:", err);
        setError(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName]
  );

  const updateMenu = useCallback(
    async (menuData, menuId) => {
      setSubmitting(true);
      try {
        const adminId = getAuth().currentUser?.uid;
        return await menuServices.updateMenu(
          menuData,
          menuId,
          hotelName,
          adminId
        );
      } catch (err) {
        console.error("Error in updateMenu:", err);
        setError(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName]
  );

  const deleteMenu = useCallback(
    async (menuId) => {
      setSubmitting(true);
      try {
        return await menuServices.deleteMenu(menuId, hotelName);
      } catch (err) {
        console.error("Error in deleteMenu:", err);
        setError(err);
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
        setError(err);
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
        setError(err);
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

  // Stats and utilities
  const getMenuStats = useCallback(
    async () => menuServices.getMenuStats(hotelName),
    [hotelName]
  );
  const checkDuplicateMenu = useCallback(
    (name, excludeId = null) =>
      menus.some(
        (m) =>
          m.menuName?.toLowerCase() === name.toLowerCase() && m.id !== excludeId
      ),
    [menus]
  );
  const getMenusByCategory = useCallback(
    (cat) => menus.filter((m) => m.menuCategory === cat),
    [menus]
  );
  const getAvailableMenus = useCallback(
    () => menus.filter((m) => m.availability === "Available"),
    [menus]
  );
  const getDiscountedMenus = useCallback(
    () => menus.filter((m) => m.discount > 0),
    [menus]
  );

  return {
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

    getMenuStats,
    checkDuplicateMenu,
    getMenusByCategory,
    getAvailableMenus,
    getDiscountedMenus,

    // stats
    menuCount: menus.length,
    filteredCount: filteredAndSortedMenus.length,
    hasMenus: menus.length > 0,
    hasSearchResults: filteredAndSortedMenus.length > 0,
    availableMenuCount: menus.filter((m) => m.availability === "Available")
      .length,
    unavailableMenuCount: menus.filter((m) => m.availability === "Unavailable")
      .length,
    categoryCount: categories.length,
    mainCategoryCount: mainCategories.length,

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

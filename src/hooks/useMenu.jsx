// useMenu.js
import { useState, useEffect, useCallback } from "react";
import { menuServices } from "../services/api/menuService";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "services/firebase/firebaseConfig";

export const useMenu = (hotelName) => {
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

  useEffect(() => {
    if (!hotelName) {
      setMenus([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const menusRef = collection(firestore, `hotels/${hotelName}/menu`);
    const unsubscribeMenus = onSnapshot(
      menusRef,
      (querySnapshot) => {
        const menusArray = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMenus(menusArray);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching menus:", err);
        setError(err);
        setLoading(false);
      }
    );

    const categoriesRef = collection(
      firestore,
      `hotels/${hotelName}/categories`
    );
    const unsubscribeCategories = onSnapshot(
      categoriesRef,
      (querySnapshot) => {
        const categoriesArray = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategories(categoriesArray);
      },
      (err) => {
        console.error("Error fetching categories:", err);
        setError(err);
      }
    );

    const mainCategoriesRef = collection(
      firestore,
      `hotels/${hotelName}/Maincategories`
    );
    const unsubscribeMainCategories = onSnapshot(
      mainCategoriesRef,
      (querySnapshot) => {
        const mainCategoriesArray = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMainCategories(mainCategoriesArray);
      },
      (err) => {
        console.error("Error fetching main categories:", err);
        setError(err);
      }
    );

    return () => {
      unsubscribeMenus();
      unsubscribeCategories();
      unsubscribeMainCategories();
    };
  }, [hotelName]);

  useEffect(() => {
    const counts = menuServices.calculateMenuCountsByCategory(menus);
    setMenuCountsByCategory(counts);
  }, [menus]);

  const filteredAndSortedMenus = menuServices.filterAndSortMenus(
    menus,
    searchTerm,
    selectedCategory,
    sortOrder
  );

  const addMenu = useCallback(
    async (menuData) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const currentAdminId = getAuth().currentUser?.uid;
        const success = await menuServices.addMenu(
          menuData,
          hotelName,
          currentAdminId
        );
        return success;
      } catch (err) {
        console.error("Error in addMenu:", err);
        setError(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const updateMenu = useCallback(
    async (menuData, menuId) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const currentAdminId = getAuth().currentUser?.uid;
        const success = await menuServices.updateMenu(
          menuData,
          menuId,
          hotelName,
          currentAdminId
        );
        return success;
      } catch (err) {
        console.error("Error in updateMenu:", err);
        setError(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const deleteMenu = useCallback(
    async (menuId) => {
      if (submitting) return false;
      setSubmitting(true);
      try {
        const success = await menuServices.deleteMenu(menuId, hotelName);
        return success;
      } catch (err) {
        console.error("Error in deleteMenu:", err);
        setError(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

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
      } catch (err) {
        console.error("Error in toggleMenuAvailability:", err);
        setError(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const prepareForEdit = useCallback(
    async (menu) => {
      try {
        const menuToEdit = await menuServices.prepareForEdit(hotelName, menu);
        return menuToEdit;
      } catch (err) {
        console.error("Error in prepareForEdit:", err);
        setError(err);
        return null;
      }
    },
    [hotelName]
  );

  const handleFormSubmit = useCallback(
    async (menuData, menuId = null) => {
      if (menuId) {
        return updateMenu(menuData, menuId);
      } else {
        return addMenu(menuData);
      }
    },
    [addMenu, updateMenu]
  );

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

  const refreshMenus = useCallback(() => {
    setError(null);
    // Firestore subscription auto updates menus
  }, []);

  const getMenuStats = useCallback(async () => {
    try {
      return await menuServices.getMenuStats(hotelName);
    } catch (err) {
      console.error("Error getting menu stats:", err);
      setError(err);
      return null;
    }
  }, [hotelName]);

  const checkDuplicateMenu = useCallback(
    (menuName, excludeId = null) =>
      menus.some(
        (menu) =>
          menu.menuName?.toLowerCase() === menuName.toLowerCase() &&
          menu.uuid !== excludeId &&
          menu.id !== excludeId &&
          menu._id !== excludeId
      ),
    [menus]
  );

  const getMenusByCategory = useCallback(
    (categoryName) =>
      menus.filter((menu) => menu.menuCategory === categoryName),
    [menus]
  );

  const getAvailableMenus = useCallback(
    () => menus.filter((menu) => menu.availability === "Available"),
    [menus]
  );

  const getDiscountedMenus = useCallback(
    () => menus.filter((menu) => menu.discount > 0),
    [menus]
  );

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setActiveCategory("");
    setSortOrder("default");
  }, []);

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
    refreshMenus,

    getMenuStats,
    checkDuplicateMenu,
    getMenusByCategory,
    getAvailableMenus,
    getDiscountedMenus,
    clearAllFilters,

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

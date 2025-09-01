import { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { menuServices } from "../services/menuService";

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

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  // Fetch menus from Firebase
  useEffect(() => {
    if (!hotelName) return;

    const menuRef = ref(db, `/hotels/${hotelName}/menu`);
    const unsubscribe = onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      setMenus(data ? Object.values(data) : []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hotelName]);

  // Fetch categories from Firebase
  useEffect(() => {
    if (!hotelName) return;

    const categoryRef = ref(db, `/hotels/${hotelName}/categories/`);
    const unsubscribe = onValue(categoryRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data ? Object.values(data) : []);
    });

    return () => unsubscribe();
  }, [hotelName]);

  // Fetch main categories from Firebase
  useEffect(() => {
    if (!hotelName) return;

    const mainCategoryRef = ref(db, `/hotels/${hotelName}/Maincategories/`);
    const unsubscribe = onValue(mainCategoryRef, (snapshot) => {
      const data = snapshot.val();
      setMainCategories(data ? Object.values(data) : []);
    });

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

  // Menu operations
  const addMenu = async (menuData) => {
    const success = await menuServices.addMenu(
      menuData,
      hotelName,
      currentAdminId
    );
    return success;
  };

  const updateMenu = async (menuData, menuId) => {
    const success = await menuServices.updateMenu(
      menuData,
      menuId,
      hotelName,
      currentAdminId
    );
    return success;
  };

  const deleteMenu = async (menuId) => {
    const success = await menuServices.deleteMenu(menuId, hotelName);
    return success;
  };

  // Filter handlers
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setActiveCategory(category);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  return {
    // Data
    menus,
    categories,
    mainCategories,
    filteredAndSortedMenus,
    menuCountsByCategory,

    // State
    searchTerm,
    selectedCategory,
    sortOrder,
    activeCategory,
    loading,
    currentAdminId,

    // Operations
    addMenu,
    updateMenu,
    deleteMenu,

    // Handlers
    handleCategoryFilter,
    handleSearchChange,
    handleSortChange,

    // Setters (for direct state manipulation if needed)
    setSearchTerm,
    setSelectedCategory,
    setSortOrder,
    setActiveCategory,
  };
};

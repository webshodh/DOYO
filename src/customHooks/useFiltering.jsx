// hooks/useFiltering.js
import { useState, useCallback, useMemo } from "react";
import { filterService } from "../services/filterService";

export const useFiltering = (menus = [], specialCategories = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);

  // Debug logging
  console.log("useFiltering - menus:", menus);
  console.log("useFiltering - menus type:", typeof menus);
  console.log("useFiltering - menus length:", menus?.length);

  const filteredAndSortedMenus = useMemo(() => {
    if (!Array.isArray(menus) || menus.length === 0) {
      return [];
    }

    return filterService.filterAndSortMenus(menus, {
      searchTerm,
      selectedCategory,
      selectedMainCategory,
      selectedSpecialFilters,
      sortOrder,
    });
  }, [
    menus,
    searchTerm,
    selectedCategory,
    selectedMainCategory,
    selectedSpecialFilters,
    sortOrder,
  ]);

  const availableSpecialCategories = useMemo(() => {
    if (!Array.isArray(specialCategories) || !Array.isArray(menus)) {
      return [];
    }
    return filterService.getAvailableSpecialCategories(
      specialCategories,
      menus
    );
  }, [specialCategories, menus]);

  const hasActiveFilters = useMemo(() => {
    return filterService.hasActiveFilters({
      searchTerm,
      selectedCategory,
      selectedMainCategory,
      selectedSpecialFilters,
    });
  }, [
    searchTerm,
    selectedCategory,
    selectedMainCategory,
    selectedSpecialFilters,
  ]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e?.target?.value || "");
  }, []);

  const handleSort = useCallback((order) => {
    setSortOrder(order || "default");
  }, []);

  const handleCategoryFilter = useCallback((category, type) => {
    const result = filterService.handleCategoryFilter(category, type);
    setSelectedCategory(result.selectedCategory);
    setSelectedMainCategory(result.selectedMainCategory);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMainCategory("");
    setSelectedSpecialFilters([]);
    setSortOrder("default");
  }, []);

  return {
    // State
    searchTerm,
    sortOrder,
    selectedCategory,
    selectedMainCategory,
    selectedSpecialFilters,

    // Computed values
    filteredAndSortedMenus,
    availableSpecialCategories,
    hasActiveFilters,

    // Actions
    handleSearch,
    handleSort,
    handleCategoryFilter,
    setSelectedSpecialFilters,
    clearAllFilters,
    setSearchTerm,
    setSelectedCategory,
    setSelectedMainCategory,
  };
};

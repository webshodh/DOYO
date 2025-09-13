// containers/HomeContainer.jsx
import React, { memo, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useHomeData } from "../customHooks/useHomeData";
import { useFiltering } from "../customHooks/useFiltering";
import { useUIState } from "../customHooks/useUIState";
import { specialCategories } from "../Constants/addMenuFormConfig";
import HomeView from "../View/HomeView";

const HomeContainer = memo(() => {
  const { hotelName } = useParams();
  const location = useLocation();

  // Custom hooks for separated concerns
  const { menus, categories, mainCategories, loading, error, counts, retry } =
    useHomeData(hotelName);

  const {
    searchTerm,
    sortOrder,
    selectedCategory,
    selectedMainCategory,
    selectedSpecialFilters,
    filteredAndSortedMenus,
    availableSpecialCategories,
    hasActiveFilters,
    handleSearch,
    handleSort,
    handleCategoryFilter,
    setSelectedSpecialFilters,
    clearAllFilters,
    setSearchTerm,
    setSelectedCategory,
    setSelectedMainCategory,
  } = useFiltering(menus, specialCategories);

  const { viewMode, isAdmin, changeViewMode } = useUIState(location);

  // Event handlers
  const handleSpecialFilterToggle = useCallback(
    (filterName) => {
      setSelectedSpecialFilters((prev) =>
        prev.includes(filterName)
          ? prev.filter((f) => f !== filterName)
          : [...prev, filterName]
      );
    },
    [setSelectedSpecialFilters]
  );

  const handleAddToCart = useCallback((item, quantity) => {
    console.log("Add to cart:", item, quantity);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, [setSearchTerm]);

  const removeSpecialFilter = useCallback(
    (filter) => {
      setSelectedSpecialFilters((prev) => prev.filter((f) => f !== filter));
    },
    [setSelectedSpecialFilters]
  );

  const removeCategoryFilter = useCallback(() => {
    setSelectedCategory("");
  }, [setSelectedCategory]);

  const removeMainCategoryFilter = useCallback(() => {
    setSelectedMainCategory("");
  }, [setSelectedMainCategory]);

  return (
    <HomeView
      // Data props
      menus={menus}
      categories={categories}
      mainCategories={mainCategories}
      counts={counts}
      loading={loading}
      error={error}
      // Filter props
      filteredAndSortedMenus={filteredAndSortedMenus}
      availableSpecialCategories={availableSpecialCategories}
      hasActiveFilters={hasActiveFilters}
      searchTerm={searchTerm}
      sortOrder={sortOrder}
      selectedCategory={selectedCategory}
      selectedMainCategory={selectedMainCategory}
      selectedSpecialFilters={selectedSpecialFilters}
      // UI props
      viewMode={viewMode}
      isAdmin={isAdmin}
      hotelName={hotelName}
      // Action props
      onSearch={handleSearch}
      onSort={handleSort}
      onCategoryFilter={handleCategoryFilter}
      onSpecialFilterToggle={handleSpecialFilterToggle}
      onClearAllFilters={clearAllFilters}
      onClearSearch={clearSearch}
      onRemoveSpecialFilter={removeSpecialFilter}
      onRemoveCategoryFilter={removeCategoryFilter}
      onRemoveMainCategoryFilter={removeMainCategoryFilter}
      onViewModeChange={changeViewMode}
      onRetry={retry}
      onAddToCart={handleAddToCart}
    />
  );
});

HomeContainer.displayName = "HomeContainer";

export default HomeContainer;

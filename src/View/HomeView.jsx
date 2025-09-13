// components/HomeView.jsx
import React, { Suspense } from "react";
import NavBar from "components/Navbar";
import ActiveFilters from "components/ActiveFilters";
import SpecialCategoriesFilter from "components/SpecialCategoriesFilter";
import ResultsSummary from "components/ResultsSummary";
import MenuCardSkeleton from "Atoms/MenuCardSkeleton";
import LoadingSpinner from "Atoms/LoadingSpinner";
import EmptyState from "components/EmptyState";
import CategoryFilters from "components/CategoryFilters";
import ErrorState from "components/ErrorState";

// Lazy loaded components
const FilterSortSearch = React.lazy(() =>
  import("../components/FilterSortSearch")
);
const CategoryTabs = React.lazy(() => import("../components/CategoryTab"));
const HorizontalMenuCard = React.lazy(() =>
  import("../components/Cards/HorizontalMenuCard")
);

const HomeView = ({
  // Data props
  menus = [],
  categories = [],
  mainCategories = [],
  counts = {},
  loading = false,
  error = null,

  // Filter props
  filteredAndSortedMenus = [],
  availableSpecialCategories = [],
  hasActiveFilters = false,
  searchTerm = "",
  sortOrder = "default",
  selectedCategory = "",
  selectedMainCategory = "",
  selectedSpecialFilters = [],

  // UI props
  viewMode = "grid",
  isAdmin = false,
  hotelName = "",

  // Action props
  onSearch = () => {},
  onSort = () => {},
  onCategoryFilter = () => {},
  onSpecialFilterToggle = () => {},
  onClearAllFilters = () => {},
  onClearSearch = () => {},
  onRemoveSpecialFilter = () => {},
  onRemoveCategoryFilter = () => {},
  onRemoveMainCategoryFilter = () => {},
  onViewModeChange = () => {},
  onRetry = () => {},
  onAddToCart = () => {},
}) => {
  // Debug logging - remove in production
  console.log("HomeView Debug - Categories:", categories);
  console.log("HomeView Debug - Categories type:", typeof categories);
  console.log("HomeView Debug - Categories length:", categories?.length);

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  // Safe counts with defaults
  const safeCounts = {
    menuCountsByCategory: counts?.menuCountsByCategory || {},
    menuCountsByMainCategory: counts?.menuCountsByMainCategory || {},
    specialCategoryCounts: counts?.specialCategoryCounts || {},
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdmin && (
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <div className="sticky top-0 z-50">
            <NavBar hotelName={hotelName} title={hotelName} admin={false} />
          </div>
        </Suspense>
      )}

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Search and Sort */}
        <div className="mb-6">
          <Suspense
            fallback={
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            }
          >
            <FilterSortSearch
              searchTerm={searchTerm}
              handleSearch={onSearch}
              handleSort={onSort}
              currentSort={sortOrder}
              placeholder="Search menu items..."
              className="w-full"
            />
          </Suspense>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          specialFilters={selectedSpecialFilters}
          category={selectedCategory}
          mainCategory={selectedMainCategory}
          searchTerm={searchTerm}
          onRemoveSpecial={onRemoveSpecialFilter}
          onRemoveCategory={onRemoveCategoryFilter}
          onRemoveMainCategory={onRemoveMainCategoryFilter}
          onClearSearch={onClearSearch}
          onClearAll={onClearAllFilters}
        />

        {/* Fixed: Use categories instead of dynamicCategories */}
        {categories && categories.length > 0 && (
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategoryFilter}
          />
        )}

        {/* Special Categories Filter */}
        {availableSpecialCategories &&
          availableSpecialCategories.length > 0 && (
            <SpecialCategoriesFilter
              categories={availableSpecialCategories}
              selectedFilters={selectedSpecialFilters}
              onToggle={onSpecialFilterToggle}
              counts={safeCounts.specialCategoryCounts}
            />
          )}

        {/* Category Tabs */}
        <div className="mb-6">
          <Suspense
            fallback={
              <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
            }
          >
            {categories && categories.length > 0 && (
              <CategoryTabs
                categories={categories}
                mainCategories={mainCategories}
                menuCountsByCategory={safeCounts.menuCountsByCategory}
                menuCountsByMainCategory={safeCounts.menuCountsByMainCategory}
                handleCategoryFilter={onCategoryFilter}
                initialActiveTab={
                  selectedCategory || selectedMainCategory || "All"
                }
              />
            )}
          </Suspense>
        </div>

        {/* Results Summary */}
        <ResultsSummary
          totalResults={menus.length}
          filteredResults={filteredAndSortedMenus.length}
          hasFilters={hasActiveFilters}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />

        {/* Menu Items */}
        {loading ? (
          <div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <MenuCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredAndSortedMenus.length > 0 ? (
          <Suspense fallback={<LoadingSpinner text="Loading menu items..." />}>
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 max-w-4xl mx-auto"
              }`}
            >
              {filteredAndSortedMenus.map((item) => (
                <div key={item.id || item.menuId} className="w-full">
                  <HorizontalMenuCard item={item} onAddToCart={onAddToCart} />
                </div>
              ))}
            </div>
          </Suspense>
        ) : (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearAllFilters}
          />
        )}
      </div>
    </div>
  );
};

export default HomeView;

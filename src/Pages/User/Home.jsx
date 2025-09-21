// src/Pages/User/Home.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  Suspense,
} from "react";
import { useParams, useLocation } from "react-router-dom";
// ✅ REMOVED: Direct Firebase imports (now using hooks)
// import { db } from "../../services/firebase/firebaseConfig";
// import { onValue, ref } from "firebase/database";

// ✅ NEW: Import Firestore-based hooks
import { useMenu } from "../../hooks/useMenu";
import { useCategory } from "../../hooks/useCategory";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

import { specialCategories } from "../../Constants/ConfigForms/addMenuFormConfig";
import ErrorState from "atoms/Messages/ErrorState";
import NavBar from "organisms/Navbar";
import ActiveFilters from "components/Filters/ActiveFilters";
import SpecialCategoriesFilter from "organisms/SpecialCategoriesFilter";
import ResultsSummary from "components/ResultsSummary";
import MenuCardSkeleton from "atoms/MenuCardSkeleton";
import LoadingSpinner from "atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import { Filter, AlertTriangle, Wifi, WifiOff } from "lucide-react";

// Lazy load heavy components
const Navbar = React.lazy(() => import("../../organisms/Navbar"));
const FilterSortSearch = React.lazy(() =>
  import("../../organisms/FilterSortSearch")
);
const CategoryTabs = React.lazy(() => import("../../molecules/CategoryTab"));
const HorizontalMenuCard = React.lazy(() =>
  import("../../components/Cards/HorizontalMenuCard")
);

// Main Home component
const Home = memo(() => {
  const { hotelName } = useParams();
  const location = useLocation();

  // ✅ NEW: Use context hooks
  const { currentUser, isAuthenticated } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // ✅ NEW: Use Firestore-based hooks instead of direct Firebase calls
  const {
    menus,
    categories,
    mainCategories,
    loading,
    error,
    connectionStatus,
    filteredAndSortedMenus: hookFilteredMenus,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    selectedCategory,
    setSelectedCategory,
    activeCategory,
    setActiveCategory,
    handleSearchChange,
    handleSortChange,
    handleCategoryFilter,
    clearAllFilters,
    menuCount,
    filteredCount,
    hasMenus,
    hasSearchResults,
    refreshMenus,
    // Get computed counts
    menuCountsByCategory,
  } = useMenu(activeHotelName);

  // ✅ NEW: Get categories with their own hook for better performance
  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategory(activeHotelName);

  // Local state for additional filters not handled by useMenu
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ NEW: Computed state for counts
  const [menuCountsByMainCategory, setMenuCountsByMainCategory] = useState({});
  const [specialCategoryCounts, setSpecialCategoryCounts] = useState({});

  // ✅ NEW: Auto-update hotel selection if needed
  useEffect(() => {
    if (hotelName && selectedHotel?.name !== hotelName) {
      selectHotelById(hotelName);
    }
  }, [hotelName, selectedHotel, selectHotelById]);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(location.pathname.includes("admin"));
  }, [location.pathname]);

  // ✅ ENHANCED: Calculate counts when menus data changes
  useEffect(() => {
    if (menus.length > 0) {
      calculateCounts(menus, categories, mainCategories);
    }
  }, [menus, categories, mainCategories]);

  // Calculate counts
  const calculateCounts = useCallback(
    (menusData, categoriesData, mainCategoriesData) => {
      // Main category counts
      const mainCategoryCounts = {};
      mainCategoriesData.forEach((mainCategory) => {
        const categoryName = mainCategory.mainCategoryName || mainCategory.name;
        const count = menusData.filter(
          (menu) => menu.mainCategory === categoryName
        ).length;
        mainCategoryCounts[categoryName] = count;
      });
      setMenuCountsByMainCategory(mainCategoryCounts);

      // Special category counts
      const specialCounts = {};
      specialCategories.forEach((category) => {
        const count = menusData.filter(
          (menu) => menu[category.name] === true
        ).length;
        specialCounts[category.name] = count;
      });
      setSpecialCategoryCounts(specialCounts);
    },
    []
  );

  // ✅ ENHANCED: Filter and sort menus with additional local filters
  const filteredAndSortedMenus = useMemo(() => {
    let filtered = [...menus];

    // Apply hook-based filters first (search, category, sort are handled by useMenu)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (menu) =>
          menu.menuName?.toLowerCase().includes(search) ||
          menu.menuDescription?.toLowerCase().includes(search) ||
          menu.ingredients?.toLowerCase().includes(search)
      );
    }

    // Category filter (hook handles this, but we need to sync with local state)
    if (selectedCategory) {
      filtered = filtered.filter(
        (menu) => menu.menuCategory === selectedCategory
      );
    }

    // Main category filter (local state)
    if (selectedMainCategory) {
      filtered = filtered.filter(
        (menu) => menu.mainCategory === selectedMainCategory
      );
    }

    // Special filters (local state)
    if (selectedSpecialFilters.length > 0) {
      filtered = filtered.filter((menu) =>
        selectedSpecialFilters.every((filter) => menu[filter] === true)
      );
    }

    // Apply sorting (hook handles this too, but we can override)
    if (sortOrder === "lowToHigh") {
      filtered.sort(
        (a, b) =>
          parseFloat(a.finalPrice || a.menuPrice || 0) -
          parseFloat(b.finalPrice || b.menuPrice || 0)
      );
    } else if (sortOrder === "highToLow") {
      filtered.sort(
        (a, b) =>
          parseFloat(b.finalPrice || b.menuPrice || 0) -
          parseFloat(a.finalPrice || a.menuPrice || 0)
      );
    } else if (sortOrder === "nameAsc") {
      filtered.sort((a, b) =>
        (a.menuName || "").localeCompare(b.menuName || "")
      );
    } else if (sortOrder === "nameDesc") {
      filtered.sort((a, b) =>
        (b.menuName || "").localeCompare(a.menuName || "")
      );
    }

    return filtered;
  }, [
    menus,
    searchTerm,
    selectedCategory,
    selectedMainCategory,
    selectedSpecialFilters,
    sortOrder,
  ]);

  // Available special categories (only those with items)
  const availableSpecialCategories = useMemo(
    () =>
      specialCategories.filter(
        (category) => specialCategoryCounts[category.name] > 0
      ),
    [specialCategoryCounts]
  );

  // ✅ ENHANCED: Event handlers with hook integration
  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      handleSearchChange(value); // Update hook state
    },
    [handleSearchChange]
  );

  const handleSort = useCallback(
    (order) => {
      setSortOrder(order);
      handleSortChange(order); // Update hook state
    },
    [handleSortChange]
  );

  const handleCategoryFilterLocal = useCallback(
    (category, type) => {
      if (type === "all" || category === "") {
        setSelectedCategory("");
        setSelectedMainCategory("");
        setActiveCategory("");
        handleCategoryFilter(""); // Update hook state
      } else if (type === "main") {
        setSelectedMainCategory(category);
        setSelectedCategory("");
        setActiveCategory("");
        handleCategoryFilter(""); // Clear hook category filter
      } else {
        setSelectedCategory(category);
        setSelectedMainCategory("");
        setActiveCategory(category);
        handleCategoryFilter(category); // Update hook state
      }
    },
    [handleCategoryFilter, setActiveCategory]
  );

  const handleSpecialFilterToggle = useCallback((filterName) => {
    setSelectedSpecialFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  }, []);

  const clearAllFiltersLocal = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMainCategory("");
    setSelectedSpecialFilters([]);
    setSortOrder("default");
    clearAllFilters(); // Clear hook filters
  }, [clearAllFilters]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    handleSearchChange(""); // Update hook state
  }, [handleSearchChange]);

  const removeSpecialFilter = useCallback((filter) => {
    setSelectedSpecialFilters((prev) => prev.filter((f) => f !== filter));
  }, []);

  const removeCategoryFilter = useCallback(() => {
    setSelectedCategory("");
    setActiveCategory("");
    handleCategoryFilter(""); // Update hook state
  }, [handleCategoryFilter, setActiveCategory]);

  const removeMainCategoryFilter = useCallback(() => {
    setSelectedMainCategory("");
  }, []);

  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // ✅ ENHANCED: Retry handler with hook refresh
  const handleRetry = useCallback(() => {
    refreshMenus();
  }, [refreshMenus]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = memo(() => {
    if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>Connecting...</span>
        </div>
      );
    }

    if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
          <button
            onClick={handleRetry}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            Retry
          </button>
        </div>
      );
    }

    return null;
  });

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      searchTerm ||
      selectedCategory ||
      selectedMainCategory ||
      selectedSpecialFilters.length > 0,
    [searchTerm, selectedCategory, selectedMainCategory, selectedSpecialFilters]
  );

  // ✅ ENHANCED: Error state with more context
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorState
              title="Unable to Load Menu"
              message={
                error.message ||
                "There was a problem loading the menu items. Please check your connection and try again."
              }
              onRetry={handleRetry}
              showRetryButton={true}
            />
            <div className="mt-4 text-center">
              <ConnectionStatusIndicator />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NEW: No hotel selected state
  if (!activeHotelName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Restaurant Selected
          </h3>
          <p className="text-gray-600">
            Please select a restaurant to view the menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar for non-admin users */}
      {!isAdmin && (
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <div className="sticky top-0 z-50 shadow-sm">
            <NavBar
              title={activeHotelName}
              admin={false}
              hotelName={activeHotelName}
              home
              offers
              socialLinks={{
                instagram: "https://instagram.com/yourpage",
                facebook: "https://facebook.com/yourpage",
                google: "https://g.page/yourpage",
              }}
            />
          </div>
        </Suspense>
      )}

      {/* ✅ NEW: Connection Status Bar */}
      {connectionStatus !== "connected" && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <ConnectionStatusIndicator />
            {connectionStatus === "error" && (
              <span className="text-xs text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sticky Filters & Tabs */}
      <div className="sticky top-12 z-40 bg-gray-50 border-b">
        <div className="container mx-auto px-3 py-3 max-w-7xl space-y-3">
          {/* Search and Sort */}
          <Suspense
            fallback={
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            }
          >
            <FilterSortSearch
              searchTerm={searchTerm}
              handleSearch={handleSearch}
              handleSort={handleSort}
              currentSort={sortOrder}
              placeholder="Search menu items..."
              className="w-full"
            />
          </Suspense>

          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  !
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFiltersLocal}
                className="md:hidden text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div
            className={`${
              showFilters ? "block" : "hidden"
            } md:block space-y-4 animate-fadeIn`}
          >
            {/* Special Categories Filter */}
            <SpecialCategoriesFilter
              categories={availableSpecialCategories}
              selectedFilters={selectedSpecialFilters}
              onToggle={handleSpecialFilterToggle}
              counts={specialCategoryCounts}
            />

            {/* Category Tabs */}
            <Suspense
              fallback={
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              }
            >
              <CategoryTabs
                categories={categories}
                mainCategories={mainCategories}
                menuCountsByCategory={menuCountsByCategory}
                menuCountsByMainCategory={menuCountsByMainCategory}
                handleCategoryFilter={handleCategoryFilterLocal}
                initialActiveTab={
                  selectedCategory || selectedMainCategory || "All"
                }
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Scrollable Menu Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 py-3 max-w-7xl">
          {/* Results Summary */}
          <ResultsSummary
            totalResults={menuCount}
            filteredResults={filteredAndSortedMenus.length}
            hasFilters={hasActiveFilters}
            viewMode={viewMode}
            onViewModeChange={changeViewMode}
          />

          {/* ✅ NEW: Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-4">
              <ActiveFilters
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                selectedMainCategory={selectedMainCategory}
                selectedSpecialFilters={selectedSpecialFilters}
                onClearSearch={clearSearch}
                onClearCategory={removeCategoryFilter}
                onClearMainCategory={removeMainCategoryFilter}
                onClearSpecialFilter={removeSpecialFilter}
                onClearAll={clearAllFiltersLocal}
              />
            </div>
          )}

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
            <Suspense
              fallback={<LoadingSpinner text="Loading menu items..." />}
            >
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 max-w-4xl mx-auto"
                }`}
              >
                {filteredAndSortedMenus.map((item) => (
                  <div
                    key={item.id || item.menuId || item.uuid}
                    className="w-full"
                  >
                    <HorizontalMenuCard
                      item={item}
                      onAddToCart={(item, quantity) => {
                        console.log("Add to cart:", item, quantity);
                        // ✅ TODO: Integrate with cart context/service
                      }}
                      isLoading={connectionStatus === "connecting"}
                      disabled={connectionStatus === "error"}
                    />
                  </div>
                ))}
              </div>
            </Suspense>
          ) : hasMenus ? (
            <EmptyState
              title="No menu items found"
              message={
                hasActiveFilters
                  ? "Try adjusting your filters to see more results."
                  : "No menu items available at the moment."
              }
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFiltersLocal}
              actionLabel={hasActiveFilters ? "Clear Filters" : "Refresh"}
              onAction={hasActiveFilters ? clearAllFiltersLocal : handleRetry}
            />
          ) : (
            <EmptyState
              title="Menu coming soon"
              message="The restaurant is still setting up their menu. Please check back later."
              actionLabel="Refresh"
              onAction={handleRetry}
            />
          )}
        </div>
      </div>

      {/* ✅ NEW: Footer info */}
      <div className="bg-white border-t px-4 py-2 text-center text-xs text-gray-500">
        {connectionStatus === "connected" && (
          <div className="flex items-center justify-center gap-4">
            <span>Menu items: {menuCount}</span>
            {filteredAndSortedMenus.length !== menuCount && (
              <span>Showing: {filteredAndSortedMenus.length}</span>
            )}
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Live
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

Home.displayName = "Home";

export default Home;

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  Suspense,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { db } from "../../services/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { specialCategories } from "../../Constants/ConfigForms/addMenuFormConfig";
import ErrorState from "atoms/Messages/ErrorState";
import NavBar from "organisms/Navbar";
import ActiveFilters from "components/Filters/ActiveFilters";
import SpecialCategoriesFilter from "organisms/SpecialCategoriesFilter";
import ResultsSummary from "components/ResultsSummary";
import MenuCardSkeleton from "atoms/MenuCardSkeleton";
import LoadingSpinner from "atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import { Filter } from "lucide-react";

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

  // State management
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // UI states
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);

  // Counts
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [menuCountsByMainCategory, setMenuCountsByMainCategory] = useState({});
  const [specialCategoryCounts, setSpecialCategoryCounts] = useState({});

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(location.pathname.includes("admin"));
  }, [location.pathname]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch menus
        const menusPromise = new Promise((resolve) => {
          onValue(ref(db, `/hotels/${hotelName}/menu/`), (snapshot) => {
            const data = snapshot.val();
            const menusData = data ? Object.values(data) : [];
            resolve(menusData);
          });
        });

        // Fetch categories
        const categoriesPromise = new Promise((resolve) => {
          onValue(ref(db, `/hotels/${hotelName}/categories/`), (snapshot) => {
            const data = snapshot.val();
            const categoriesData = data ? Object.values(data) : [];
            resolve(categoriesData);
          });
        });

        // Fetch main categories
        const mainCategoriesPromise = new Promise((resolve) => {
          onValue(
            ref(db, `/hotels/${hotelName}/Maincategories/`),
            (snapshot) => {
              const data = snapshot.val();
              const mainCategoriesData = data ? Object.values(data) : [];
              resolve(mainCategoriesData);
            }
          );
        });

        const [menusData, categoriesData, mainCategoriesData] =
          await Promise.all([
            menusPromise,
            categoriesPromise,
            mainCategoriesPromise,
          ]);

        setMenus(menusData);
        setCategories(categoriesData);
        setMainCategories(mainCategoriesData);

        // Calculate counts
        calculateCounts(menusData, categoriesData, mainCategoriesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (hotelName) {
      fetchData();
    }
  }, [hotelName]);

  // Calculate counts
  const calculateCounts = useCallback(
    (menusData, categoriesData, mainCategoriesData) => {
      // Category counts
      const categoryCounts = {};
      categoriesData.forEach((category) => {
        const count = menusData.filter(
          (menu) => menu.menuCategory === category.categoryName
        ).length;
        categoryCounts[category.categoryName] = count;
      });
      setMenuCountsByCategory(categoryCounts);

      // Main category counts
      const mainCategoryCounts = {};
      mainCategoriesData.forEach((mainCategory) => {
        const count = menusData.filter(
          (menu) => menu.mainCategory === mainCategory.mainCategoryName
        ).length;
        mainCategoryCounts[mainCategory.mainCategoryName] = count;
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

  // Filter and sort menus
  const filteredAndSortedMenus = useMemo(() => {
    let filtered = [...menus];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (menu) =>
          menu.menuName?.toLowerCase().includes(search) ||
          menu.menuDescription?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (menu) => menu.menuCategory === selectedCategory
      );
    }

    // Main category filter
    if (selectedMainCategory) {
      filtered = filtered.filter(
        (menu) => menu.mainCategory === selectedMainCategory
      );
    }

    // Special filters
    if (selectedSpecialFilters.length > 0) {
      filtered = filtered.filter((menu) =>
        selectedSpecialFilters.every((filter) => menu[filter] === true)
      );
    }

    // Sorting
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

  // Event handlers
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSort = useCallback((order) => {
    setSortOrder(order);
  }, []);

  const handleCategoryFilter = useCallback((category, type) => {
    if (type === "all" || category === "") {
      setSelectedCategory("");
      setSelectedMainCategory("");
    } else if (type === "main") {
      setSelectedMainCategory(category);
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
      setSelectedMainCategory("");
    }
  }, []);

  const handleSpecialFilterToggle = useCallback((filterName) => {
    setSelectedSpecialFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMainCategory("");
    setSelectedSpecialFilters([]);
    setSortOrder("default");
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const removeSpecialFilter = useCallback((filter) => {
    setSelectedSpecialFilters((prev) => prev.filter((f) => f !== filter));
  }, []);

  const removeCategoryFilter = useCallback(() => {
    setSelectedCategory("");
  }, []);

  const removeMainCategoryFilter = useCallback(() => {
    setSelectedMainCategory("");
  }, []);

  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      searchTerm ||
      selectedCategory ||
      selectedMainCategory ||
      selectedSpecialFilters.length > 0,
    [searchTerm, selectedCategory, selectedMainCategory, selectedSpecialFilters]
  );

  // Error state
  if (error) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar for non-admin users */}
      {!isAdmin && (
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <div className="sticky top-0 z-50 shadow-sm">
            <NavBar
              title={hotelName}
              admin={false}
              hotelName={hotelName}
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
          {/* <div className="flex items-center justify-between mb-1">
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
                onClick={clearAllFilters}
                className="md:hidden text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div> */}

          <div>
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
                handleCategoryFilter={handleCategoryFilter}
                initialActiveTab={
                  selectedCategory || selectedMainCategory || "All"
                }
              />
            </Suspense>
            {/* Special Categories Filter */}
            <SpecialCategoriesFilter
              categories={availableSpecialCategories}
              selectedFilters={selectedSpecialFilters}
              onToggle={handleSpecialFilterToggle}
              counts={specialCategoryCounts}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Menu Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 py-3 max-w-7xl">
          {/* Results Summary */}
          <ResultsSummary
            totalResults={menus.length}
            filteredResults={filteredAndSortedMenus.length}
            hasFilters={hasActiveFilters}
            viewMode={viewMode}
            onViewModeChange={changeViewMode}
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
                  <div key={item.id || item.menuId} className="w-full">
                    <HorizontalMenuCard
                      item={item}
                      onAddToCart={(item, quantity) => {
                        console.log("Add to cart:", item, quantity);
                      }}
                    />
                  </div>
                ))}
              </div>
            </Suspense>
          ) : (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
});

Home.displayName = "Home";

export default Home;

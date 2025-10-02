import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  Suspense,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../../services/firebase/firebaseConfig";
import { specialCategories } from "../../Constants/ConfigForms/addMenuFormConfig";
import ErrorState from "atoms/Messages/ErrorState";
import NavBar from "organisms/Navbar";
import ActiveFilters from "components/Filters/ActiveFilters";
import SpecialCategoriesFilter from "organisms/SpecialCategoriesFilter";
import ResultsSummary from "components/ResultsSummary";
import MenuCardSkeleton from "atoms/MenuCardSkeleton";
import LoadingSpinner from "atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";

const FilterSortSearch = React.lazy(() =>
  import("../../organisms/FilterSortSearch")
);
const CategoryTabs = React.lazy(() => import("../../molecules/CategoryTab"));
const HorizontalMenuCard = React.lazy(() =>
  import("../../components/Cards/HorizontalMenuCard")
);

const firestore = getFirestore(app);

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

  // UI states
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);

  // Counts
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [menuCountsByMainCategory, setMenuCountsByMainCategory] = useState({});
  const [specialCategoryCounts, setSpecialCategoryCounts] = useState({});

  // Check admin state
  useEffect(() => {
    setIsAdmin(location.pathname.includes("admin"));
  }, [location.pathname]);

  // Create category lookup maps
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[category.id] = category.categoryName;
      map[category.categoryName] = category.categoryName;
    });
    return map;
  }, [categories]);

  const mainCategoryMap = useMemo(() => {
    const map = {};
    mainCategories.forEach((mainCategory) => {
      map[mainCategory.id] = mainCategory.mainCategoryName;
      map[mainCategory.mainCategoryName] = mainCategory.mainCategoryName;
    });
    return map;
  }, [mainCategories]);

  // Firestore subscriptions
  useEffect(() => {
    if (!hotelName) {
      setMenus([]);
      setCategories([]);
      setMainCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribes = [];

    // Categories first
    const categoriesRef = collection(
      firestore,
      `hotels/${hotelName}/categories`
    );
    const unsubscribeCategories = onSnapshot(
      categoriesRef,
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesData);
      },
      (err) => {
        console.error("Error fetching categories:", err);
        setError(err);
      }
    );
    unsubscribes.push(unsubscribeCategories);

    // Main Categories
    const mainCategoriesRef = collection(
      firestore,
      `hotels/${hotelName}/Maincategories`
    );
    const unsubscribeMainCategories = onSnapshot(
      mainCategoriesRef,
      (snapshot) => {
        const mainCategoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMainCategories(mainCategoriesData);
      },
      (err) => {
        console.error("Error fetching main categories:", err);
        setError(err);
      }
    );
    unsubscribes.push(unsubscribeMainCategories);

    // Menus
    const menusRef = collection(firestore, `hotels/${hotelName}/menu`);
    const unsubscribeMenus = onSnapshot(
      menusRef,
      (snapshot) => {
        const menusData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenus(menusData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching menus:", err);
        setError(err);
        setLoading(false);
      }
    );
    unsubscribes.push(unsubscribeMenus);

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [hotelName]);

  // Enhanced menus with resolved category names
  const enhancedMenus = useMemo(() => {
    return menus.map((menu) => {
      const resolvedCategoryName =
        categoryMap[menu.menuCategory] || menu.menuCategory || "";
      const resolvedMainCategoryName =
        mainCategoryMap[menu.mainCategory] || menu.mainCategory || "";

      return {
        ...menu,
        // Add resolved names that the card will use
        menuCategoryName: resolvedCategoryName,
        mainCategoryName: resolvedMainCategoryName,
        // Keep original for filtering
        menuCategoryId: menu.menuCategory,
        mainCategoryId: menu.mainCategory,
        // Override menuCategory with name for display
        menuCategory: resolvedCategoryName,
        mainCategory: resolvedMainCategoryName,
      };
    });
  }, [menus, categoryMap, mainCategoryMap]);

  // Calculate counts - FIX: Use both ID and name matching
  const calculateCounts = useCallback(
    (menusData, categoriesData, mainCategoriesData) => {
      const categoryCounts = {};
      categoriesData.forEach((category) => {
        const count = menusData.filter((menu) => {
          return (
            menu.menuCategory === category.categoryName ||
            menu.menuCategory === category.id
          );
        }).length;
        categoryCounts[category.categoryName] = count;
      });
      setMenuCountsByCategory(categoryCounts);

      const mainCategoryCounts = {};
      mainCategoriesData.forEach((mainCategory) => {
        const count = menusData.filter((menu) => {
          return (
            menu.mainCategory === mainCategory.mainCategoryName ||
            menu.mainCategory === mainCategory.id
          );
        }).length;
        mainCategoryCounts[mainCategory.mainCategoryName] = count;
      });
      setMenuCountsByMainCategory(mainCategoryCounts);

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

  useEffect(() => {
    calculateCounts(menus, categories, mainCategories);
  }, [menus, categories, mainCategories, calculateCounts]);

  // Transform categories for CategoryTabs - ADD .name property
  const transformedCategories = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      name: cat.categoryName, // CategoryTabs expects .name
    }));
  }, [categories]);

  const transformedMainCategories = useMemo(() => {
    return mainCategories.map((cat) => ({
      ...cat,
      name: cat.mainCategoryName, // CategoryTabs expects .name
    }));
  }, [mainCategories]);

  // Filter and sort menus
  const filteredAndSortedMenus = useMemo(() => {
    let filtered = [...enhancedMenus];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (menu) =>
          menu.menuName?.toLowerCase().includes(search) ||
          menu.menuDescription?.toLowerCase().includes(search) ||
          menu.menuCategoryName?.toLowerCase().includes(search)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((menu) => {
        return (
          menu.menuCategoryName === selectedCategory ||
          menu.menuCategoryId === selectedCategory ||
          menu.menuCategory === selectedCategory
        );
      });
    }

    if (selectedMainCategory) {
      filtered = filtered.filter((menu) => {
        return (
          menu.mainCategoryName === selectedMainCategory ||
          menu.mainCategoryId === selectedMainCategory ||
          menu.mainCategory === selectedMainCategory
        );
      });
    }

    if (selectedSpecialFilters.length > 0) {
      filtered = filtered.filter((menu) =>
        selectedSpecialFilters.every((filter) => menu[filter] === true)
      );
    }

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
    enhancedMenus,
    searchTerm,
    selectedCategory,
    selectedMainCategory,
    selectedSpecialFilters,
    sortOrder,
  ]);

  const availableSpecialCategories = useMemo(
    () =>
      specialCategories.filter(
        (category) => specialCategoryCounts[category.name] > 0
      ),
    [specialCategoryCounts]
  );

  // Handlers
  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleSort = useCallback((order) => setSortOrder(order), []);
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
  const clearSearch = useCallback(() => setSearchTerm(""), []);
  const removeSpecialFilter = useCallback(
    (filter) =>
      setSelectedSpecialFilters((prev) => prev.filter((f) => f !== filter)),
    []
  );
  const removeCategoryFilter = useCallback(() => setSelectedCategory(""), []);
  const removeMainCategoryFilter = useCallback(
    () => setSelectedMainCategory(""),
    []
  );
  const changeViewMode = useCallback((mode) => setViewMode(mode), []);
  const handleRetry = useCallback(() => window.location.reload(), []);

  const hasActiveFilters = useMemo(
    () =>
      searchTerm ||
      selectedCategory ||
      selectedMainCategory ||
      selectedSpecialFilters.length > 0,
    [searchTerm, selectedCategory, selectedMainCategory, selectedSpecialFilters]
  );

  if (error) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAdmin && (
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
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
        </Suspense>
      )}

      <div className="sticky top-12 z-40 bg-gray-50 border-b">
        <div className="container mx-auto px-3 py-3 max-w-7xl space-y-3">
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

          <div>
            <Suspense
              fallback={
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              }
            >
              <CategoryTabs
                categories={transformedCategories}
                mainCategories={transformedMainCategories}
                menuCountsByCategory={menuCountsByCategory}
                menuCountsByMainCategory={menuCountsByMainCategory}
                handleCategoryFilter={handleCategoryFilter}
                initialActiveTab={
                  selectedCategory || selectedMainCategory || "All"
                }
              />
            </Suspense>
            <SpecialCategoriesFilter
              categories={availableSpecialCategories}
              selectedFilters={selectedSpecialFilters}
              onToggle={handleSpecialFilterToggle}
              counts={specialCategoryCounts}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 py-3 max-w-7xl">
          <ResultsSummary
            totalResults={menus.length}
            filteredResults={filteredAndSortedMenus.length}
            hasFilters={hasActiveFilters}
            viewMode={viewMode}
            onViewModeChange={changeViewMode}
          />

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
                        // Your add to cart logic here
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

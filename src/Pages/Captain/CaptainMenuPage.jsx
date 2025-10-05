import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

import CaptainMenuCard from "components/Cards/CaptainMenuCard";
import CartPage from "../Captain/CartPage";
import CheckoutPage from "../Captain/CheckoutPage";
import OrderSuccessPage from "../Captain/OrderSuccessPage";
import { FilterSortSearch } from "components";
import { app } from "../../services/firebase/firebaseConfig";
import { specialCategories } from "../../Constants/ConfigForms/addMenuFormConfig";
import ErrorState from "atoms/Messages/ErrorState";
import ConnectionStatus from "atoms/Messages/ConnectionStatus";
import EmptyState from "atoms/Messages/EmptyState";
import SpecialCategoriesFilter from "components/Filters/SpecialCategoriesFilter";
import CartButton from "atoms/Buttons/CartButton";
import CategoryTabs from "components/CategoryTab";

const firestore = getFirestore(app);

const CaptainMenuPage = () => {
  // State management
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [menuCountsByMainCategory, setMenuCountsByMainCategory] = useState({});
  const [specialCategoryCounts, setSpecialCategoryCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  // Cart and page states
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState("menu");
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Filters and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");

  const { hotelName } = useParams();

  // Online/offline status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Calculate counts for all categories
  const calculateCounts = useCallback(
    (menusData, categoriesData, mainCategoriesData) => {
      // Category counts
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

      // Main category counts
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

  // Firestore listeners: menus, categories, mainCategories
  useEffect(() => {
    if (!hotelName) return;

    setIsLoading(true);
    setError("");

    const unsubscribes = [];

    // Menus listener
    const menusRef = collection(firestore, `hotels/${hotelName}/menu`);
    const unsubscribeMenus = onSnapshot(
      menusRef,
      (snapshot) => {
        const menusData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenus(menusData);
        setError("");
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching menus:", err);
        setError("Failed to load menu data");
        setIsLoading(false);
      }
    );
    unsubscribes.push(unsubscribeMenus);

    // Categories listener
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
      }
    );
    unsubscribes.push(unsubscribeCategories);

    // Main categories listener
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
      }
    );
    unsubscribes.push(unsubscribeMainCategories);

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [hotelName, retryCount]);

  // Calculate counts when data changes
  useEffect(() => {
    calculateCounts(menus, categories, mainCategories);
  }, [menus, categories, mainCategories, calculateCounts]);

  // Available special categories with counts > 0
  const availableSpecialCategories = useMemo(() => {
    return specialCategories.filter((sc) => specialCategoryCounts[sc.name] > 0);
  }, [specialCategoryCounts]);

  // Filter and sort menus based on filters and search
  const filteredMenuItems = useMemo(() => {
    const search = (searchTerm || "").toLowerCase();

    let filtered = menus.filter((menu) =>
      menu.menuName?.toLowerCase().includes(search)
    );

    // Apply category filter
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((menu) => {
        // Find the category object by name
        const categoryObj = categories.find(
          (cat) => cat.categoryName === selectedCategory
        );
        const mainCategoryObj = mainCategories.find(
          (cat) => cat.mainCategoryName === selectedCategory
        );

        // Check if menu's category matches (by ID or name)
        const categoryMatch =
          menu.menuCategory === selectedCategory || // Direct name match
          (categoryObj && menu.menuCategory === categoryObj.id) || // ID match
          (menu.menuCategory &&
            menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase()); // Case-insensitive name match

        // Also check main category field
        const mainCategoryMatch =
          menu.mainCategory === selectedCategory || // Direct name match
          (mainCategoryObj && menu.mainCategory === mainCategoryObj.id) || // ID match
          (menu.mainCategory &&
            menu.mainCategory.toLowerCase() === selectedCategory.toLowerCase()); // Case-insensitive name match

        return categoryMatch || mainCategoryMatch;
      });
    }

    // Apply main category filter
    if (selectedMainCategory && selectedMainCategory.trim() !== "") {
      filtered = filtered.filter((menu) => {
        // Find the main category object by name
        const mainCategoryObj = mainCategories.find(
          (cat) => cat.mainCategoryName === selectedMainCategory
        );

        return (
          menu.mainCategory === selectedMainCategory || // Direct name match
          (mainCategoryObj && menu.mainCategory === mainCategoryObj.id) || // ID match
          (menu.mainCategory &&
            menu.mainCategory.toLowerCase().trim() ===
              selectedMainCategory.toLowerCase().trim()) // Case-insensitive name match
        );
      });
    }

    // Apply special filters
    if (selectedSpecialFilters.length > 0) {
      filtered = filtered.filter((menu) =>
        selectedSpecialFilters.every((filter) => menu[filter] === true)
      );
    }

    // Apply sorting
    if (sortOrder === "lowToHigh") {
      filtered.sort(
        (a, b) =>
          parseFloat(a.finalPrice || a.menuPrice) -
          parseFloat(b.finalPrice || b.menuPrice)
      );
    } else if (sortOrder === "highToLow") {
      filtered.sort(
        (a, b) =>
          parseFloat(b.finalPrice || b.menuPrice) -
          parseFloat(a.finalPrice || a.menuPrice)
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
    categories,
    mainCategories,
  ]);

  // Cart calculations memoized (total items and amount)
  const cartCalculations = useMemo(() => {
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const totalAmount = cartItems.reduce(
      (total, item) =>
        total + (item.finalPrice || item.menuPrice) * item.quantity,
      0
    );
    return { totalItems, totalAmount };
  }, [cartItems]);

  // Get quantity of item in cart
  const getItemQuantityInCart = useCallback(
    (itemId) => {
      const item = cartItems.find((i) => i.id === itemId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  // Add or remove items from cart
  const handleAddToCart = useCallback((item, quantityChange) => {
    if (item.availability !== "Available") return;

    setCartItems((prevCart) => {
      const index = prevCart.findIndex((cartItem) => cartItem.id === item.id);

      if (index !== -1) {
        // Update existing
        const updatedCart = [...prevCart];
        const newQty = updatedCart[index].quantity + quantityChange;
        if (newQty <= 0) {
          // Remove item
          return updatedCart.filter((_, i) => i !== index);
        } else {
          updatedCart[index] = { ...updatedCart[index], quantity: newQty };
          return updatedCart;
        }
      } else if (quantityChange > 0) {
        // Add new item
        return [...prevCart, { ...item, quantity: quantityChange }];
      }

      return prevCart;
    });
  }, []);

  // Handlers for filters and search
  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleSort = useCallback((order) => setSortOrder(order), []);

  const handleCategoryFilter = useCallback(
    (category) => {
      // Check if it's a main category
      const isMainCategory = mainCategories.some(
        (mc) => mc.mainCategoryName === category
      );

      if (isMainCategory) {
        setSelectedMainCategory(category);
        setSelectedCategory("");
      } else {
        setSelectedCategory(category);
        setSelectedMainCategory("");
      }
    },
    [mainCategories]
  );

  const handleSpecialFilterToggle = useCallback((filterName) => {
    setSelectedSpecialFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedSpecialFilters([]);
    setSelectedCategory("All");
    setSelectedMainCategory("");
    setSearchTerm("");
    setSortOrder("default");
  }, []);

  // Navigation handlers for pages
  const handleGoToCart = useCallback(() => setCurrentPage("cart"), []);
  const handleGoBackToMenu = useCallback(() => setCurrentPage("menu"), []);
  const handleGoToCheckout = useCallback(() => setCurrentPage("checkout"), []);
  const handleGoBackToCart = useCallback(() => setCurrentPage("cart"), []);

  const handleOrderSuccess = useCallback((orderDetails) => {
    setOrderSuccessData(orderDetails);
    setCurrentPage("success");
  }, []);

  const handleGoHome = useCallback(() => {
    setCartItems([]);
    setCurrentPage("menu");
    setOrderSuccessData(null);
  }, []);

  const handleRetry = useCallback(() => setRetryCount((prev) => prev + 1), []);

  // Check if filters are active
  const hasActiveFilters =
    selectedSpecialFilters.length > 0 ||
    (selectedCategory && selectedCategory !== "All") ||
    selectedMainCategory !== "";

  // Transform categories for CategoryTabs
  const transformedCategories = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      name: cat.categoryName,
    }));
  }, [categories]);

  const transformedMainCategories = useMemo(() => {
    return mainCategories.map((cat) => ({
      ...cat,
      name: cat.mainCategoryName,
    }));
  }, [mainCategories]);

  // Render error state
  if (error && !isLoading) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Page routing
  if (currentPage === "success" && orderSuccessData) {
    return (
      <OrderSuccessPage
        orderDetails={orderSuccessData}
        onGoHome={handleGoHome}
      />
    );
  }

  if (currentPage === "checkout") {
    return (
      <CheckoutPage
        cartItems={cartItems}
        onGoBack={handleGoBackToCart}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  if (currentPage === "cart") {
    return (
      <CartPage
        cartItems={cartItems}
        onUpdateCart={handleAddToCart}
        onGoBack={handleGoBackToMenu}
        onCheckout={handleGoToCheckout}
      />
    );
  }

  // Main menu page render
  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus isOnline={isOnline} />

      <div className="px-4 py-3">
        {/* Search & sort */}
        <div className="mb-3">
          <FilterSortSearch
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleSort={handleSort}
          />
        </div>

        {/* Category tabs */}
        <CategoryTabs
          categories={transformedCategories}
          mainCategories={transformedMainCategories}
          menuCountsByCategory={menuCountsByCategory}
          menuCountsByMainCategory={menuCountsByMainCategory}
          handleCategoryFilter={handleCategoryFilter}
          initialActiveTab={selectedCategory || selectedMainCategory || "All"}
        />

        {/* Special categories filter */}
        {availableSpecialCategories.length > 0 && (
          <SpecialCategoriesFilter
            categories={availableSpecialCategories}
            selectedFilters={selectedSpecialFilters}
            counts={specialCategoryCounts}
            onToggle={handleSpecialFilterToggle}
          />
        )}

        {/* Menu items grid */}
        <div className="p-4">
          {isLoading ? (
            <EmptyState isLoading={true} />
          ) : filteredMenuItems.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredMenuItems.map((item) => (
                <CaptainMenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                  quantity={getItemQuantityInCart(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating cart button */}
        {cartCalculations.totalItems > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <CartButton
              totalItems={cartCalculations.totalItems}
              totalAmount={cartCalculations.totalAmount}
              onGoToCart={handleGoToCart}
              isMobile={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptainMenuPage;

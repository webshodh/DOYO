import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import {
  Search,
  ShoppingCart,
  Filter,
  X,
  LoaderCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  ArrowLeft,
  BarChart3,
} from "lucide-react";

import CaptainMenuCard from "components/Cards/CaptainMenuCard";
import CartPage from "../Captain/CartPage";
import CheckoutPage from "../Captain/CheckoutPage";
import OrderSuccessPage from "../Captain/OrderSuccessPage";
import { FilterSortSearch } from "components";
import { db } from "../../services/firebase/firebaseConfig";
import { specialCategories } from "../../Constants/addMenuFormConfig";
import ErrorState from "atoms/Messages/ErrorState";
import ConnectionStatus from "atoms/Messages/ConnectionStatus";
import EmptyState from "atoms/Messages/EmptyState";
import CategoryFilters from "components/Filters/CategoryFilters";
import SpecialCategoriesFilter from "organisms/SpecialCategoriesFilter";
import CartButton from "atoms/Buttons/CartButton";

// Main CaptainMenuPage component
const CaptainMenuPage = () => {
  // State management - organized by category

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState("menu");
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [specialCategoryCounts, setSpecialCategoryCounts] = useState({});

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Monitor online/offline status
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

  // Calculate special category counts
  const calculateSpecialCategoryCounts = useCallback((menusData) => {
    const counts = {};
    specialCategories.forEach((category) => {
      const categoryMenus = menusData.filter(
        (menu) => menu[category.name] === true
      );
      counts[category.name] = categoryMenus.length;
    });
    setSpecialCategoryCounts(counts);
  }, []);

  // Fetch menu data
  useEffect(() => {
    if (!hotelName) return;

    setIsLoading(true);
    setError("");

    const menuRef = ref(db, `/hotels/${hotelName}/menu/`);
    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data !== null) {
            const menusData = Object.entries(data).map(([key, value]) => ({
              ...value,
              id: key,
            }));
            setMenus(menusData);
            calculateSpecialCategoryCounts(menusData);
            setError("");
          } else {
            setMenus([]);
            setSpecialCategoryCounts({});
          }
        } catch (err) {
          console.error("Error processing menu data:", err);
          setError("Failed to process menu data");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Firebase error:", error);
        setError("Failed to connect to database");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hotelName, retryCount, calculateSpecialCategoryCounts]);

  // Fetch categories
  useEffect(() => {
    if (!hotelName) return;

    const categoriesRef = ref(db, `/hotels/${hotelName}/categories/`);
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const categoriesData = Object.values(data);
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);

  // Fetch main categories
  useEffect(() => {
    if (!hotelName) return;

    const mainCategoriesRef = ref(db, `/hotels/${hotelName}/Maincategories/`);
    const unsubscribe = onValue(mainCategoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const mainCategoriesData = Object.values(data);
        setMainCategories(mainCategoriesData);
      } else {
        setMainCategories([]);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);

  // Memoized dynamic categories
  const dynamicCategories = useMemo(() => {
    const allCategories = ["All"];

    mainCategories.forEach((mainCategory) => {
      if (
        mainCategory.mainCategoryName &&
        !allCategories.includes(mainCategory.mainCategoryName)
      ) {
        allCategories.push(mainCategory.mainCategoryName);
      }
    });

    categories.forEach((category) => {
      if (
        category.categoryName &&
        !allCategories.includes(category.categoryName)
      ) {
        allCategories.push(category.categoryName);
      }
    });

    return allCategories;
  }, [mainCategories, categories]);

  // Memoized available special categories
  const availableSpecialCategories = useMemo(() => {
    return specialCategories.filter(
      (category) => specialCategoryCounts[category.name] > 0
    );
  }, [specialCategoryCounts]);

  // Memoized filtered and sorted items
  const filteredMenuItems = useMemo(() => {
    const search = (searchTerm || "").toLowerCase();

    let filteredItems = menus.filter((menu) =>
      menu.menuName?.toLowerCase().includes(search)
    );

    // Apply category filters
    if (selectedCategory && selectedCategory !== "All") {
      filteredItems = filteredItems.filter(
        (menu) =>
          (menu.menuCategory &&
            menu.menuCategory.toLowerCase() ===
              selectedCategory.toLowerCase()) ||
          (menu.mainCategory &&
            menu.mainCategory.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    if (selectedMainCategory && selectedMainCategory.trim() !== "") {
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.mainCategory &&
          menu.mainCategory.toLowerCase().trim() ===
            selectedMainCategory.toLowerCase().trim()
      );
    }

    // Apply special filters
    if (selectedSpecialFilters.length > 0) {
      filteredItems = filteredItems.filter((menu) =>
        selectedSpecialFilters.every((filter) => menu[filter] === true)
      );
    }

    // Apply sorting
    if (sortOrder === "lowToHigh") {
      filteredItems.sort(
        (a, b) =>
          parseFloat(a.finalPrice || a.menuPrice) -
          parseFloat(b.finalPrice || b.menuPrice)
      );
    } else if (sortOrder === "highToLow") {
      filteredItems.sort(
        (a, b) =>
          parseFloat(b.finalPrice || b.menuPrice) -
          parseFloat(a.finalPrice || a.menuPrice)
      );
    }

    return filteredItems;
  }, [
    menus,
    searchTerm,
    selectedCategory,
    selectedMainCategory,
    selectedSpecialFilters,
    sortOrder,
  ]);

  // Memoized cart calculations
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

  // Memoized helper to get item quantity in cart
  const getItemQuantityInCart = useCallback(
    (itemId) => {
      const cartItem = cartItems.find((item) => item.id === itemId);
      return cartItem ? cartItem.quantity : 0;
    },
    [cartItems]
  );

  // Cart management
  const handleAddToCart = useCallback((item, quantityChange) => {
    if (item.availability !== "Available") return;

    setCartItems((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        const newCart = [...prevCart];
        const newQuantity =
          newCart[existingItemIndex].quantity + quantityChange;

        if (newQuantity <= 0) {
          return newCart.filter((_, index) => index !== existingItemIndex);
        } else {
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newQuantity,
          };
          return newCart;
        }
      } else if (quantityChange > 0) {
        return [...prevCart, { ...item, quantity: quantityChange }];
      }

      return prevCart;
    });
  }, []);

  // Filter handlers
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSort = useCallback((order) => {
    setSortOrder(order);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedMainCategory("");
  }, []);

  const handleMainCategoryFilter = useCallback((mainCategory) => {
    setSelectedMainCategory(mainCategory);
    setSelectedCategory("All");
  }, []);

  const handleSpecialFilterToggle = useCallback((filterName) => {
    setSelectedSpecialFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  }, []);

  const handleRemoveFilter = useCallback(
    (filter, type) => {
      if (type === "special") {
        handleSpecialFilterToggle(filter);
      } else if (type === "category") {
        setSelectedCategory("All");
      } else if (type === "mainCategory") {
        setSelectedMainCategory("");
      }
    },
    [handleSpecialFilterToggle]
  );

  const clearAllFilters = useCallback(() => {
    setSelectedSpecialFilters([]);
    setSelectedCategory("All");
    setSelectedMainCategory("");
    setSearchTerm("");
    setSortOrder("default");
  }, []);

  // Page navigation handlers
  const handleGoToCart = useCallback(() => {
    setCurrentPage("cart");
  }, []);

  const handleGoBackToMenu = useCallback(() => {
    setCurrentPage("menu");
  }, []);

  const handleGoToCheckout = useCallback(() => {
    setCurrentPage("checkout");
  }, []);

  const handleGoBackToCart = useCallback(() => {
    setCurrentPage("cart");
  }, []);

  const handleOrderSuccess = useCallback((orderDetails) => {
    setOrderSuccessData(orderDetails);
    setCurrentPage("success");
  }, []);

  const handleGoHome = useCallback(() => {
    setCartItems([]);
    setCurrentPage("menu");
    setOrderSuccessData(null);
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  // Check if there are active filters
  const hasActiveFilters =
    selectedSpecialFilters.length > 0 ||
    selectedCategory !== "All" ||
    selectedMainCategory !== "";

  // Error state
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
      {/* Connection Status */}
      <ConnectionStatus isOnline={isOnline} />

      <div className="px-4 py-3">
        {/* Search Bar */}
        <div className="mb-3">
          <FilterSortSearch
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleSort={handleSort}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-3">
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
        </div>

        {/* Filters Section */}
        <div
          className={`${
            showFilters ? "block" : "hidden"
          } md:block space-y-4 animate-fadeIn`}
        >
          {/* Category Filter */}
          <div>
            <CategoryFilters
              categories={dynamicCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategoryFilter}
            />
          </div>

          {/* Special Categories Filter */}
          {availableSpecialCategories.length > 0 && (
            <div>
              <SpecialCategoriesFilter
                categories={availableSpecialCategories}
                selectedFilters={selectedSpecialFilters}
                counts={specialCategoryCounts}
                onToggle={handleSpecialFilterToggle}
              />
            </div>
          )}
        </div>

        {/* Menu Items Grid */}
        <div className="p-4">
          {isLoading ? (
            <EmptyState isLoading={true} />
          ) : filteredMenuItems.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
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

        {/* Floating Cart Button */}
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

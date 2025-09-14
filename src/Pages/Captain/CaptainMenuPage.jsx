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
import { db } from "../../data/firebase/firebaseConfig";
import { specialCategories } from "../../Constants/addMenuFormConfig";

// Separate component for cart button
const CartButton = ({
  totalItems,
  totalAmount,
  onGoToCart,
  isMobile = false,
}) => {
  if (isMobile && totalItems === 0) return null;

  return (
    <button
      onClick={onGoToCart}
      className={`relative bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-all duration-200 shadow-lg ${
        isMobile
          ? "p-4 rounded-full fixed bottom-6 right-4 z-40 transform hover:scale-110 animate-pulse"
          : "px-3 py-2 sm:px-4"
      }`}
      aria-label={`View cart with ${totalItems} items`}
    >
      <ShoppingCart size={isMobile ? 24 : 18} className="sm:w-5 sm:h-5" />
      {!isMobile && (
        <span className="font-semibold text-sm sm:text-base">
          ₹{totalAmount}
        </span>
      )}
      {totalItems > 0 && (
        <span
          className={`absolute bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold ${
            isMobile
              ? "-top-2 -right-2 h-6 w-6 animate-bounce"
              : "-top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6"
          }`}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
};

// Header component with navigation
const MenuHeader = ({ hotelName, onGoToDashboard, cartInfo }) => (
  <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
    <div className="px-4 py-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              Create New Order
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {hotelName && `${hotelName} • `}Select items for your order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoToDashboard}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>

          <CartButton
            totalItems={cartInfo.totalItems}
            totalAmount={cartInfo.totalAmount}
            onGoToCart={cartInfo.onGoToCart}
          />
        </div>
      </div>
    </div>
  </div>
);

// Category filters component
const CategoryFilters = ({
  categories,
  selectedCategory,
  onCategorySelect,
  className = "",
}) => (
  <div className={`overflow-x-auto pb-2 ${className}`}>
    <div className="flex space-x-2 min-w-max">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategorySelect(category)}
          className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            selectedCategory === category
              ? "bg-orange-500 text-white shadow-md transform scale-105"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-102"
          }`}
          aria-pressed={selectedCategory === category}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
);

// Special category filters component
const SpecialCategoryFilters = ({
  categories,
  selectedFilters,
  counts,
  onToggleFilter,
}) => (
  <div className="overflow-x-auto pb-2">
    <div className="flex space-x-2 min-w-max">
      {categories.map((category) => {
        const isSelected = selectedFilters.includes(category.name);
        const Icon = category.icon;
        const count = counts[category.name] || 0;

        return (
          <button
            key={category.name}
            onClick={() => onToggleFilter(category.name)}
            className={`flex-shrink-0 flex items-center px-3 py-2 rounded-full border-2 transition-all duration-200 transform hover:scale-105 ${
              isSelected
                ? `${category.activeColor} text-white border-transparent shadow-md`
                : `${category.bgColor} ${category.iconColor} ${category.borderColor} hover:shadow-sm`
            }`}
            aria-pressed={isSelected}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              {category.label}
            </span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                isSelected
                  ? "bg-white bg-opacity-20 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// Active filters display component
const ActiveFiltersDisplay = ({
  selectedFilters,
  selectedCategory,
  selectedMainCategory,
  onRemoveFilter,
  onClearAll,
}) => {
  const hasFilters =
    selectedFilters.length > 0 ||
    selectedCategory !== "All" ||
    selectedMainCategory !== "";

  if (!hasFilters) return null;

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Active Filters:
        </span>
        <button
          onClick={onClearAll}
          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedFilters.map((filter) => {
          const category = specialCategories.find((c) => c.name === filter);
          return (
            <span
              key={filter}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 animate-fadeIn"
            >
              {category?.label}
              <button
                onClick={() => onRemoveFilter(filter, "special")}
                className="ml-1 text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                aria-label={`Remove ${category?.label} filter`}
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
        {selectedCategory && selectedCategory !== "All" && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 animate-fadeIn">
            {selectedCategory}
            <button
              onClick={() => onRemoveFilter(selectedCategory, "category")}
              className="ml-1 text-green-600 hover:text-green-800 p-0.5 rounded-full hover:bg-green-200 transition-colors"
              aria-label={`Remove ${selectedCategory} filter`}
            >
              <X size={12} />
            </button>
          </span>
        )}
        {selectedMainCategory && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 animate-fadeIn">
            {selectedMainCategory}
            <button
              onClick={() =>
                onRemoveFilter(selectedMainCategory, "mainCategory")
              }
              className="ml-1 text-purple-600 hover:text-purple-800 p-0.5 rounded-full hover:bg-purple-200 transition-colors"
              aria-label={`Remove ${selectedMainCategory} filter`}
            >
              <X size={12} />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ hasFilters, onClearFilters, isLoading = false }) => (
  <div className="text-center py-16">
    <div className="mb-4">
      {isLoading ? (
        <LoaderCircle
          size={64}
          className="mx-auto text-gray-300 animate-spin"
        />
      ) : (
        <ShoppingCart size={64} className="mx-auto text-gray-300" />
      )}
    </div>
    <h2 className="text-gray-700 text-xl font-semibold mb-2">
      {isLoading ? "Loading menu..." : "No items found"}
    </h2>
    <p className="text-gray-500 text-sm mb-4">
      {isLoading
        ? "Please wait while we fetch the latest menu items"
        : "Try adjusting your search or category filter"}
    </p>
    {hasFilters && !isLoading && (
      <button
        onClick={onClearFilters}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Clear All Filters
      </button>
    )}
  </div>
);

// Error state component
const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="mb-4">
        <AlertCircle size={64} className="mx-auto text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        {error ||
          "Failed to load menu items. Please check your connection and try again."}
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <LoaderCircle size={16} />
        Try Again
      </button>
    </div>
  </div>
);

// Connection status indicator
const ConnectionStatus = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="bg-red-100 border border-red-200 p-2 text-center">
      <div className="flex items-center justify-center gap-2 text-red-800 text-sm">
        <WifiOff size={16} />
        <span>No internet connection. Some features may not work.</span>
      </div>
    </div>
  );
};

// Main CaptainMenuPage component
const CaptainMenuPage = () => {
  // State management
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [currentPage, setCurrentPage] = useState("menu");
  const [orderSuccessData, setOrderSuccessData] = useState(null);
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
  }, [hotelName, retryCount]);

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

  const handleGoToDashboard = useCallback(() => {
    navigate("/captain/dashboard");
  }, [navigate]);

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

      {/* Header */}
      <MenuHeader
        hotelName={hotelName}
        onGoToDashboard={handleGoToDashboard}
        cartInfo={{
          totalItems: cartCalculations.totalItems,
          totalAmount: cartCalculations.totalAmount,
          onGoToCart: handleGoToCart,
        }}
      />

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
            <h3 className="text-sm font-semibold text-gray-700 mb-2 md:hidden">
              Categories
            </h3>
            <CategoryFilters
              categories={dynamicCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategoryFilter}
            />
          </div>

          {/* Special Categories Filter */}
          {availableSpecialCategories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Special Categories
              </h3>
              <SpecialCategoryFilters
                categories={availableSpecialCategories}
                selectedFilters={selectedSpecialFilters}
                counts={specialCategoryCounts}
                onToggleFilter={handleSpecialFilterToggle}
              />
            </div>
          )}

          {/* Active Filters Display - Desktop */}
          <div className="hidden md:block">
            <ActiveFiltersDisplay
              selectedFilters={selectedSpecialFilters}
              selectedCategory={selectedCategory}
              selectedMainCategory={selectedMainCategory}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearAllFilters}
            />
          </div>
        </div>
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

      {/* Floating Cart Button for Mobile */}
      <CartButton
        totalItems={cartCalculations.totalItems}
        totalAmount={cartCalculations.totalAmount}
        onGoToCart={handleGoToCart}
        isMobile={true}
      />

      {/* Bottom Padding for Mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default CaptainMenuPage;

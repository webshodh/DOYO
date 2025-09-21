// src/Pages/Captain/CaptainMenuPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  CheckCircle,
  RefreshCw,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and hooks
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy as firestoreOrderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";

// ✅ NEW: Import context hooks
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";

// Components
import CaptainMenuCard from "components/Cards/CaptainMenuCard";
import CartPage from "../Captain/CartPage";
import CheckoutPage from "../Captain/CheckoutPage";
import OrderSuccessPage from "../Captain/OrderSuccessPage";
import { FilterSortSearch } from "components";
import { specialCategories } from "../../Constants/ConfigForms/addMenuFormConfig";
import ErrorState from "atoms/Messages/ErrorState";
import ConnectionStatus from "atoms/Messages/ConnectionStatus";
import EmptyState from "atoms/Messages/EmptyState";
import CategoryFilters from "components/Filters/CategoryFilters";
import SpecialCategoriesFilter from "organisms/SpecialCategoriesFilter";
import CartButton from "atoms/Buttons/CartButton";
import LoadingSpinner from "../../atoms/LoadingSpinner";

// Main CaptainMenuPage component
const CaptainMenuPage = () => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks
  const { currentUser, isAuthenticated } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

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
  const [specialCategoryCounts, setSpecialCategoryCounts] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ NEW: Get hotel ID for queries
  const hotelId = useMemo(() => {
    return selectedHotel?.id || hotelName;
  }, [selectedHotel, hotelName]);

  // ✅ ENHANCED: Use Firestore collection hooks for menu data
  const {
    documents: menus,
    loading: menusLoading,
    error: menusError,
    connectionStatus: menusConnection,
    refresh: refreshMenus,
  } = useFirestoreCollection("menuItems", {
    where: hotelId ? [["hotelId", "==", hotelId]] : null,
    orderBy: [["menuName", "asc"]],
    realtime: true,
    enableRetry: true,
  });

  // ✅ ENHANCED: Use Firestore collection hooks for categories
  const {
    documents: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFirestoreCollection("categories", {
    where: hotelId ? [["hotelId", "==", hotelId]] : null,
    orderBy: [["categoryName", "asc"]],
    realtime: true,
  });

  // ✅ ENHANCED: Use Firestore collection hooks for main categories
  const { documents: mainCategories, loading: mainCategoriesLoading } =
    useFirestoreCollection("mainCategories", {
      where: hotelId ? [["hotelId", "==", hotelId]] : null,
      orderBy: [["mainCategoryName", "asc"]],
      realtime: true,
    });

  // ✅ NEW: Auto-select hotel if not selected
  useEffect(() => {
    if (hotelName && !selectedHotel) {
      const loadHotelInfo = async () => {
        try {
          const hotelsRef = collection(db, "hotels");
          const hotelQuery = query(hotelsRef, where("name", "==", hotelName));
          const hotelsSnapshot = await getDocs(hotelQuery);

          if (!hotelsSnapshot.empty) {
            const hotelDoc = hotelsSnapshot.docs[0];
            selectHotelById(hotelDoc.id);
          }
        } catch (error) {
          console.error("Error loading hotel info:", error);
        }
      };

      loadHotelInfo();
    }
  }, [hotelName, selectedHotel, selectHotelById]);

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

  // ✅ ENHANCED: Calculate special category counts from Firestore data
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

  // Update special category counts when menus change
  useEffect(() => {
    if (menus && menus.length > 0) {
      calculateSpecialCategoryCounts(menus);
    } else {
      setSpecialCategoryCounts({});
    }
  }, [menus, calculateSpecialCategoryCounts]);

  // ✅ ENHANCED: Memoized dynamic categories from Firestore data
  const dynamicCategories = useMemo(() => {
    const allCategories = ["All"];

    if (mainCategories && mainCategories.length > 0) {
      mainCategories.forEach((mainCategory) => {
        if (
          mainCategory.mainCategoryName &&
          !allCategories.includes(mainCategory.mainCategoryName)
        ) {
          allCategories.push(mainCategory.mainCategoryName);
        }
      });
    }

    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        if (
          category.categoryName &&
          !allCategories.includes(category.categoryName)
        ) {
          allCategories.push(category.categoryName);
        }
      });
    }

    return allCategories;
  }, [mainCategories, categories]);

  // Memoized available special categories
  const availableSpecialCategories = useMemo(() => {
    return specialCategories.filter(
      (category) => specialCategoryCounts[category.name] > 0
    );
  }, [specialCategoryCounts]);

  // ✅ ENHANCED: Memoized filtered and sorted items with Firestore data
  const filteredMenuItems = useMemo(() => {
    if (!menus || menus.length === 0) return [];

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

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (menusConnection === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm mb-2">
          <Wifi className="animate-pulse" size={16} />
          <span>Loading menu...</span>
        </div>
      );
    } else if (menusConnection === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
          <WifiOff size={16} />
          <span>Connection Error</span>
        </div>
      );
    } else if (menusConnection === "connected" && menus) {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
          <CheckCircle size={16} />
          <span>Menu loaded ({menus.length} items)</span>
        </div>
      );
    }
    return null;
  };

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

  // ✅ NEW: Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshMenus();
    } catch (error) {
      console.error("Error refreshing menu:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshMenus]);

  // Check if there are active filters
  const hasActiveFilters =
    selectedSpecialFilters.length > 0 ||
    selectedCategory !== "All" ||
    selectedMainCategory !== "";

  // ✅ ENHANCED: Loading and error states
  const isLoading = menusLoading || categoriesLoading || mainCategoriesLoading;
  const error = menusError || categoriesError;

  // Error state
  if (error && !isLoading && !menus?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorState
          error={error}
          onRetry={handleRefresh}
          title="Menu Loading Error"
          description="Unable to load the restaurant menu. Please check your connection and try again."
        />
      </div>
    );
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
      {/* ✅ ENHANCED: Connection Status */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <ConnectionStatusIndicator />
          {selectedHotel && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {selectedHotel.businessName || selectedHotel.name}
              </span>
            </div>
          )}
          {isRefreshing && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <RefreshCw className="animate-spin" size={16} />
              <span>Refreshing...</span>
            </div>
          )}
        </div>
      </div>

      <ConnectionStatus isOnline={isOnline} />

      <div className="px-4 py-3">
        {/* Search Bar */}
        <div className="mb-3">
          <FilterSortSearch
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleSort={handleSort}
            disabled={isLoading}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={isLoading}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                !
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
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
              loading={categoriesLoading || mainCategoriesLoading}
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
                loading={isLoading}
              />
            </div>
          )}
        </div>

        {/* ✅ ENHANCED: Menu Items Grid with better loading states */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading restaurant menu..." />
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
              icon={Search}
              title={
                hasActiveFilters
                  ? "No items match your filters"
                  : "Menu not available"
              }
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters to find items"
                  : "The restaurant menu is currently not available"
              }
              actionLabel={hasActiveFilters ? "Clear Filters" : "Refresh Menu"}
              onAction={hasActiveFilters ? clearAllFilters : handleRefresh}
            />
          ) : (
            <>
              {/* ✅ NEW: Results summary */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredMenuItems.length}
                  {filteredMenuItems.length === 1 ? " item" : " items"}
                  {hasActiveFilters &&
                    ` (filtered from ${menus?.length || 0} total)`}
                </p>
                {cartCalculations.totalItems > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    {cartCalculations.totalItems} items in cart
                  </p>
                )}
              </div>

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
            </>
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

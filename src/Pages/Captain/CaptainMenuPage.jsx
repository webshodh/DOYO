import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Filter } from "lucide-react";

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
import CategoryFilters from "components/Filters/CategoryFilters";
import SpecialCategoriesFilter from "organisms/SpecialCategoriesFilter";
import CartButton from "atoms/Buttons/CartButton";

const firestore = getFirestore(app);

const CaptainMenuPage = () => {
  // State management
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
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

  // Calculate special category counts helper
  const calculateSpecialCategoryCounts = useCallback((menusData) => {
    const counts = {};
    specialCategories.forEach((category) => {
      counts[category.name] = menusData.filter(
        (menu) => menu[category.name] === true
      ).length;
    });
    setSpecialCategoryCounts(counts);
  }, []);

  // Firestore listeners: menus, categories, mainCategories
  useEffect(() => {
    if (!hotelName) return;

    setIsLoading(true);
    setError("");

    const unsubscribes = [];

    const menusRef = collection(firestore, `hotels/${hotelName}/menu`);
    const unsubscribeMenus = onSnapshot(
      menusRef,
      (snapshot) => {
        const menusData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenus(menusData);
        calculateSpecialCategoryCounts(menusData);
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
        setError("Failed to load categories");
      }
    );
    unsubscribes.push(unsubscribeCategories);

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
        setError("Failed to load main categories");
      }
    );
    unsubscribes.push(unsubscribeMainCategories);

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [hotelName, retryCount, calculateSpecialCategoryCounts]);

  // Compose dynamic categories list from mainCategories and categories
  const dynamicCategories = useMemo(() => {
    const allCategories = new Set(["All"]);
    mainCategories.forEach((mc) => {
      if (mc.mainCategoryName) allCategories.add(mc.mainCategoryName);
    });
    categories.forEach((c) => {
      if (c.categoryName) allCategories.add(c.categoryName);
    });
    return Array.from(allCategories);
  }, [mainCategories, categories]);

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

    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (menu) =>
          (menu.menuCategory &&
            menu.menuCategory.toLowerCase() ===
              selectedCategory.toLowerCase()) ||
          (menu.mainCategory &&
            menu.mainCategory.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    if (selectedMainCategory && selectedMainCategory.trim() !== "") {
      filtered = filtered.filter(
        (menu) =>
          menu.mainCategory &&
          menu.mainCategory.toLowerCase().trim() ===
            selectedMainCategory.toLowerCase().trim()
      );
    }

    if (selectedSpecialFilters.length > 0) {
      filtered = filtered.filter((menu) =>
        selectedSpecialFilters.every((filter) => menu[filter] === true)
      );
    }

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
  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedMainCategory("");
  }, []);
  const handleMainCategoryFilter = useCallback((mainCategory) => {
    setSelectedMainCategory(mainCategory);
    setSelectedCategory("");
  }, []);
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

  const hasActiveFilters =
    selectedSpecialFilters.length > 0 ||
    (selectedCategory && selectedCategory !== "All") ||
    selectedMainCategory !== "";

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

        {/* Mobile filter toggle */}
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

        {/* Filters section */}
        <div
          className={`${
            showFilters ? "block" : "hidden"
          } md:block space-y-4 animate-fadeIn`}
        >
          <CategoryFilters
            categories={dynamicCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategoryFilter}
          />
          {availableSpecialCategories.length > 0 && (
            <SpecialCategoriesFilter
              categories={availableSpecialCategories}
              selectedFilters={selectedSpecialFilters}
              counts={specialCategoryCounts}
              onToggle={handleSpecialFilterToggle}
            />
          )}
        </div>

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

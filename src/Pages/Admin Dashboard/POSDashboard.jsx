import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  User,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  Package,
  Clock,
  CheckCircle,
  Grid3X3,
  List,
  Calculator,
  Printer,
  Trash2,
  Star,
  Tag,
  Users,
  Home,
  Utensils,
  Coffee,
  Wine,
  ChefHat,
} from "lucide-react";

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
import SpecialCategoriesFilter from "organisms/SpecialCategoriesFilter";
import CartButton from "atoms/Buttons/CartButton";
import CategoryTabs from "molecules/CategoryTab";
import { PageTitle } from "atoms";

const firestore = getFirestore(app);

const POSDashboard = () => {
  // Your existing state management (keeping all exactly as is)
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

  // Cart and page states (keeping existing)
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState("menu");
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Filters and search states (keeping existing)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");

  // POS UI states - matching the reference design
  const [viewMode, setViewMode] = useState("grid");

  const { hotelName } = useParams();

  // All your existing useEffect and logic (keeping exactly as is)
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
      }
    );
    unsubscribes.push(unsubscribeMainCategories);

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [hotelName, retryCount]);

  useEffect(() => {
    calculateCounts(menus, categories, mainCategories);
  }, [menus, categories, mainCategories, calculateCounts]);

  // All your existing filtering logic
  const availableSpecialCategories = useMemo(() => {
    return specialCategories.filter((sc) => specialCategoryCounts[sc.name] > 0);
  }, [specialCategoryCounts]);

  const filteredMenuItems = useMemo(() => {
    const search = (searchTerm || "").toLowerCase();

    let filtered = menus.filter(
      (menu) =>
        menu.availability === "Available" &&
        menu.menuName?.toLowerCase().includes(search)
    );

    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((menu) => {
        const categoryObj = categories.find(
          (cat) => cat.categoryName === selectedCategory
        );
        const mainCategoryObj = mainCategories.find(
          (cat) => cat.mainCategoryName === selectedCategory
        );

        const categoryMatch =
          menu.menuCategory === selectedCategory ||
          (categoryObj && menu.menuCategory === categoryObj.id) ||
          (menu.menuCategory &&
            menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase());

        const mainCategoryMatch =
          menu.mainCategory === selectedCategory ||
          (mainCategoryObj && menu.mainCategory === mainCategoryObj.id) ||
          (menu.mainCategory &&
            menu.mainCategory.toLowerCase() === selectedCategory.toLowerCase());

        return categoryMatch || mainCategoryMatch;
      });
    }

    if (selectedMainCategory && selectedMainCategory.trim() !== "") {
      filtered = filtered.filter((menu) => {
        const mainCategoryObj = mainCategories.find(
          (cat) => cat.mainCategoryName === selectedMainCategory
        );

        return (
          menu.mainCategory === selectedMainCategory ||
          (mainCategoryObj && menu.mainCategory === mainCategoryObj.id) ||
          (menu.mainCategory &&
            menu.mainCategory.toLowerCase().trim() ===
              selectedMainCategory.toLowerCase().trim())
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

  const cartCalculations = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.finalPrice || item.menuPrice) * item.quantity,
      0
    );
    const taxRate = 0.18; // 18% GST
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, tax, total, totalItems };
  }, [cartItems]);

  // All your existing handlers
  const getItemQuantityInCart = useCallback(
    (itemId) => {
      const item = cartItems.find((i) => i.id === itemId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  const handleAddToCart = useCallback((item, quantityChange = 1) => {
    if (item.availability !== "Available") return;

    setCartItems((prevCart) => {
      const index = prevCart.findIndex((cartItem) => cartItem.id === item.id);

      if (index !== -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[index].quantity + quantityChange;
        if (newQty <= 0) {
          return updatedCart.filter((_, i) => i !== index);
        } else {
          updatedCart[index] = { ...updatedCart[index], quantity: newQty };
          return updatedCart;
        }
      } else if (quantityChange > 0) {
        return [...prevCart, { ...item, quantity: quantityChange }];
      }

      return prevCart;
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleSort = useCallback((order) => setSortOrder(order), []);

  const handleCategoryFilter = useCallback(
    (category) => {
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

  // Create categories array for the horizontal tabs (mimicking reference design)
  const horizontalCategories = useMemo(() => {
    const allCategories = [
      { id: "all", categoryName: "All", icon: Grid3X3 },
      ...categories.map((cat) => ({
        ...cat,
        categoryName: cat.categoryName,
        icon: Utensils,
      })),
      ...mainCategories.map((cat) => ({
        ...cat,
        categoryName: cat.mainCategoryName,
        icon: ChefHat,
      })),
    ];
    return allCategories;
  }, [categories, mainCategories]);

  // Your existing page routing logic
  if (error && !isLoading) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

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

  // EXACT REPLICA OF REFERENCE DESIGN with your data and components
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ConnectionStatus isOnline={isOnline} />

      {/* Menu Section - Left Side */}
      <div className="flex-1 flex flex-col">
        {/* Header - Exact copy from reference */}
        {/* Header */}

        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
          <PageTitle
            pageTitle="POS Dashboard"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="POS"
          />
        </div>

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
      </div>

      {/* Cart Section - Right Side - Exact copy from reference */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              <span>Order Cart</span>
            </h2>
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
              {cartCalculations.totalItems} items
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.menuName}
                      </h4>
                      <p className="text-green-600 font-bold">
                        ₹{item.finalPrice || item.menuPrice}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-lg font-bold text-gray-900">
                      ₹
                      {(
                        (item.finalPrice || item.menuPrice) * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cart is empty
              </h3>
              <p className="text-gray-600">Add items from the menu</p>
            </div>
          )}
        </div>

        {/* Cart Summary and Actions */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{cartCalculations.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18%)</span>
                <span>₹{cartCalculations.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>₹{cartCalculations.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToCart}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-6 h-6" />
                <span>Go to Cart</span>
              </button>

              <button
                onClick={clearCart}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Clear Cart</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cart Button - keeping your existing logic */}
      {cartCalculations.totalItems > 0 && (
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          <CartButton
            totalItems={cartCalculations.totalItems}
            totalAmount={cartCalculations.total}
            onGoToCart={handleGoToCart}
            isMobile={true}
          />
        </div>
      )}
    </div>
  );
};

export default POSDashboard;

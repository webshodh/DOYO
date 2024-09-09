// ViewMenu.js
import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { FilterSortSearch, HorizontalMenuCard } from "../../components";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import { colors } from "../../theme/theme";
import CategoryTabs from "../../components/CategoryTab";
import { IoMdAddCircle } from "react-icons/io";
import { FaCircleMinus } from "react-icons/fa6";
import { IoIosArrowUp } from "react-icons/io";

const POS = () => {
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [modeldata, setModeldata] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [menuCounts, setMenuCounts] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [activeMainCategory, setActiveMainCategory] = useState("");
  const navigate = useNavigate();
  const [hotelName, setHotelName] = useState("");
  const [cardShow, setCardShow] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [mainCategories, setMainCategories] = useState([]);
  // State for discount values
  const [fixedDiscount, setFixedDiscount] = useState(0);
  const [percentDiscount, setPercentDiscount] = useState(0);
  const [mainCategoryCounts, setMainCategoryCounts] = useState({});

  const [showDiscount, setShowDiscount] = useState(false);
  const [showTax, setShowTax] = useState(false);

  // State for GST rates (default to 2.5% each)
  const [cgstRate, setCgstRate] = useState(2.5);
  const [sgstRate, setSgstRate] = useState(2.5);
  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 3];
    setHotelName(hotelNameFromPath);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/menu/`), (snapshot) => {
      setMenus([]);
      const data = snapshot.val();
      if (data !== null) {
        setMenus(Object.values(data));
        setFilteredMenus(Object.values(data)); // Set the initial filtered menus
      }
    });
  }, [hotelName]);

  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/categories/`), (snapshot) => {
      setCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        const categoriesData = Object.values(data);
        setCategories(categoriesData);
        fetchMenuCounts(categoriesData);
      }
    });
  }, [hotelName]);

  const fetchMenuCounts = (categoriesData) => {
    const counts = {};
    categoriesData.forEach((category) => {
      const categoryMenus = menus.filter(
        (menu) => menu.menuCategory === category.categoryName
      );
      counts[category.categoryName] = categoryMenus.length;
    });
    setMenuCounts(counts);
  };

  // Fetch Maincategories
  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/Maincategories/`), (snapshot) => {
      setMainCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        const mainCategoriesData = Object.values(data);
        setMainCategories(mainCategoriesData);
        fetchMainCategoryCounts(mainCategoriesData);
      }
    });
  }, [hotelName]);

  const fetchMainCategoryCounts = (mainCategoriesData) => {
    const counts = {};
    mainCategoriesData.forEach((mainCategory) => {
      const mainCategoryMenus = menus.filter(
        (menu) => menu.mainCategory === mainCategory.mainCategoryName
      );
      counts[mainCategory.mainCategoryName] = mainCategoryMenus.length;
    });
    setMainCategoryCounts(counts);
  };

  useEffect(() => {
    const countsByMainCategory = {};
    menus.forEach((menu) => {
      const mainCategory = menu.mainCategory;
      countsByMainCategory[mainCategory] =
        (countsByMainCategory[mainCategory] || 0) + 1;
    });
    setMainCategoryCounts(countsByMainCategory);
  }, [menus]);

  useEffect(() => {
    const countsByCategory = {};
    menus.forEach((menu) => {
      const category = menu.menuCategory;
      countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    });
    setMenuCountsByCategory(countsByCategory);
  }, [menus]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setActiveCategory(category);
    setSelectedMainCategory("");
    setActiveMainCategory("");
  };

  const handleMainCategoryFilter = (event) => {
    // Using data-* attribute to get the category name
    const categoryName = event.target.getAttribute("data-category");
    if (categoryName === null) {
      // Handle "All" button click
      setSelectedMainCategory("");
      setActiveMainCategory("");
    }
    setSelectedMainCategory(categoryName);
    setActiveMainCategory(categoryName);
  };

  const filterAndSortItems = () => {
    // Ensure search term is a string
    const search = (searchTerm || "").toLowerCase();

    // Filter by search term
    let filteredItems = filteredMenus.filter((menu) =>
      menu.menuName.toLowerCase().includes(search)
    );

    // Filter by selected category
    if (
      selectedCategory &&
      typeof selectedCategory === "string" &&
      selectedCategory.trim() !== ""
    ) {
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.menuCategory &&
          menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by selected main category
    if (
      selectedMainCategory &&
      typeof selectedMainCategory === "string" &&
      selectedMainCategory.trim() !== ""
    ) {
      // If a main category is selected, filter items by that main category
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.mainCategory &&
          menu.mainCategory.toLowerCase().trim() ===
            selectedMainCategory.toLowerCase().trim()
      );
    }

    // Sort by price
    if (sortOrder === "lowToHigh") {
      filteredItems.sort(
        (a, b) => parseFloat(a.menuPrice) - parseFloat(b.menuPrice)
      );
    } else if (sortOrder === "highToLow") {
      filteredItems.sort(
        (a, b) => parseFloat(b.menuPrice) - parseFloat(a.menuPrice)
      );
    }

    return filteredItems;
  };

  const filteredAndSortedItems = filterAndSortItems();

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };
  console.log("filteredAndSortedItems", filteredAndSortedItems);

  const addToCart = (menuId) => {
    const selectedItem = menus.find((menu) => menu.uuid === menuId);

    const existingItem = cartItems.find((item) => item.uuid === menuId);

    if (existingItem) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.uuid === menuId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems((prevItems) => [
        ...prevItems,
        { ...selectedItem, quantity: 1 },
      ]);
    }

    toast.success("Added to Cart Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleNext = () => {
    navigate(`/${hotelName}/cart-details`, {
      state: { cartItems: cartItems },
    });
  };

  const handleAddQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.uuid === menuId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    toast.success("Added to Cart Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleRemoveQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.reduce((updatedItems, item) => {
        if (item.uuid === menuId) {
          if (item.quantity === 1) {
            return updatedItems;
          } else {
            return [...updatedItems, { ...item, quantity: item.quantity - 1 }];
          }
        } else {
          return [...updatedItems, item];
        }
      }, [])
    );
    toast.success("Remove from Cart Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };
  console.log("filteredAndSortedItems", filteredAndSortedItems);

  // Handlers for discount input changes
  const handleFixedDiscountChange = (e) => {
    setFixedDiscount(Number(e.target.value) || 0);
  };

  const handlePercentDiscountChange = (e) => {
    setPercentDiscount(Number(e.target.value) || 0);
  };

  // Calculate sub total
  const subTotalAmount = cartItems.reduce(
    (total, item) => total + item.finalPrice * item.quantity,
    0
  );

  // Calculate discount
  const discount = fixedDiscount + (subTotalAmount * percentDiscount) / 100;

  // Calculate final price after discount
  const discountedPrice = subTotalAmount - discount;

  // Calculate GST amounts
  const cgstAmount = (discountedPrice * cgstRate) / 100;
  const sgstAmount = (discountedPrice * sgstRate) / 100;

  // Calculate total price after adding GST
  const totalAmount = discountedPrice + cgstAmount + sgstAmount;

  const handleClearCart = () => {
    setCartItems([]);
    handleRemoveQuantity();
  };

  const handleDiscount = () => {
    setShowDiscount(true);
  };

  const handleCloseDiscount = () => {
    setShowDiscount(false);
  };

  const handleTax = () => {
    setShowTax(true);
  };

  const handleCloseTax = () => {
    setShowTax(false);
  };

  return (
    <div
      className="flex flex-row justify-between"
      style={{ width: "75%", marginTop: "70px", marginLeft: "15%" }}
    >
      {/* Left Column - 70% Width */}
      <div className="" style={{ width: "80%", marginRight: "20px" }}>
        <div className="relative">
          {/* Search and Sort */}
          <FilterSortSearch
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleSort={handleSort}
            className="sticky top-0  py-2"
          />

          <CategoryTabs
            categories={categories}
            menuCountsByCategory={menuCountsByCategory}
            handleCategoryFilter={handleCategoryFilter}
            className="sticky top-16 z-40  py-2 mt-4"
          />
        </div>

        {/* Main Category Buttons */}
        {mainCategories.map((mainCategory) => {
          const categoryName = mainCategory.categoryName;
          const categoryCount = mainCategoryCounts[categoryName] || 0; // Get the count for the category

          // Only render the button if the category has at least one menu item
          if (categoryCount > 0) {
            return (
              <button
                key={mainCategory.mainCategoryName}
                onClick={handleMainCategoryFilter}
                className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition duration-300 ease-in-out 
          rounded-full mr-2
          ${
            activeMainCategory === categoryName
              ? "bg-orange-500 text-white border-b-2 border-orange-500"
              : "border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
          }
        `}
                style={{
                  margin: "10px 5px",
                }}
                data-category={categoryName}
              >
                {categoryName} ({categoryCount})
              </button>
            );
          }

          return null; // Don't render the button if the category has no items
        })}

        {/* Menu Items */}
        <div
          className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 overflow-auto"
          style={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}
        >
          {filteredAndSortedItems.map((item) => (
            <div className="mb-4" key={item.id}>
              <HorizontalMenuCard
                item={item}
                handleImageLoad={handleImageLoad}
                addToCart={addToCart}
                onAddQuantity={handleAddQuantity}
                onRemoveQuantity={handleRemoveQuantity}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - 30% Width */}
      <div
        className="w-2/5 flex flex-col border border-gray-200 shadow-md"
        style={{ width: "30%" }}
      >
        {/* Header */}
        <div className="flex justify-between p-2 bg-white border-b border-gray-200">
          <div className="text-xl font-semibold">Cart</div>
          <button
            onClick={handleClearCart}
            className="text-md font-semibold text-orange-500"
          >
            Clear Cart
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-grow overflow-y-auto"
          style={{ maxHeight: "50vh" }}
        >
          {cartItems.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="bg-orange-500 text-white">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {cartItems.map((item) => (
                    <tr key={item.uuid}>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {item.menuName}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <i className="bi bi-currency-rupee ml-1 mr-1 text-orange-500"></i>
                        {item.finalPrice}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleRemoveQuantity(item.uuid)}
                            className="btn btn-outline-secondary"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => handleAddQuantity(item.uuid)}
                            className="btn btn-outline-secondary"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
              No items in cart
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-grey-200">
          {/* Sub Total Price */}
          <div className="flex justify-between font-bold mb-2">
            <span>Sub Total:</span>
            <span>₹{subTotalAmount.toFixed(2)}</span>
          </div>

          {/* Dotted line */}
          <hr className="border-dotted border-black mb-4" />

          {/* Discount Section */}
          <div className="font-bold mb-2">
            <span className="d-flex">
              Add Discount
              {!showDiscount ? (
                <IoMdAddCircle
                  style={{
                    marginLeft: "10px",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: colors.Orange,
                  }}
                  onClick={handleDiscount}
                />
              ) : (
                <IoIosArrowUp
                  style={{
                    marginLeft: "10px",
                    fontSize: "24px",
                    color: colors.Orange,
                    cursor: "pointer",
                  }}
                  onClick={handleCloseDiscount}
                />
              )}
            </span>
          </div>
          {showDiscount ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="fixedDiscount" className="mr-2">
                  Fixed Discount (₹):
                </label>
                <input
                  type="number"
                  id="fixedDiscount"
                  className="border p-1 w-1/6 rounded"
                  value={fixedDiscount}
                  onChange={handleFixedDiscountChange}
                  min="0"
                />
              </div>
              <div className="flex justify-between items-center mb-4">
                <label htmlFor="percentDiscount" className="mr-2">
                  Percentage Discount (%):
                </label>
                <input
                  type="number"
                  id="percentDiscount"
                  className="border p-1 w-1/6 rounded"
                  value={percentDiscount}
                  onChange={handlePercentDiscountChange}
                  min="0"
                />
              </div>
            </>
          ) : (
            ""
          )}
          {/* Dotted line */}
          <hr className="border-dotted border-black mb-4" />

          {/* GST Details */}
          <div className="font-bold mb-2">
            <span className="d-flex">
              Tax
              {!showTax ? (
                <IoMdAddCircle
                  style={{
                    marginLeft: "10px",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: colors.Orange,
                  }}
                  onClick={handleTax}
                />
              ) : (
                <IoIosArrowUp
                  style={{
                    marginLeft: "10px",
                    fontSize: "24px",
                    color: colors.Orange,
                    cursor: "pointer",
                  }}
                  onClick={handleCloseTax}
                />
              )}
            </span>
          </div>
          {showTax ? (
            <>
              <div className="flex justify-between font-bold">
                <span>C-GST ({cgstRate}%):</span>
                <span>₹{cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mb-4">
                <span>S-GST ({sgstRate}%):</span>
                <span>₹{sgstAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            ""
          )}

          {/* Dotted line */}
          <hr className="border-dotted border-black mb-4" />

          {/* Final Price */}
          <div className="flex justify-between font-bold text-lg mb-2">
            <span>Total Price:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>

          {/* Dotted line */}
          <hr className="border-dotted border-black mb-4" />

          {/* Payment Method and Buttons */}
          <div className="font-bold mt-4 mb-2">Payment Method</div>
          <div className="flex space-x-4">
            {["Cash", "UPI", "Card"].map((method) => (
              <button
                key={method}
                onClick={() => handlePaymentMethodChange(method)}
                className={`px-4 py-2 border rounded transition-colors ${
                  selectedPaymentMethod === method
                    ? "bg-orange-500 text-white"
                    : "bg-white text-black hover:bg-orange-500 hover:text-white"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <button
              onClick={handleNext}
              className="w-full bg-orange-500 text-white p-2 rounded-full"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default POS;

// ViewMenu.js
import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  FilterSortSearch,
  HorizontalMenuCard,
  MenuCard,
  Header,
  Table,
} from "../../components";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import { colors } from "../../theme/theme";
import { getAuth } from "firebase/auth";
import CategoryTabs from "../../components/CategoryTab";
import { PrimaryButton } from "../../Atoms";
import styled from "styled-components";

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
  const navigate = useNavigate();
  const [hotelName, setHotelName] = useState("");

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
  };

  const filterAndSortItems = () => {
    let filteredItems = filteredMenus.filter((menu) =>
      menu.menuName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== "") {
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

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

  const showDetail = (id) => {
    const menuData = filteredAndSortedItems.find((menu) => menu.uuid === id);
    setModeldata(menuData);
    setShow(true);
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
    navigate(`/${hotelName}/cart/cart-details`, {
      state: { cartItems: cartItems },
    });
  };

  const handleBack = () => {
    navigate(`/viewMenu/${hotelName}`);
  };

  const handleAddQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.uuid === menuId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
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
  };
  console.log("filteredAndSortedItems", filteredAndSortedItems);
  const handleMainCategoryClick = (category) => {
    setSelectedMainCategory(category);
  };
  const handleMainCategoryCloseClick = () => {
    setSelectedMainCategory(null);
  };
  // Group menus by mainCategory
  const categorizedMenus = menus.reduce((acc, item) => {
    if (item.mainCategory) {
      if (!acc[item.mainCategory]) {
        acc[item.mainCategory] = [];
      }
      acc[item.mainCategory].push(item);
    }
    return acc;
  }, {});
  return (
    <div className="flex flex-col lg:flex-row mt-5 bg-white">
      {/* Left Column - 70% Width */}
      <div className="w-full lg:w-8/12 px-4 lg:px-6">
        <div className="relative">
          {/* Search and Sort */}
          <FilterSortSearch
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleSort={handleSort}
            className="sticky top-0 z-50 bg-white py-2"
          />

          <CategoryTabs
            categories={categories}
            menuCountsByCategory={menuCountsByCategory}
            handleCategoryFilter={handleCategoryFilter}
            className="sticky top-16 z-40 bg-white py-2 mt-4"
          />
        </div>

        <div className="flex justify-start items-center mt-4">
          {Object.keys(categorizedMenus).map((category) => (
            <PrimaryButton
              key={category}
              onClick={() => handleMainCategoryClick(category)}
              btnText={`${category}`}
            />
          ))}

          {/* <span
            onClick={() => handleMainCategoryCloseClick()}
            className="text-red-500 cursor-pointer text-lg"
          >
            <i className="bi bi-x-lg"></i>
          </span> */}
        </div>

        {/* Menu Items */}
        <div
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 overflow-auto"
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
      <div className="w-full lg:w-4/12 lg:sticky lg:top-0 mt-8 lg:mt-0 overflow-auto">
        <div
          className="bg-white p-4 border border-gray-200 shadow-md"
          style={{ height: "calc(100vh - 20px)", overflowY: "auto" }}
        >
          <div className="text-xl font-semibold mb-4">Cart</div>
          <div className="overflow-auto">
            <div className="table-responsive">
              {cartItems.length > 0 ? (
                <table className="table table-striped table-bordered">
                  <thead className="bg-orange-500 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {cartItems.map((item) =>
                      item ? (
                        <tr key={item.uuid}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {item.menuName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <i className="bi bi-currency-rupee ml-1 mr-1 text-orange-500"></i>
                            {item.finalPrice}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
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
                      ) : null
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                  No items in cart
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-4 font-bold">
            <span>Total:</span>
            <span>
              ₹
              {cartItems.reduce(
                (total, item) => total + item.menuPrice * item.quantity,
                0
              )}
            </span>
          </div>
          <div className="flex justify-between mt-4 font-bold">
            Payment Method
          </div>
          <div className="mt-4">
            <PrimaryButton
              onClick={handleNext}
              btnText="Checkout"
              className="w-full"
            />
            <PrimaryButton
              onClick={handleBack}
              btnText="Back"
              className="mt-2 w-full btn-secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;

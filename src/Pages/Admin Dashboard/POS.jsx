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

const MenuItemsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  padding: 10px 0;

  .menu-card {
    flex: 0 0 auto;
    margin-right: 10px;
  }
`;
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
    <div className="d-flex mt-5">
    {/* Left Column - 70% Width */}
    <div className="col-12 col-lg-8">
      <div className="container bg-white">
        {/* Search and Sort */}
        <FilterSortSearch
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleSort={handleSort}
          className="position-fixed w-100 top-0 start-0 z-index-999"
        />
  
        <CategoryTabs
          categories={categories}
          menuCountsByCategory={menuCountsByCategory}
          handleCategoryFilter={handleCategoryFilter}
          className="position-fixed w-100 top-0 start-0 z-index-998"
        />
      </div>
      <div className="d-flex justify-content-between mx-2">
        {Object.keys(categorizedMenus).map((category) => (
          <PrimaryButton
            key={category}
            onClick={() => handleMainCategoryClick(category)}
            btnText={`${hotelName} ${category}`}
          />
        ))}
  
        <span
          onClick={() => handleMainCategoryCloseClick()}
          className="text-danger cursor-pointer"
        >
          <i className="bi bi-x-lg"></i>
        </span>
      </div>
      <MenuItemsContainer className="menu-items">
        {selectedMainCategory &&
          categorizedMenus[selectedMainCategory].map((item) => (
            <MenuCard
              key={item.uuid} // Add a unique key prop for better performance
              item={item}
              handleImageLoad={handleImageLoad}
              addToCart={addToCart}
              className="menu-card" // Apply the class to the MenuCard component
            />
          ))}
      </MenuItemsContainer>
      {/* Menu Items */}
      <div className="row" style={{ height: "calc(100vh - 240px)", overflowY: "auto" }}>
        {filteredAndSortedItems.map((item) => (
          <div className="col-12 col-sm-6 col-md-4 mb-2" key={item.id}>
            <HorizontalMenuCard
              item={item}
              handleImageLoad={handleImageLoad}
              addToCart={addToCart}
              onAddQuantity={handleAddQuantity} // Add this if needed
              onRemoveQuantity={handleRemoveQuantity} // Add this if needed
            />
          </div>
        ))}
      </div>
    </div>
  
    {/* Right Column - 30% Width */}
    <div className="col-12 col-lg-4 sticky-top">
  <div className="bg-white p-4 border border-gray-200" style={{ height: "100vh" }}>
    <div className="text-xl font-semibold mb-4">Cart</div>
    <div className="overflow-auto">
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {cartItems.map((item) =>
              item ? (
                <tr key={item.uuid}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.menuName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <i className="bi bi-currency-rupee ml-1 mr-1 text-orange-500"></i>
                    {item.menuPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="d-flex align-items-center space-x-2">
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
      </div>
    </div>
    <div className="d-flex justify-content-between mt-4 font-weight-bold">
      <span>Total:</span>
      <span>
        $
        {cartItems.reduce(
          (total, item) => total + item.menuPrice * item.quantity,
          0
        )}
      </span>
    </div>
    <div className="mt-4">
      <PrimaryButton onClick={handleNext} btnText="Checkout" />
      <PrimaryButton
        onClick={handleBack}
        btnText="Back"
        className="mt-2 btn-secondary"
      />
    </div>
  </div>
</div>

  </div>
  
  );
};

export default POS;

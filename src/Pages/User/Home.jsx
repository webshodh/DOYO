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
} from "../../components";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import { colors } from "../../theme/theme";
import { getAuth } from "firebase/auth";
import CategoryTabs from "../../components/CategoryTab";
import { PrimaryButton } from "../../Atoms";
import styled from "styled-components";
import AlertMessage from "Atoms/AlertMessage";
import ImageSlider from "components/Slider/ImageSlider";
import Footer from "Atoms/Footer";

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

function Home() {
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [mainCategoryCounts, setMainCategoryCounts] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [menuCounts, setMenuCounts] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeMainCategory, setActiveMainCategory] = useState("");
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const navigate = useNavigate();
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 2];
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
  };

  const handleMainCategoryFilter = (mainCategoryName) => {
    // setSelectedMainCategory(mainCategoryName);
    // setActiveMainCategory(mainCategoryName);
    navigate(`/viewMenu/${hotelName}/home/specialMenu`);
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

    if (selectedMainCategory !== "") {
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.mainCategory &&
          menu.mainCategory.toLowerCase() === selectedMainCategory.toLowerCase()
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
  console.log("cartItems", cartItems);
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

  // Slider data
  const slides = [
    {
      src: "/ads.png",
      alt: "Slide 1",
    },
    {
      src: "/ads2.jpg",
      alt: "Slide 2",
    },
    {
      src: "ads.png",
      alt: "Slide 3",
    },
  ];
  return (
    <>
      {!isAdmin && (
        <>
          <Navbar
            title={`${hotelName}`}
            Fabar= {true}
            style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
          />
          {/* Image Slider */}
          {/* <ImageSlider slides={slides} /> */}
          <AlertMessage
            linkText={
              "Looking to upgrade your hotel with a Digital Menu? Click here to learn more!"
            }
            type="info"
            icon="bi-info-circle"
            linkUrl="www.google.com"
          />
        </>
      )}

      <div
        className="container"
        style={{
          background: `${colors.LightGrey}`,
        }}
      >
        {/* Search and Sort */}
        <div className="sticky top-16">
          <FilterSortSearch
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleSort={handleSort}
          />
        </div>

        {/* Category Tabs */}
        <div className="sticky top-24">
          <CategoryTabs
            categories={categories}
            menuCountsByCategory={menuCountsByCategory}
            handleCategoryFilter={handleCategoryFilter}
          />
        </div>

        {/* Main Categories */}
        <div className="flex overflow-x-auto whitespace-nowrap space-x-4 py-2 px-4 custom-scrollbar">
          {mainCategories.map((mainCategory) => (
            <button
              key={mainCategory.mainCategoryName}
              onClick={handleMainCategoryFilter}
              className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition duration-300 ease-in-out 
                rounded-full 
                ${"bg-orange-100 text-orange-500 hover:bg-orange-500 hover:text-white"}
              `}
            >
              {mainCategory.categoryName} (
              {mainCategoryCounts[mainCategory.categoryName] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div
        className="flex flex-wrap justify-center gap-1 px-4"
        style={{
          height: "calc(100vh - 240px)",
          overflowY: "auto",
          background:colors.LightGrey
        }}
      >
        {filteredAndSortedItems.map((item) => (
          <div
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 mb-2"
            key={item.id}
          >
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

      {/* Cart Details */}
      {/* {!isAdmin && cartItems.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white shadow-lg z-50">
          <div className="flex justify-between items-center">
            <div className="ml-4 text-black">
              {cartItems.length}{" "}
              {cartItems.length > 1 ? "Items Added" : "Item Added"}
            </div>
            <div
              className="flex items-center mr-4 cursor-pointer"
              onClick={handleNext}
            >
              <span className="text-orange-500 text-lg font-semibold">
                Checkout
              </span>
              <i className="bi bi-caret-right-fill text-2xl ml-2 text-orange-500"></i>
            </div>
          </div>
        </div>
      ) : (
        ""
      )} */}
      <Footer cartItemsCount={cartItems.length} handleCart={handleNext} />
      {/* Toast Notification */}
      <ToastContainer />
    </>
  );
}

export default Home;

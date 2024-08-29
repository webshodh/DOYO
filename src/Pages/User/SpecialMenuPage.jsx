import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, FilterSortSearch, MenuCard } from "../../components";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import { colors } from "../../theme/theme";
import CategoryTabs from "../../components/CategoryTab";
import { PageTitle } from "../../Atoms";
import AlertMessage from "Atoms/AlertMessage";

function SpecialMenuPage() {
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 3];
    setHotelName(hotelNameFromPath);
    setIsAdmin(path.includes("admin"));
  }, []);

  useEffect(() => {
    // Fetch menu data
    const menuRef = ref(db, `/hotels/${hotelName}/menu/`);
    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const menuArray = Object.values(data);
        setMenus(menuArray);
        setFilteredMenus(menuArray);
      }
    });
  }, [hotelName]);

  useEffect(() => {
    // Fetch main categories data
    const mainCategoryRef = ref(db, `/hotels/${hotelName}/Maincategories/`);
    onValue(mainCategoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mainCategoriesData = Object.values(data);
        setMainCategories(mainCategoriesData);
      }
    });
  }, [hotelName]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const filterAndSortItems = () => {
    // Filter and sort menus based on search, selected category, and sort order
    let filteredItems = filteredMenus.filter((menu) =>
      menu.menuName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory) {
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

  const addToCart = (menuId) => {
    // Add item to cart and show success message
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
      state: { cartItems },
    });
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
  return (
    <>
      {!isAdmin && (
        <>
          <Navbar
            title={`${hotelName}`}
            style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
          />
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
          background: `${colors.White}`,
        }}
      >
        {/* Search and Sort */}
        <FilterSortSearch
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleSort={handleSort}
          style={{ position: "fixed", width: "100%", zIndex: 999 }}
        />

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          menuCountsByCategory={menuCountsByCategory}
          handleCategoryFilter={handleCategoryFilter}
          style={{ position: "fixed", width: "100%", zIndex: 998 }}
        />
      </div>

      {/* Menu Sections by Main Category */}
      <div className="menu-container">
        {mainCategories.map((mainCategory) => {
          // Filter items that belong to the current main category
          const itemsForMainCategory = filteredAndSortedItems.filter(
            (item) => item.mainCategory === mainCategory.mainCategoryName
          );

          // Only render if there are items in the main category
          if (itemsForMainCategory.length === 0) return null;

          return (
            <div key={mainCategory.mainCategoryName}>
              {/* Display the PageTitle for the current main category */}
              <PageTitle pageTitle={mainCategory.mainCategoryName} />

              {/* Display the menu items for the current main category */}
              <div className="overflow-x-auto whitespace-nowrap py-4">
                <div className="flex">
                  {menus.map((item) => (
                    <div
                      className="inline-block w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 mb-4"
                      key={item.uuid}
                    >
                      <MenuCard
                        item={item}
                        addToCart={addToCart}
                        onAddQuantity={handleAddQuantity}
                        onRemoveQuantity={handleRemoveQuantity}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Details */}
      {!isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-orange-500 shadow-lg z-50">
          <div className="flex justify-between items-center">
            <div className="ml-4 text-white">
              {cartItems.length}{" "}
              {cartItems.length > 1 ? "Items Added" : "Item Added"}
            </div>
            <div
              className="flex items-center mr-4 cursor-pointer"
              onClick={handleNext}
            >
              <span className="text-white text-lg font-semibold">Checkout</span>
              <i className="bi bi-arrow-right-circle ml-2 text-white"></i>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SpecialMenuPage;

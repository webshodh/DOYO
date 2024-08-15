// ViewMenu.js
import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, FilterSortSearch, HorizontalMenuCard } from "../../components";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import { colors } from "../../theme/theme";
import { getAuth } from "firebase/auth";
import CategoryTabs from "../../components/CategoryTab";

function Home() {
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

  // const { hotelName } = useHotelContext();
  const navigate = useNavigate();
  const handleClose = () => setShow(false);
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    // Get the current pathname
    const path = window.location.pathname;
    // Split the path into segments
    const pathSegments = path.split("/");
    // Assuming the hotel name is the last segment in the path
    const hotelNameFromPath = pathSegments[pathSegments.length - 1];

    // Set the hotel name in state
    setHotelName(hotelNameFromPath);
  }, []);

  useEffect(() => {
    // Check if 'admin' is present in the URL pathname
    const path = window.location.pathname;
    if (path.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  // Menu
  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/menu/`), (snapshot) => {
      setMenus([]);
      const data = snapshot.val();
      if (data !== null) {
        setMenus(Object.values(data));
      }
    });
  }, [hotelName]);

  //  Category
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
  console.log("categories", categories);
  // Menu Count
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

  // Category Count
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
    let filteredItems = menus.filter((menu) =>
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
    console.log("id", id);
  };

  const addToCart = (menuId) => {
    const selectedItem = menus.find((menu) => menu.uuid === menuId);

    // Check if the item is already in the cart
    const existingItem = cartItems.find((item) => item.uuid === menuId);

    if (existingItem) {
      // If the item is already in the cart, update its quantity
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.uuid === menuId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      // If the item is not in the cart, add it with quantity 1
      setCartItems((prevItems) => [
        ...prevItems,
        { ...selectedItem, quantity: 1 },
      ]);
    }

    toast.success("Added to Cart Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.menuPrice * item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleNext = () => {
    navigate(`/${hotelName}/cart-details`, { state: { cartItems: cartItems } });
  };
  const handleBack = () => {
    navigate(`/viewMenu/${hotelName}`);
  };
  return (
    <>
      {!isAdmin && (
        <>
          <Navbar
            title={`${hotelName}`}
            style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
          />
        </>
      )}

      <div
        className="container"
        style={{
          background: `${colors.White}`,
          // Adjust according to the Navbar height
        }}
      >
        {/* Search and Sort */}
        <FilterSortSearch
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleSort={handleSort}
          style={{ position: "fixed", width: "100%", zIndex: 999 }}
        />

        <CategoryTabs
          categories={categories}
          menuCountsByCategory={menuCountsByCategory}
          handleCategoryFilter={handleCategoryFilter}
          style={{ position: "fixed", width: "100%", zIndex: 998 }}
        />
      </div>

      {/* Menu Items */}
      <div
        className="row"
        style={{
          // Adjust according to the height of the fixed elements above
          height: "calc(100vh - 240px)", // Adjust to leave space for the cart and other fixed elements
          overflowY: "auto",
        }}
      >
        {filteredAndSortedItems.map((item) => (
          <div className="col-12 col-sm-6 col-md-4 mb-8" key={item.id}>
            <HorizontalMenuCard
              item={item}
              handleImageLoad={handleImageLoad}
              showDetail={showDetail}
              addToCart={addToCart}
              imageLoaded={imageLoaded}
            />
          </div>
        ))}
      </div>

      {/* Cart Details */}
      {!isAdmin && (
        <div
          className="fixed-bottom p-2 bg-light border-top"
          style={{ zIndex: 1001 }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              DOYO
              {/* Order {cartItems.length} */}
              {/* for {getTotalPrice()} INR */}
            </div>
            <div>
              <i
                class="bi bi-house-fill"
                style={{ color: `${colors.White}`, fontSize: "24px" }}
                onClick={handleBack}
              ></i>
            </div>
            <div className="align-items-center">
              <div style={{ margin: "-5px 15px -10px 30px" }}>
                {cartItems.length}
              </div>

              <div onClick={handleNext} style={{ marginRight: "20px" }}>
                <i
                  className="bi bi-cart-check-fill"
                  style={{ color: `${colors.White}`, fontSize: "24px" }}
                ></i>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
}

export default Home;

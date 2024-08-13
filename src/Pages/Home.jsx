// ViewMenu.js
import React, { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Navbar, FilterSortSearch, HorizontalMenuCard } from "../components";
import MenuCard from "../components/Cards/MenuCard";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import CardSlider from "../components/Cards/CardSlider";
import styled from "styled-components";
import { colors } from "../theme/theme";
import { useHotelContext } from "../Context/HotelContext";
import { getAuth } from "firebase/auth";
const CardFooter = styled.div`
  display: block;
  text-align: center;
  cursor: ${({ availability }) =>
    availability === "Available" ? "pointer" : "not-allowed"};
`;
const AddToCart = styled(CardFooter)`
  background: green;
  color: white;
  border-radius: 5px;
  padding: 7px;
  cursor: pointer;
`;
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
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/menu/`),
      (snapshot) => {
        setMenus([]);
        const data = snapshot.val();
        if (data !== null) {
          setMenus(Object.values(data));
        }
      }
    );
  }, [hotelName]);

  //  Category
  useEffect(() => {
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/categories/`),
      (snapshot) => {
        setCategories([]);
        const data = snapshot.val();
        if (data !== null) {
          const categoriesData = Object.values(data);
          setCategories(categoriesData);
          fetchMenuCounts(categoriesData);
        }
      }
    );
  }, [hotelName]);

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
  console.log("hotelName", hotelName);
  console.log("categories", categories);
  return (
    <>
      {!isAdmin ? (
        <>
          <Navbar title={`${hotelName}`} />
        </>
      ) : (
        ""
      )}

      <div className="container" style={{ background: `${colors.White}` }}>
        {/* Search and Sort */}
        <FilterSortSearch
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleSort={handleSort}
          // categories={categories}
        />

        {/* Category Filter */}
        <div className="row">
          <div className="col-12">
            <div
              className="d-flex flex-nowrap overflow-auto"
              style={{ whiteSpace: "nowrap" }}
            >
              <div
                className="p-2 mb-2 bg-light border  cursor-pointer d-inline-block categoryTab"
                onClick={() => handleCategoryFilter("")}
                style={{ marginRight: "5px" }}
              >
                <div>
                  All{" "}
                  <span
                    className="badge bg-danger badge-number"
                    style={{ borderRadius: "50%", padding: "5px" }}
                  >
                    {" "}
                    {Object.values(menuCountsByCategory).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </span>
                </div>
              </div>
              {categories
                .filter((item) => menuCountsByCategory[item.categoryName] > 0) // Only include categories with non-zero counts
                .map((item) => (
                  <div
                    className="category p-2 mb-2 bg-light border cursor-pointer d-inline-block categoryTab"
                    key={item.id}
                    onClick={() => handleCategoryFilter(item.categoryName)}
                  >
                    <div className="category-name">
                      {item.categoryName}{" "}
                      <span
                        className="badge bg-danger badge-number"
                        style={{ borderRadius: "50%" }}
                      >
                        {menuCountsByCategory[item.categoryName]}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {/* Menu Items */}
      <div className="row" style={{ background: `${colors.LightBlue}` }}>
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

      {/* Modal Data */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modeldata.menuName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            src={modeldata.imageUrl}
            style={{ width: "100%", height: "250px", objectFit: "contain" }}
            alt={modeldata.alt}
          />
          <b>Cooking Time: </b>
          {modeldata.menuCookingTime} min
          <br />
          <b>Price: </b>
          {modeldata.menuPrice} ₹
          <br />
          <b>Description: </b>
          {modeldata.menuContent ? modeldata.menuContent : modeldata.menuName}
        </Modal.Body>
        <Modal.Footer>
          <AddToCart
            className="card-footer add-to-cart"
            onClick={() => addToCart()}
          >
            Add to Cart
          </AddToCart>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cart Details */}
      {!isAdmin ? (
        <div className="fixed-bottom p-2 bg-light border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              DOYO
              {/* Order {cartItems.length}  */}
              {/* for {getTotalPrice()} INR */}
            </div>
            <div className="align-items-center">
              <div style={{ margin: "-5px 15px -10px 30px" }}>
                {cartItems.length}
              </div>

              <div onClick={handleNext} style={{ marginRight: "20px" }}>
                <i
                  class="bi bi-cart-check-fill"
                  style={{ color: "white", fontSize: "24px" }}
                ></i>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      <ToastContainer />
    </>
  );
}

export default Home;

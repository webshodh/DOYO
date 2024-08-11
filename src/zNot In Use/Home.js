// // ViewMenu.js
// import React, { useState, useEffect } from "react";
// import { db } from "../firebase/firebase";
// import { onValue, ref } from "firebase/database";
// import { ToastContainer, toast } from "react-toastify";
// import "../styles/Home.css";
// import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";
// import { Navbar, FilterSortSearch } from "../components";
// import { useNavigate } from "react-router-dom";
// function Home() {
//   const [menues, setMenues] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortOrder, setSortOrder] = useState("default"); // "default", "lowToHigh", "highToLow"
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [show, setShow] = useState(false);
//   const [modeldata, setModeldata] = useState({});
//   const [cartItems, setCartItems] = useState([]);
//   const [menuCounts, setMenuCounts] = useState({});
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [activeCategory, setActiveCategory] = useState("");
//   const path = window.location.pathname;
//   let hotelName = path.split("/").pop();
//   const navigate = useNavigate();
//   const handleClose = () => setShow(false);

//   useEffect(() => {
//     onValue(ref(db, `/${hotelName}/menu/`), (snapshot) => {
//       setMenues([]);
//       const data = snapshot.val();
//       if (data !== null) {
//         setMenues(Object.values(data));
//       }
//     });
//   }, [hotelName]);

//   useEffect(() => {
//     onValue(ref(db, `/${hotelName}/categories/`), (snapshot) => {
//       setCategories([]);
//       const data = snapshot.val();
//       if (data !== null) {
//         const categoriesData = Object.values(data);
//         setCategories(categoriesData);
//         fetchMenuCounts(categoriesData);
//       }
//     });
//   }, [hotelName]);
//   const fetchMenuCounts = (categoriesData) => {
//     const counts = {};

//     categoriesData.forEach((category) => {
//       const categoryMenus = menues.filter(
//         (menu) => menu.menuCategory === category.categoryName
//       );

//       counts[category.categoryName] = categoryMenus.length;
//     });

//     setMenuCounts(counts);
//   };
//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleSort = (order) => {
//     setSortOrder(order);
//   };

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   const handleCategoryFilter = (category) => {
//     setSelectedCategory(category);
//     setActiveCategory(category);
//   };

//   const filterAndSortItems = () => {
//     let filteredItems = menues.filter((menu) =>
//       menu.menuName.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     if (selectedCategory !== "") {
//       filteredItems = filteredItems.filter(
//         (menu) =>
//           menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase()
//       );
//     }

//     if (sortOrder === "lowToHigh") {
//       filteredItems.sort(
//         (a, b) => parseFloat(a.menuPrice) - parseFloat(b.menuPrice)
//       );
//     } else if (sortOrder === "highToLow") {
//       filteredItems.sort(
//         (a, b) => parseFloat(b.menuPrice) - parseFloat(a.menuPrice)
//       );
//     }

//     return filteredItems;
//   };

//   const filteredAndSortedItems = filterAndSortItems();
//   console.log("data", filteredAndSortedItems);

//   const showDetail = (id) => {
//     const menuData = filteredAndSortedItems.find((menu) => menu.uuid === id);
//     setModeldata(menuData);
//     setShow(true);
//     console.log("id", id);
//   };

//   const addToCart = (menuId) => {
//     const selectedItem = menues.find((menu) => menu.uuid === menuId);

//     // Check if the item is already in the cart
//     const existingItem = cartItems.find((item) => item.uuid === menuId);

//     if (existingItem) {
//       // If the item is already in the cart, update its quantity
//       setCartItems((prevItems) =>
//         prevItems.map((item) =>
//           item.uuid === menuId ? { ...item, quantity: item.quantity + 1 } : item
//         )
//       );
//     } else {
//       // If the item is not in the cart, add it with quantity 1
//       setCartItems((prevItems) => [
//         ...prevItems,
//         { ...selectedItem, quantity: 1 },
//       ]);
//     }

//     toast.success("Added to Cart Successfully!", {
//       position: toast.POSITION.TOP_RIGHT,
//     });
//   };

//   const getTotalPrice = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.menuPrice * item.quantity,
//       0
//     );
//   };

//   const clearCart = () => {
//     setCartItems([]);
//     toast.success("Cart cleared successfully!", {
//       position: toast.POSITION.TOP_RIGHT,
//     });
//   };

//   const handleNext = () => {
//     console.log("hotelName", hotelName);
//     navigate(`/${hotelName}/cart-details`, { state: { cartItems: cartItems } });
//   };
//   // import '../../public/nonVeglogo.png'
//   const Veg = "../../veglogo.jpeg";
//   const Nonveg = "../../nonVeglogo.png";

//   return (
//     <>
//       {/* <Navbar title={`${hotelName}`} /> */}
//       <div className="header">
//         <FilterSortSearch
//           searchTerm={searchTerm}
//           handleSearch={handleSearch}
//           handleSort={handleSort}
//           categories={categories}
//         />

//         <div className="container mt-4">
//           <div className="row">
//             <div className="col-12">
//               <div className="d-flex flex-wrap justify-content-start">
//                 <div
//                   className="category p-2 mb-2 bg-light border rounded cursor-pointer"
//                   onClick={() => handleCategoryFilter("")}
//                 >
//                   <div className="category-name">All</div>
//                 </div>
//                 {categories.map((item) => (
//                   <div
//                     className="category p-2 mb-2 bg-light border rounded cursor-pointer"
//                     key={item.id}
//                     onClick={() => handleCategoryFilter(item.categoryName)}
//                   >
//                     <div className="category-name">{item.categoryName}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="content">
//         <div className="rows">
//           {filteredAndSortedItems.map((item) => (
//             <div className="column flex-container" key={item.id}>
//               <div
//                 className="card"
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   opacity: item.availability === "Available" ? 1 : 0.4,
//                 }}
//               >
//                 {item.availability === "Available" ? (
//                   ""
//                 ) : (
//                   <span className="text-overlay"> {item.availability}</span>
//                 )}
//                 {!imageLoaded && (
//                   <div
//                     className="spinner-border text-danger"
//                     role="status"
//                     style={{
//                       position: "absolute",
//                       top: "20%",
//                       left: "40%",
//                     }}
//                   ></div>
//                 )}
//                 <img
//                   src={item.imageUrl}
//                   className="card-img-top"
//                   alt={item.alt}
//                   style={{
//                     width: "100%",
//                     height: "120px",
//                     objectFit: "cover",
//                   }}
//                   onLoad={handleImageLoad}
//                 />

//                 <div className="card-body">
//                   <h5 className="card-title" style={{ textAlign: "left" }}>
//                     {item.menuName}
//                   </h5>
//                   <div className="container">
//                     {item.menuCategory === "Veg" || "Dosas & Uttapam" ? (
//                       <img className="logo" src={Veg} />
//                     ) : item.menuCategory === "Nonveg" ? (
//                       <img className="logo" src={Nonveg} />
//                     ) : (
//                       ""
//                     )}
//                   </div>
//                   <div className="card-text">
//                     <img
//                       style={{
//                         width: "20px",
//                         height: "20px",
//                         margin: "-1px 2px 0px 0px",
//                       }}
//                       src="/time.png"
//                       alt="Cooking Time"
//                     />
//                     {item.menuCookingTime} min
//                     <br />
//                     <img
//                       style={{
//                         width: "18px",
//                         height: "18px",
//                         alignItems: "center",
//                         margin: "0px 2px 0px 10px",
//                       }}
//                       src="/rupee.png"
//                       alt="Menu Price"
//                     />
//                     {item.menuPrice}
//                   </div>
//                 </div>
//                 <div
//                   style={{
//                     display: "block",
//                     // background: "#dc3545",
//                     color: "red",
//                     textAlign: "center",
//                     cursor:
//                       item.availability === "Available"
//                         ? "pointer"
//                         : "not-allowed",
//                   }}
//                   className="card-footer bg-transferent border-dotted"
//                   onClick={() =>
//                     item.availability === "Available"
//                       ? showDetail(item.uuid)
//                       : ""
//                   }
//                 >
//                   Read More
//                 </div>
//                 <div
//                   style={{
//                     display: "block",
//                     background: "#dc3545",
//                     color: "white",
//                     textAlign: "center",
//                   }}
//                   className="card-footer bg-transferent border-dotted"
//                   onClick={() => addToCart(item.uuid)}
//                 >
//                   Add to Cart
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* //modal data */}
//           <Modal show={show} onHide={handleClose}>
//             <Modal.Header closeButton>
//               <Modal.Title>{modeldata.menuName}</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//               <img
//                 src={modeldata.imageUrl}
//                 style={{ width: "100%", height: "250px", objectFit: "contain" }}
//                 alt={modeldata.alt}
//               />
//               <b>Cooking Time: </b>
//               {modeldata.menuCookingTime} min
//               <br />
//               <b>Price: </b>
//               {modeldata.menuPrice} ₹
//               <br />
//               <b>Description: </b>
//               {modeldata.menuContent
//                 ? modeldata.menuContent
//                 : modeldata.menuName}
//             </Modal.Body>
//             <Modal.Footer>
//               <Button variant="danger" onClick={handleClose}>
//                 Close
//               </Button>
//             </Modal.Footer>
//           </Modal>
//         </div>
//       </div>

//       {/* cart details */}
//       <div className="cart-summary">
//         <div className="cart-box">
//           <div>
//             Order {cartItems.length} for {getTotalPrice()} INR
//           </div>
//           <div>
//             <span>{cartItems.length}</span>
//             <img
//               src="/cart.png"
//               width="30px"
//               height="30px"
//               onClick={handleNext}
//             />
//           </div>
//         </div>
//       </div>

//       {/* <div className="footer">Powerd by DOYO</div> */}
//       <ToastContainer />
//     </>
//   );
// }

// export default Home;

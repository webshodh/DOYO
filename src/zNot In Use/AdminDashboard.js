
// // AddMenu.js
// import React, { useState, useEffect } from "react";
// import { db, storage } from "../firebase/firebase";
// import { uid } from "uid";
// import { set, ref, onValue, update, remove } from "firebase/database";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Form } from "react-bootstrap";
// import Navbar from "../components/Navbar";
// import CountCard from "../components/CountCard/CountCard";
// import "./AdminDashboard.css";
// import {
//   getStorage,
//   ref as storageRef,
//   uploadBytes,
//   getDownloadURL,
// } from "firebase/storage";

// function AdminDashboard() {
//   const [menuName, setMenuName] = useState("");
//   const [menuCookingTime, setMenuCookingTime] = useState("");
//   const [menuPrice, setMenuPrice] = useState("");
//   const [menuCategory, setMenuCategory] = useState("");
//   const [menuContent, setMenuContent] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [availability, setAvailability] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [file, setFile] = useState(null);
//   const [menues, setMenues] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortOrder, setSortOrder] = useState("default");
//   const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
//   const [showForm, setShowForm] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [editedMenuId, setEditedMenuId] = useState(null);
//   const [hotels, setHotels] = useState([]);

//   const path = window.location.pathname;
//   const hotelName = path.split("/").pop();
// const navigate = useNavigate()
//   useEffect(() => {
//     onValue(ref(db, `/${hotelName}/menu/`), (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setMenues(Object.values(data));
//       }
//     });
//   }, [hotelName]);

//   useEffect(() => {
//     onValue(ref(db, `/${hotelName}/categories/`), (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setCategories(Object.values(data));
//       }
//     });
//   }, [hotelName]);

//   useEffect(() => {
//     const countsByCategory = menues.reduce((acc, menu) => {
//       const category = menu.menuCategory || "other";
//       acc[category] = (acc[category] || 0) + 1;
//       return acc;
//     }, {});
//     setMenuCountsByCategory(countsByCategory);
//   }, [menues]);

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     switch (id) {
//       case "menuName":
//         setMenuName(value);
//         break;
//       case "cookingTime":
//         setMenuCookingTime(value);
//         break;
//       case "menuPrice":
//         setMenuPrice(value);
//         break;
//       case "menuCategory":
//         setMenuCategory(value);
//         break;
//       case "menuContent":
//         setMenuContent(value);
//         break;
//       case "availability":
//         setAvailability(value);
//         break;
//       default:
//         break;
//     }
//   };

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleShow = (menuId) => {
//     const selectedMenu = menues.find((menu) => menu.uuid === menuId);
//     if (selectedMenu) {
//       setMenuName(selectedMenu.menuName);
//       setMenuCookingTime(selectedMenu.menuCookingTime);
//       setMenuPrice(selectedMenu.menuPrice);
//       setMenuCategory(selectedMenu.menuCategory);
//       setMenuContent(selectedMenu.menuContent);
//       setAvailability(selectedMenu.availability);
//       setEditMode(true);
//       setEditedMenuId(menuId);
//     } else {
//       setMenuName("");
//       setMenuCookingTime("");
//       setMenuPrice("");
//       setMenuCategory("");
//       setMenuContent("");
//       setAvailability("");
//       setEditMode(false);
//       setEditedMenuId(null);
//     }
//     setShowForm(true);
//   };

//   const handleHide = () => {
//     setMenuName("");
//     setMenuCookingTime("");
//     setMenuPrice("");
//     setMenuCategory("");
//     setMenuContent("");
//     setAvailability("");
//     setFile(null);
//     setEditMode(false);
//     setEditedMenuId(null);
//     setShowForm(false);
//   };

//   const writeToDatabase = async () => {
//     try {
//       let imageUrl = "";

//       if (file) {
//         const imageRef = storageRef(storage, `images/${hotelName}/${file.name}`);
//         await uploadBytes(imageRef, file);
//         imageUrl = await getDownloadURL(imageRef);
//       }

//       const data = {
//         menuName,
//         menuCookingTime,
//         menuPrice,
//         menuCategory,
//         menuContent,
//         availability,
//         uuid: editMode ? editedMenuId : uid(),
//         ...(imageUrl && { imageUrl }),
//       };

//       if (editMode) {
//         await update(ref(db, `/${hotelName}/menu/${editedMenuId}`), data);
//         toast.success("Menu Updated Successfully!", { position: toast.POSITION.TOP_RIGHT });
//       } else {
//         await set(ref(db, `/${hotelName}/menu/${data.uuid}`), data);
//         toast.success("Menu Added Successfully!", { position: toast.POSITION.TOP_RIGHT });
//       }

//       handleHide();
//     } catch (error) {
//       toast.error("An error occurred!", { position: toast.POSITION.TOP_RIGHT });
//     }
//   };

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleDelete = (menuId) => {
//     if (window.confirm("Are you sure you want to delete this menu?")) {
//       remove(ref(db, `/${hotelName}/menu/${menuId}`));
//       toast.success("Menu Deleted Successfully!", { position: toast.POSITION.TOP_RIGHT });
//     }
//   };

//   const filterAndSortItems = () => {
//     let filteredItems = menues.filter((menu) =>
//       menu.menuName.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     if (selectedCategory) {
//       filteredItems = filteredItems.filter(
//         (menu) => menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase()
//       );
//     }

//     if (sortOrder === "lowToHigh") {
//       filteredItems.sort((a, b) => parseFloat(a.menuPrice) - parseFloat(b.menuPrice));
//     } else if (sortOrder === "highToLow") {
//       filteredItems.sort((a, b) => parseFloat(b.menuPrice) - parseFloat(a.menuPrice));
//     }

//     return filteredItems;
//   };

//   const filteredAndSortedItems = filterAndSortItems();

//   useEffect(() => {
//     onValue(ref(db, "/"), (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setHotels(Object.values(data));
//       }
//     });
//   }, []);

//   const handleCategoryFilter = (category) => {
//     setSelectedCategory(category);
//   };

//   const handleNavigation = (route) => {
//     navigate(route);
//   };

//   return (
//     <>
//       <Navbar title={hotelName} />
//       <div>
//         <h2 className="heading">Menu Counts by Category</h2>
//         <ul
//           className="category-list"
//         >
//           {Object.entries(menuCountsByCategory).map(([category, count]) => (
//             <CountCard
//               key={category}
//               count={count}
//               name={category || "other"}
//               bgImage="https://cdn-icons-png.flaticon.com/128/1046/1046802.png"
//               src="veg.png"
//               bgColor="white"
//             />
//           ))}
//         </ul>
//       </div>
//       <div>
//         {hotels
//           .filter((item) => !hotelName || item.Hotelname === hotelName)
//           .map((item) => (
//             <div key={item.uuid}>
//               <div style={{ display: "flex" }}>
//                 <button
//                   style={{ margin: "5px 10px" }}
//                   onClick={() => handleShow(null)}
//                   className="btn btn-dark btn-margin"
//                 >
//                   Add Menu
//                 </button>
//                 <button
//                   style={{ margin: "5px 10px" }}
//                   onClick={() => handleNavigation(`/addCategory/${item.Hotelname}`)}
//                   className="btn btn-dark btn-margin"
//                 >
//                   Add Category
//                 </button>
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search Menu"
//                 onChange={handleSearch}
//               />
//               <div className="filter">
//                 <label>Category Filter:</label>
//                 <select onChange={(e) => handleCategoryFilter(e.target.value)}>
//                   <option value="">All</option>
//                   {categories.map((category) => (
//                     <option key={category} value={category}>
//                       {category}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="sort">
//                 <label>Sort By Price:</label>
//                 <select onChange={(e) => setSortOrder(e.target.value)}>
//                   <option value="default">Default</option>
//                   <option value="lowToHigh">Low to High</option>
//                   <option value="highToLow">High to Low</option>
//                 </select>
//               </div>
//               <div>
//                 {filteredAndSortedItems.map((menu) => (
//                   <div key={menu.uuid} className="menu-item">
//                     <h3>{menu.menuName}</h3>
//                     <p>Category: {menu.menuCategory}</p>
//                     <p>Price: {menu.menuPrice}</p>
//                     <p>Cooking Time: {menu.menuCookingTime}</p>
//                     <p>{menu.menuContent}</p>
//                     {menu.imageUrl && <img src={menu.imageUrl} alt="menu item" />}
//                     <button
//                       onClick={() => handleShow(menu.uuid)}
//                       className="btn btn-dark btn-margin"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(menu.uuid)}
//                       className="btn btn-dark btn-margin"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//       </div>
//       {showForm && (
//         <div className="menu-form">
//           <h2>{editMode ? "Edit Menu" : "Add Menu"}</h2>
//           <Form>
//             <Form.Group>
//               <Form.Label>Menu Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 id="menuName"
//                 value={menuName}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Cooking Time</Form.Label>
//               <Form.Control
//                 type="text"
//                 id="cookingTime"
//                 value={menuCookingTime}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Price</Form.Label>
//               <Form.Control
//                 type="text"
//                 id="menuPrice"
//                 value={menuPrice}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Category</Form.Label>
//               <Form.Control
//                 as="select"
//                 id="menuCategory"
//                 value={menuCategory}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((category) => (
//                   <option key={category} value={category}>
//                     {category}
//                   </option>
//                 ))}
//               </Form.Control>
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Content</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 id="menuContent"
//                 value={menuContent}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Availability</Form.Label>
//               <Form.Control
//                 type="text"
//                 id="availability"
//                 value={availability}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Image</Form.Label>
//               <Form.Control
//                 type="file"
//                 onChange={handleFileChange}
//               />
//             </Form.Group>
//             <button
//               type="button"
//               onClick={writeToDatabase}
//               className="btn btn-dark btn-margin"
//             >
//               {editMode ? "Update Menu" : "Add Menu"}
//             </button>
//             <button
//               type="button"
//               onClick={handleHide}
//               className="btn btn-dark btn-margin"
//             >
//               Cancel
//             </button>
//           </Form>
//         </div>
//       )}
//       <ToastContainer />
//     </>
//   );
// }

// export default AdminDashboard;

// ========================================Functions =======================================


  // const [categoriesData, setCategoriesData] = useState([]);
  // const [orderCounts, setOrderCounts] = useState({
  //   pending: 0,
  //   accepted: 0,
  //   completed: 0,
  // });
  
 

  // const [pendingOrders, setPendingOrders] = useState([]);
  // const [acceptedOrders, setAcceptedOrders] = useState([]);
  // const [completedOrders, setCompletedOrders] = useState([]);
  /*--------------------------- Fetch menu data from Firebase ---------------------------------------*/

  // useEffect(() => {
  //   const menuRef = ref(db, `/Atithi/menu/`);
  //   const unsubscribe = onValue(menuRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const menuArray = Object.values(data);

  //       setMenueData(menuArray);
  //     } else {
  //       setMenueData([]);
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [hotelName]);
  // const allMenuData = menueData;
  // const totalMenus = allMenuData.length;

  /*--------------------------- Fetch categories data from Firebase ---------------------------------------*/

  // useEffect(() => {
  //   const menuRef = ref(db, `/Atithi/categories/`);
  //   const unsubscribe = onValue(menuRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const categoriesArray = Object.values(data);

  //       setCategoriesData(categoriesArray);
  //     } else {
  //       setCategoriesData([]);
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [hotelName]);
  // const allCategoriesData = categoriesData;
  // const totalCategories = allCategoriesData.length;

  /*--------------------------- Fetch orders data from Firebase and categorize them ---------------------------------------*/

  // useEffect(() => {
  //   const ordersRef = ref(db, `Atithi/orders/`);
  //   const unsubscribe = onValue(ordersRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const pendingOrders = [];
  //       const acceptedOrders = [];
  //       const completedOrders = [];

  //       Object.keys(data).forEach((orderId) => {
  //         const order = data[orderId]?.orderData || {};
  //         const status = order.status || "Pending";

  //         if (status === "Pending") {
  //           pendingOrders.push({ ...order, orderId });
  //         } else if (status === "Accepted") {
  //           acceptedOrders.push({ ...order, orderId });
  //         } else if (status === "Completed") {
  //           completedOrders.push({ ...order, orderId });
  //         }
  //       });

  //       setPendingOrders(pendingOrders);
  //       setAcceptedOrders(acceptedOrders);
  //       setCompletedOrders(completedOrders);
  //       setOrderCounts({
  //         pending: pendingOrders.length,
  //         accepted: acceptedOrders.length,
  //         completed: completedOrders.length,
  //       });
  //     } else {
  //       setPendingOrders([]);
  //       setAcceptedOrders([]);
  //       setCompletedOrders([]);
  //       setOrderCounts({
  //         pending: 0,
  //         accepted: 0,
  //         completed: 0,
  //       });
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [hotelName]);

  // // Handle filter change
  // const handleFilterChange = (filter) => {
  //   setSelectedFilter(filter);
  // };

  /*--------------------------- categoryData ---------------------------------------*/

  // const categoryData = {};

  // completedOrders.forEach((order) => {
  //   const { menuCategory, menuName, menuPrice, quantity } = order;
  //   const price = parseFloat(menuPrice);

  //   if (!categoryData[menuCategory]) {
  //     categoryData[menuCategory] = {
  //       menuCategory,
  //       menuCategoryCount: 0,
  //       totalMenuPrice: 0,
  //     };
  //   }

  //   categoryData[menuCategory].menuCategoryCount += quantity;
  //   categoryData[menuCategory].totalMenuPrice += price * quantity;
  // });
  // // Step 2: Convert to array and add serial numbers
  // const categoryDataArray = Object.values(categoryData).map(
  //   (category, index) => ({
  //     srNo: index + 1, // Serial number (1-based index)
  //     ...category,
  //   })
  // );

  // // TotalRevenue
  // const totalRevenue = categoryDataArray.reduce(
  //   (sum, category) => sum + category.totalMenuPrice,
  //   0
  // );

  // // OrdersByCategoryGraphData


  /*--------------------------- Menu Data ---------------------------------------*/
  // const menuData = {};

  // completedOrders.forEach((order) => {
  //   const { imageUrl, menuName, menuCategory, menuPrice, quantity } = order;
  //   const price = parseFloat(menuPrice);

  //   if (!menuData[menuName]) {
  //     menuData[menuName] = {
  //       menuName,
  //       imageUrl,
  //       menuCategory,
  //       menuPrice: price,
  //       menuCount: 0,
  //       totalMenuPrice: 0,
  //     };
  //   }

  //   menuData[menuName].menuCount += quantity;
  //   menuData[menuName].totalMenuPrice += price * quantity;
  // });

  // // Step 2: Convert to array and add serial numbers
  // const menuDataArray = Object.values(menuData).map((menu, index) => ({
  //   srNo: index + 1, // Serial number (1-based index)
  //   ...menu,
  // }));

  /*--------------------------- Customer Data ---------------------------------------*/

  // const customerContData = {
  //   totalCustomers: 0,
  //   newCustomers: 0,
  //   loyalCustomers: 0,
  // };

  // const customerInfo = {};

  // completedOrders.forEach((order) => {
  //   const { checkoutData } = order;
  //   const { name, cartItems } = checkoutData;

  //   const totalOrderPrice = cartItems.reduce(
  //     (sum, item) => sum + parseFloat(item.menuPrice) * item.quantity,
  //     0
  //   );

  //   if (!customerInfo[name]) {
  //     // New customer
  //     customerInfo[name] = { name, totalMenuPrice: 0, totalOrders: 0 };
  //     customerContData.newCustomers += 1;
  //   } else {
  //     // Loyal customer
  //     customerContData.loyalCustomers += 1;
  //   }

  //   customerInfo[name].totalMenuPrice += totalOrderPrice;
  //   customerInfo[name].totalOrders += 1;
  //   customerContData.totalCustomers += 1;
  // });

  // // Convert customerInfo to an array and add serial numbers
  // const customerDataArray = Object.values(customerInfo).map(
  //   (customer, index) => ({
  //     srNo: index + 1, // Serial number (1-based index)
  //     ...customer,
  //   })
  // );

  // Count items by category
// useEffect(() => {
//   const countsByCategory = menueData.reduce((acc, menu) => {
//     const category = menu.menuCategory;
//     acc[category] = (acc[category] || 0) + 1;
//     return acc;
//   }, {});
//   setMenuCountsByCategory(countsByCategory);
// }, [menueData]);
// console.log("setMenuCountsByCategory", menuCountsByCategory);

import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AdminDashboard.css"; // Include custom CSS for additional styling if needed

import { PageTitle } from "../../Atoms";
import { CountCard, ImgCard, Table, DonutChart, Tab } from "../../components";
import {
  OrdersAndRevenueByCutomerColumns,
  OrdersAndRevenueByMenuColumns,
  RevenueByCategoryColumns,
} from "../../data/Columns";
import { useHotelContext } from "../../Context/HotelContext";

function MostOrderedMenu() {
  const [menueData, setMenueData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState("Daily");
  const [showAll, setShowAll] = useState(false);

  
  const [completedOrders, setCompletedOrders] = useState([]);
  const { hotelName } = useHotelContext();
 /*--------------------------- Fetch orders data from Firebase and categorize them ---------------------------------------*/

 useEffect(() => {
    const ordersRef = ref(db, `Atithi/orders/`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pendingOrders = [];
        const acceptedOrders = [];
        const completedOrders = [];

        Object.keys(data).forEach((orderId) => {
          const order = data[orderId]?.orderData || {};
          const status = order.status || "Pending";

          if (status === "Pending") {
            pendingOrders.push({ ...order, orderId });
          } else if (status === "Accepted") {
            acceptedOrders.push({ ...order, orderId });
          } else if (status === "Completed") {
            completedOrders.push({ ...order, orderId });
          }
        });

    
        setCompletedOrders(completedOrders);
        
      } else {
       
        setCompletedOrders([]);
       ;
      }
    });

    return () => unsubscribe();
  }, [hotelName]);

 
 /*--------------------------- Menu Data ---------------------------------------*/
 const menuData = {};

 completedOrders.forEach((order) => {
   const { imageUrl, menuName, menuCategory, menuPrice, quantity } = order;
   const price = parseFloat(menuPrice);

   if (!menuData[menuName]) {
     menuData[menuName] = {
       menuName,
       imageUrl,
       menuCategory,
       menuPrice: price,
       menuCount: 0,
       totalMenuPrice: 0,
     };
   }

   menuData[menuName].menuCount += quantity;
   menuData[menuName].totalMenuPrice += price * quantity;
 });

 // Step 2: Convert to array and add serial numbers
 const menuDataArray = Object.values(menuData).map((menu, index) => ({
   srNo: index + 1, // Serial number (1-based index)
   ...menu,
 }));
 return (
    <>
    ji
    </>
 )
}
export default MostOrderedMenu
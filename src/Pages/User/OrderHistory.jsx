import React, { useState } from "react";
import OrderSearchForm from "./OrderSearchForm";
import { useCompletedOrders, useOrdersData } from "../../data";

const OrderHistory = () => {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const hotelName = "Atithi";
  const {
    pendingOrders,
    acceptedOrders,
    completedOrders,
    cancelledOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useOrdersData(hotelName);
  const orders = completedOrders;

  const handleSearch = ({ name, mobileNo, date }) => {
    // Convert the date input to a comparable format
    const formattedDate = new Date(date).toISOString().split("T")[0];

    const filtered = orders.filter(
      (order) =>
        order.checkoutData.name.toLowerCase() === name.toLowerCase() && // Case-insensitive match
        order.checkoutData.mobileNo === mobileNo &&
        new Date(order.checkoutData.date).toISOString().split("T")[0] ===
          formattedDate // Date comparison
    );

    if (filtered.length > 0) {
      const items = filtered.reduce(
        (total, order) =>
          total +
          order.checkoutData.cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        0
      );

      const price = filtered.reduce(
        (total, order) =>
          total +
          order.checkoutData.cartItems.reduce(
            (sum, item) => sum + item.quantity * item.menuPrice,
            0
          ),
        0
      );

      setFilteredOrders(filtered);
      setTotalItems(items);
      setTotalPrice(price);
    } else {
      // Handle no results found
      setFilteredOrders([]);
      setTotalItems(0);
      setTotalPrice(0);
    }
  };

  return (
    <div>
      <OrderSearchForm onSearch={handleSearch} />
      <h2>Order Details</h2>
      <p>Total Items: {totalItems}</p>
      <p>Total Price: {totalPrice}</p>
      {filteredOrders.map((order) => (
        <div key={order.orderId}>
          <h3>Order ID: {order.orderId}</h3>
          {order.checkoutData.cartItems.map((item) => (
            <div key={item.uuid}>
              <p>
                {item.menuName} - {item.quantity} x {item.menuPrice}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;

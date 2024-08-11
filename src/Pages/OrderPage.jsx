
// OrderPage.js
import React from "react";
import { Table } from "react-bootstrap";
import { useLocation } from "react-router-dom";

function OrderPage() {
  const location = useLocation();
  const { orderData, checkoutData } = location.state || {
    orderData: [],
    checkoutData: null,
  };

  return (
    <div>
      <h2>Order Details</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Price (INR)</th>
            <th>Total Price (INR)</th>
          </tr>
        </thead>
        <tbody>
          {orderData.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.menuName}</td>
              <td>{item.quantity}</td>
              <td>{item.menuPrice}</td>
              <td>{item.menuPrice * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
        <p>Checkout Details:</p>
        {checkoutData && (
          <div>
            <p>Name: {checkoutData.name}</p>
            <p>Table Number: {checkoutData.tableNo}</p>
          </div>
        )}
        <p>Total Items: {orderData.length}</p>
        <p>
          Total Price:{" "}
          {orderData.reduce(
            (total, item) => total + item.menuPrice * item.quantity,
            0
          )}{" "}
          INR
        </p>
      </div>
    </div>
  );
}

export default OrderPage;

import React from "react";
import QRCode from "qrcode.react";
import { useLocation } from "react-router-dom";

const SplitBill = () => {
  const location = useLocation();
  const { totalAmount, checkoutData } = location.state || {
    totalAmount: 0,
    checkoutData: {},
  };

  // Your UPI details
  const payeeVPA = "vishal.gholkar1@ybl"; // Replace with your UPI ID
  const payeeName = "Vishal"; // Replace with your name

  // Generate the UPI link for the total amount
  const upiLink = `upi://pay?pa=${payeeVPA}&pn=${encodeURIComponent(
    payeeName
  )}&am=${totalAmount}&cu=INR&tn=Payment%20for%20order`;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>You have ordered {checkoutData.cartItems?.length} items</h2>
      <h3>Total Cost: ₹{totalAmount}</h3>
      <h4>Scan this QR Code to pay:</h4>
      <QRCode value={upiLink} />
    </div>
  );
};

export default SplitBill;

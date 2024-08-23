import { Navbar } from "components";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const ThankYouPage = () => {
  const [hotelName, setHotelName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { checkoutData, totalAmount, userInfo } = location.state || {};

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 4];
    setHotelName(hotelNameFromPath);
  }, []);

  const handleNext = () => {
    navigate(`/${hotelName}/orders/track-orders`, {
      state: {
        checkoutData,
        totalAmount,
        userInfo,
      },
    });
  };

  return (
    <>
      <Navbar title={`${hotelName}`}/>
   
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg text-center">
        <i
          className="bi bi-check-circle-fill text-orange-500 text-6xl"
        ></i>
        <h2 className="mt-4 text-4xl font-bold text-gray-800">Thank You!</h2>
        <p className="mt-2 text-xl text-gray-600">
          Your order has been placed successfully.
        </p>
        <p className="mt-2 text-base text-gray-500">
          We're excited to serve you! Your food is being prepared with love and care.
          Meanwhile, you can relax and track your order status.
        </p>
        <button
          variant="warning"
          className="mt-6 px-6 py-3 rounded-md bg-orange-500 text-white border border-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          onClick={handleNext}
        >
          Track Your Orders
        </button>
      </div>
    </div>
    </>
  );
};

export default ThankYouPage;

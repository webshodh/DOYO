import React from "react";
import { FaHome, FaHistory, FaShoppingCart, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BiSolidDiscount } from "react-icons/bi";
import { colors } from "theme/theme";
const Footer = ({ cartItemsCount, handleCart }) => {
  const navigate = useNavigate();
  const hotelName = "Atithi";
  const handleHome = () => {
    navigate(`/viewMenu/${hotelName}/home`);
  };

  const handleOrders = () => {
    navigate(`/${hotelName}/orders/track-orders`);
  };

  const handleOffers = () => {
    navigate(`/viewMenu/${hotelName}/home/offers`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 text-white flex justify-around items-center py-2 shadow-lg z-50" style={{background:colors.Orange}}>
      {/* Home */}
      <div className="flex flex-col items-center" onClick={handleHome}>
        <FaHome size={20} />
        <span className="text-xs mt-1">Home</span>
      </div>

      {/* Orders */}
      <div className="flex flex-col items-center" onClick={handleOrders}>
        <FaHistory size={20} />
        <span className="text-xs mt-1">Orders</span>
      </div>

      {/* Coupons */}
      <div className="flex flex-col items-center" onClick={handleOffers}>
        <BiSolidDiscount size={20} />
        <span className="text-xs mt-1">Offers</span>
      </div>

      {/* Add to Cart with Count */}
      <div
        className="relative flex flex-col items-center cursor-pointer"
        onClick={handleCart}
      >
        {/* Cart Icon */}
        <FaShoppingCart size={20} />
        {/* Cart Count */}
        {cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartItemsCount}
          </span>
        )}
        <span className="text-xs mt-1">Cart</span>
      </div>
    </div>
  );
};

export default Footer;

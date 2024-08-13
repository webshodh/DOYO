import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartSummary = ({ cartItems, getTotalPrice, hotelName }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate(`/${hotelName}/cart-details`, { state: { cartItems } });
  };

  return (
    <div className="cart-summary">
      <div className="cart-box">
        <div>Order {cartItems.length} for {getTotalPrice()} INR</div>
        <div>
          <span>{cartItems.length}</span>
          {/* <img
            src="/cart.png"
            width="30px"
            height="30px"
            alt="Cart"
            onClick={handleNext}
          /> */}
          <span  onClick={handleNext}>
          <i class="bi bi-cart-check-fill"></i>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;

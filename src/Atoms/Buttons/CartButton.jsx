import React, { memo } from "react";
import { ShoppingCart } from "lucide-react";

const CartButton = memo(
  ({ totalItems, totalAmount, onGoToCart, isMobile = false }) => {
    if (isMobile && totalItems === 0) return null;

    return (
      <button
        onClick={onGoToCart}
        className={`relative bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-all duration-200 shadow-lg ${
          isMobile
            ? "p-4 rounded-full fixed bottom-6 right-4 z-40 transform hover:scale-110 animate-pulse"
            : "px-3 py-2 sm:px-4"
        }`}
        aria-label={`View cart with ${totalItems} items`}
      >
        <ShoppingCart size={isMobile ? 24 : 18} className="sm:w-5 sm:h-5" />
        {!isMobile && (
          <span className="font-semibold text-sm sm:text-base">
            ₹{totalAmount}
          </span>
        )}
        {totalItems > 0 && (
          <span
            className={`absolute bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold ${
              isMobile
                ? "-top-2 -right-2 h-6 w-6 animate-bounce"
                : "-top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6"
            }`}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>
    );
  },
);

CartButton.displayName = "CartButton";
export default CartButton;

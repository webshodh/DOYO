
import React, { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, Search, Filter, X } from "lucide-react";

// Captain Menu Card Component
const CaptainMenuCard = ({ item, onAddToCart, cartItems = [] }) => {
  const currentQuantity =
    cartItems.find((cartItem) => cartItem.id === item.id)?.quantity || 0;

  const truncateTitle = (title, maxLength = 20) => {
    if (!title) return "";
    return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  const handleAddToCart = () => {
    onAddToCart(item, 1);
  };

  const handleRemoveFromCart = () => {
    onAddToCart(item, -1);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md p-3 transition-all duration-200 border border-gray-200 hover:border-orange-300 relative">
        
        {/* First Row: Menu Name, Discount Badge, and Veg/Non-Veg Symbol */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            {/* Menu Name */}
            <h3
              className="text-sm font-semibold text-gray-800 truncate"
              title={item.menuName}
            >
              {truncateTitle(item.menuName, 20)}
            </h3>
            
            {/* Discount Badge */}
            {item.discount > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                {item.discount}% OFF
              </span>
            )}
          </div>
          
          {/* Veg/Non-Veg Symbol */}
          <div className="flex-shrink-0 ml-2">
            {item.categoryType === "Veg" || item.categoryType === "veg" ? (
              <div className="w-4 h-4 border-2 border-green-500 bg-white rounded-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <div className="w-4 h-4 border-2 border-red-500 bg-white rounded-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Second Row: Price and Add to Cart Button */}
        <div className="flex items-center justify-between">
          {/* Price Section */}
          <div className="flex items-center gap-2">
            {item.discount && item.discount > 0 && (
              <span className="line-through text-gray-400 text-sm">
                ₹{Math.round(item.menuPrice)}
              </span>
            )}
            <span className="text-orange-600 text-lg font-bold">
              ₹{item.finalPrice}
            </span>
          </div>

          {/* Add to Cart Controls */}
          <div className="flex-shrink-0">
            {currentQuantity > 0 ? (
              // Quantity Controls
              <div className="flex items-center bg-orange-50 rounded-lg border border-orange-200">
                <button
                  onClick={handleRemoveFromCart}
                  className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-l-lg transition-colors"
                  disabled={item.availability !== "Available"}
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 py-1.5 text-sm font-semibold text-orange-700 min-w-[32px] text-center">
                  {currentQuantity}
                </span>
                <button
                  onClick={handleAddToCart}
                  className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-r-lg transition-colors"
                  disabled={item.availability !== "Available"}
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              // Add Button
              <button
                onClick={handleAddToCart}
                disabled={item.availability !== "Available"}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Availability Overlay */}
        {item.availability !== "Available" && (
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-2 text-sm font-bold rounded-lg">
              {item.availability}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptainMenuCard;
import PriceDisplay from "Atoms/PriceDisplay";
import QuantityControls from "./QuantityControls";
import VegIndicator from "Atoms/VegIndicator";
import React, { memo } from "react";


const CartItem = memo(({ item, onQuantityChange, isUpdating = false }) => {
  const isVeg = item.categoryType === "Veg" || item.categoryType === "veg";
  const itemTotal = (item.finalPrice || item.menuPrice || 0) * item.quantity;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">{item.menuName}</h3>
            <VegIndicator isVeg={isVeg} />
          </div>

          <PriceDisplay
            originalPrice={item.menuPrice}
            finalPrice={item.finalPrice}
            discount={item.discount}
            size="md"
          />

          {item.menuCategory && (
            <span className="text-xs text-gray-500 mt-1 block">
              {item.menuCategory}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <QuantityControls
          item={item}
          onQuantityChange={onQuantityChange}
          isUpdating={isUpdating}
          variant="cart"
          size="md"
        />
        <div className="text-right">
          <div className="font-bold text-gray-800 text-lg">
            &#8377;{itemTotal}
          </div>
          <div className="text-xs text-gray-500">
            &#8377;{item.finalPrice || item.menuPrice} × {item.quantity}
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = "CartItem";
export default CartItem;

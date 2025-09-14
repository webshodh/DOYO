import React, { memo } from "react";

const OrderItem = memo(({ item }) => {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {item.isVeg ? (
          <div className="w-3 h-3 border-2 border-green-500 bg-white rounded-sm flex items-center justify-center">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
          </div>
        ) : (
          <div className="w-3 h-3 border-2 border-red-500 bg-white rounded-sm flex items-center justify-center">
            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{item.menuName}</p>
          <p className="text-sm text-gray-600">
            ₹{item.finalPrice} × {item.quantity}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">₹{item.itemTotal}</p>
      </div>
    </div>
  );
});

OrderItem.displayName = "OrderItem";

export default OrderItem;

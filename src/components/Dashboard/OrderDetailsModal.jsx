import React, { memo, useEffect } from "react";
import OrderItem from "../../atoms/OrderItem";

const OrderDetailsModal = memo(({ order, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!order) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-IN");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h2>
              <p className="text-gray-600">
                Table {order.tableNumber || order.customerInfo?.tableNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Order Timestamps */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Order Timeline</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order Placed:</p>
                <p className="font-medium">
                  {formatDate(order.timestamps?.orderPlaced)} at{" "}
                  {formatTime(order.timestamps?.orderPlaced)}
                </p>
              </div>
              {order.timestamps?.preparationStarted && (
                <div>
                  <p className="text-gray-600">Preparation Started:</p>
                  <p className="font-medium">
                    {formatTime(order.timestamps.preparationStarted)}
                  </p>
                </div>
              )}
              {order.timestamps?.readyTime && (
                <div>
                  <p className="text-gray-600">Ready Time:</p>
                  <p className="font-medium">
                    {formatTime(order.timestamps.readyTime)}
                  </p>
                </div>
              )}
              {order.timestamps?.completedTime && (
                <div>
                  <p className="text-gray-600">Completed Time:</p>
                  <p className="font-medium">
                    {formatTime(order.timestamps.completedTime)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <OrderItem key={index} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{order.pricing?.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%):</span>
                <span className="font-medium">₹{order.pricing?.tax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>₹{order.pricing?.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderDetailsModal.displayName = "OrderDetailsModal";

export default OrderDetailsModal;

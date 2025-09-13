import React, { memo } from "react";
import { Eye } from "lucide-react";
import StatusBadge from "../../atoms/Badges/StatusBadge";
import OrderActionButtons from "../../atoms/Buttons/OrderActionButtons";

const OrderCard = memo(({ order, onStatusChange, onViewDetails }) => {
  const status = order.kitchen?.status || order.status || "received";

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeDifference = (startTime) => {
    if (!startTime) return "";
    const diff = Date.now() - new Date(startTime).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Table {order.tableNumber || order.customerInfo?.tableNumber}
              </span>
              <span>{formatTime(order.timestamps?.orderPlaced)}</span>
              <span>{getTimeDifference(order.timestamps?.orderPlaced)}</span>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(order)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">
              Items ({order.orderDetails?.totalItems})
            </p>
            <div className="space-y-1">
              {order.items?.slice(0, 2).map((item, index) => (
                <p key={index} className="text-sm font-medium text-gray-800">
                  {item.quantity}× {item.menuName}
                </p>
              ))}
              {order.items?.length > 2 && (
                <p className="text-sm text-gray-500">
                  +{order.items.length - 2} more items
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{order.pricing?.total || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Categories</p>
            <div className="flex flex-wrap gap-1">
              {order.orderSummary?.categories
                ?.slice(0, 3)
                .map((category, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {category}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <OrderActionButtons
        status={status}
        orderId={order.id}
        onStatusChange={onStatusChange}
      />

      {/* Rejection Reason */}
      {status === "rejected" && order.kitchen?.rejectionReason && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-2">
          Reason: {order.kitchen.rejectionReason}
        </div>
      )}
    </div>
  );
});

OrderCard.displayName = "OrderCard";

export default OrderCard;

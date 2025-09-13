import React, { memo } from "react";

const OrderActionButtons = memo(({ status, orderId, onStatusChange }) => {
  const handleStatusChange = (newStatus) => {
    if (newStatus === "rejected") {
      const reason = prompt("Please enter rejection reason:");
      if (reason !== null) {
        onStatusChange(orderId, newStatus, { rejectionReason: reason });
      }
    } else {
      onStatusChange(orderId, newStatus);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status === "received" && (
        <>
          <button
            onClick={() => handleStatusChange("preparing")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Start Preparing
          </button>
          <button
            onClick={() => handleStatusChange("rejected")}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Reject Order
          </button>
        </>
      )}
      {status === "preparing" && (
        <button
          onClick={() => handleStatusChange("ready")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          Mark Ready
        </button>
      )}
      {status === "ready" && (
        <button
          onClick={() => handleStatusChange("completed")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Mark Served
        </button>
      )}
    </div>
  );
});

OrderActionButtons.displayName = "OrderActionButtons";

export default OrderActionButtons;

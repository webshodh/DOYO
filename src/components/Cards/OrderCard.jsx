import LoadingSpinner from "atoms/LoadingSpinner";
import {
  Clock,
  DollarSign,
  Edit,
  Eye,
  Package,
  Printer,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

// Simplified Order Card Component with print bill and rejection reason
const OrderCard = ({
  order,
  onEdit,
  onView,
  onUpdateStatus,
  onDelete,
  onPrintBill,
  isUpdating,
}) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  // Simplified status options (only 3 statuses)
  const statusOptions = [
    { value: "received", label: "Received", icon: Clock, color: "yellow" },
    { value: "completed", label: "Completed", icon: Package, color: "green" },
    { value: "rejected", label: "Rejected", icon: Trash2, color: "red" },
  ];

  // Get current status config using normalizedStatus
  const statusConfig =
    statusOptions.find((s) => s.value === order.normalizedStatus) ||
    statusOptions[0];
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (newStatus) => {
    if (newStatus !== order.normalizedStatus && !isUpdating) {
      if (newStatus === "rejected") {
        setShowRejectionModal(true);
        return;
      }
      onUpdateStatus(order.id, newStatus);
    }
  };

  const handleRejectionSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsSubmittingRejection(true);
    try {
      await onUpdateStatus(order.id, "rejected", rejectionReason.trim());
      setShowRejectionModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject order:", error);
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  const handlePrintBill = () => {
    if (onPrintBill) {
      onPrintBill(order);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Conditional rendering logic for action buttons
  const isOrderCompleted = order.normalizedStatus === "completed";
  const isOrderRejected = order.normalizedStatus === "rejected";
  const canEditAndDelete = order.normalizedStatus === "received";
  const canUpdateStatus = !isOrderCompleted && !isOrderRejected;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center
                ${statusConfig.color === "yellow" ? "bg-yellow-100" : ""}
                ${statusConfig.color === "green" ? "bg-green-100" : ""}
                ${statusConfig.color === "red" ? "bg-red-100" : ""}
              `}
            >
              <StatusIcon
                className={`w-5 h-5 
                ${statusConfig.color === "yellow" ? "text-yellow-600" : ""}
                ${statusConfig.color === "green" ? "text-green-600" : ""}
                ${statusConfig.color === "red" ? "text-red-600" : ""}
              `}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {order.displayOrderNumber ||
                  `Order #${order.orderNumber || order.id}`}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDateTime(
                  order.timestamps?.orderPlaced || order.orderTimestamp
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View button - always visible */}
            <button
              onClick={() => onView(order)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Print Bill button - only visible when status is "completed" */}
            {isOrderCompleted && (
              <button
                onClick={handlePrintBill}
                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                title="Print Bill"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {/* Edit button - only visible when status is "received" */}
            {canEditAndDelete && (
              <button
                onClick={() => onEdit(order)}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit Order"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {/* Delete button - only visible when status is "received" */}
            {canEditAndDelete && (
              <button
                onClick={() => onDelete(order.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel Order"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Rejection Reason Display */}
        {isOrderRejected && order.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
            <p className="text-sm text-red-700 mt-1">{order.rejectionReason}</p>
          </div>
        )}

        {/* Order Details - Fixed data mapping */}
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Table</p>
              <p className="font-semibold">
                {order.displayTable ||
                  `Table ${order.tableInfo || order.tableNumber || "0"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Items</p>
              <p className="font-semibold">
                {order.totalItems || order.items?.length || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-semibold">
                {order.displayAmount ||
                  `₹${order.totalAmount || order.total || 0}`}
              </p>
            </div>
          </div>

          {/* Customer Name (if available) */}
          {order.customerInfo?.customerName && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-semibold text-sm truncate">
                  {order.customerInfo.customerName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Items Preview */}
        {order.items && order.items.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
            <div className="flex flex-wrap gap-2">
              {order.items.slice(0, 3).map((item, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {item.quantity}x {item.menuName}
                </span>
              ))}
              {order.items.length > 3 && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                  +{order.items.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status Update */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={order.normalizedStatus || order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating || !canUpdateStatus}
              className={`text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  statusConfig.color === "yellow"
                    ? "bg-yellow-50 text-yellow-700"
                    : ""
                }
                ${
                  statusConfig.color === "green"
                    ? "bg-green-50 text-green-700"
                    : ""
                }
                ${statusConfig.color === "red" ? "bg-red-50 text-red-700" : ""}
              `}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {isUpdating && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <LoadingSpinner size="sm" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        {/* Order Summary Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Order ID: {order.id}</span>
          {order.timestamps?.lastUpdated && (
            <span>
              Last updated: {formatDateTime(order.timestamps.lastUpdated)}
            </span>
          )}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Order
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this order:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              disabled={isSubmittingRejection}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                }}
                disabled={isSubmittingRejection}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectionSubmit}
                disabled={isSubmittingRejection || !rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingRejection && <LoadingSpinner size="sm" />}
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
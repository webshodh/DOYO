import LoadingSpinner from "atoms/LoadingSpinner";
import { ORDER_STATUSES } from "Constants/Columns";
import {
  Clock,
  DollarSign,
  Edit,
  Eye,
  Package,
  Trash2,
  User,
} from "lucide-react";

// Order Card Component
const OrderCard = ({
  order,
  onEdit,
  onView,
  onUpdateStatus,
  onDelete,
  isUpdating,
}) => {
  const statusConfig =
    ORDER_STATUSES.find((s) => s.value === order.status) || ORDER_STATUSES;
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = (newStatus) => {
    if (newStatus !== order.status && !isUpdating) {
      onUpdateStatus(order.id, newStatus);
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
  const isOrderCompleted = order.status === "completed";
  const canEditAndDelete = order.status === "received";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-${statusConfig.color}-100 flex items-center justify-center`}
          >
            <StatusIcon className={`w-5 h-5 text-${statusConfig.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber || order.id}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDateTime(order.timestamps?.orderPlaced)}
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

      {/* Order Details */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 mb-2">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-500">Table</p>
            <p className="font-semibold">{order.tableNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-500">Items</p>
            <p className="font-semibold">
              {order.orderDetails?.totalItems || order.items?.length || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold">
              ₹{order.pricing?.total || order.total || 0}
            </p>
          </div>
        </div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating || isOrderCompleted}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {isUpdating && (
          <span className="text-xs text-blue-600 flex items-center gap-1">
            <LoadingSpinner size="sm" text="Updating..." />
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderCard;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onValue, ref, update, remove } from "firebase/database";
import {
  ArrowLeft,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Minus,
  Clock,
  Package,
  CheckCircle,
  ChefHat,
  Utensils,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
  Save,
  Calendar,
  MapPin,
  User,
  Receipt,
  Timer,
  DollarSign,
} from "lucide-react";
import { db } from "../../data/firebase/firebaseConfig";
import { toast } from "react-toastify";
import { captainServices } from "../../services/captainServices";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";

// Order status configuration
const ORDER_STATUSES = [
  { value: "received", label: "Received", color: "blue", icon: Package },
  { value: "preparing", label: "Preparing", color: "yellow", icon: ChefHat },
  { value: "ready", label: "Ready", color: "green", icon: CheckCircle },
  { value: "served", label: "Served", color: "purple", icon: Utensils },
  { value: "completed", label: "Completed", color: "gray", icon: CheckCircle },
];

// Header Component
const MyOrdersHeader = ({ onGoBack, ordersCount, onRefresh, isRefreshing }) => (
  <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoBack}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-600">
              Manage and update existing orders ({ordersCount})
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    </div>
  </div>
);

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
    ORDER_STATUSES.find((s) => s.value === order.status) || ORDER_STATUSES[0];
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
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
              Table {order.tableNumber} •{" "}
              {formatDateTime(order.timestamps?.orderPlaced)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(order)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(order)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit Order"
          >
            <Edit className="w-4 h-4" />
          </button>
          {order.status === "received" && (
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Items</p>
            <p className="font-semibold">
              {order.orderDetails?.totalItems || order.items?.length || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold">
              ₹{order.pricing?.total || order.total || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Estimated</p>
            <p className="font-semibold text-xs">
              {order.timestamps?.estimatedReadyLocal || "25-30 mins"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="font-semibold text-xs">
              {order.customerInfo?.orderType || "Dine-in"}
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
            disabled={isUpdating}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
            <LoadingSpinner size="sm" />
            Updating...
          </span>
        )}
      </div>
    </div>
  );
};

// Edit Order Modal Component
const EditOrderModal = ({
  order,
  onClose,
  onSave,
  availableMenuItems = [],
}) => {
  const [editedOrder, setEditedOrder] = useState({
    ...order,
    items: order.items ? [...order.items] : [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter available menu items
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return availableMenuItems.slice(0, 20); // Limit for performance
    return availableMenuItems
      .filter((item) =>
        item.menuName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10);
  }, [availableMenuItems, searchTerm]);

  // Update item quantity
  const updateItemQuantity = useCallback((itemId, newQuantity) => {
    setEditedOrder((prev) => ({
      ...prev,
      items: prev.items
        .map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: Math.max(0, newQuantity),
                itemTotal:
                  (item.finalPrice || item.originalPrice) *
                  Math.max(0, newQuantity),
              }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  // Add new item
  const addNewItem = useCallback(
    (menuItem) => {
      const existingItemIndex = editedOrder.items.findIndex(
        (item) => item.id === menuItem.id
      );

      if (existingItemIndex !== -1) {
        updateItemQuantity(
          menuItem.id,
          editedOrder.items[existingItemIndex].quantity + 1
        );
      } else {
        const newItem = {
          id: menuItem.id,
          menuName: menuItem.menuName,
          menuCategory: menuItem.menuCategory || "",
          mainCategory: menuItem.mainCategory || "",
          categoryType: menuItem.categoryType || "",
          originalPrice: parseFloat(menuItem.menuPrice || 0),
          finalPrice: parseFloat(
            menuItem.finalPrice || menuItem.menuPrice || 0
          ),
          quantity: 1,
          itemTotal: parseFloat(menuItem.finalPrice || menuItem.menuPrice || 0),
          isVeg:
            menuItem.categoryType === "Veg" || menuItem.categoryType === "veg",
          availability: menuItem.availability || "Available",
        };

        setEditedOrder((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
      }
      setSearchTerm("");
    },
    [editedOrder.items, updateItemQuantity]
  );

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = editedOrder.items.reduce(
      (sum, item) => sum + (item.itemTotal || 0),
      0
    );
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    const totalItems = editedOrder.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    return { subtotal, tax, total, totalItems };
  }, [editedOrder.items]);

  // Save changes
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedOrder = {
        ...editedOrder,
        items: editedOrder.items,
        orderDetails: {
          ...editedOrder.orderDetails,
          totalItems: totals.totalItems,
          uniqueItems: editedOrder.items.length,
        },
        pricing: {
          ...editedOrder.pricing,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
        },
        lifecycle: {
          ...editedOrder.lifecycle,
          lastUpdated: new Date().toISOString(),
        },
      };

      await onSave(updatedOrder);
      onClose();
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order changes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Order #{order.orderNumber || order.id}
              </h2>
              <p className="text-gray-600">Table {order.tableNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Current Items */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Current Items</h3>

            {editedOrder.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No items in this order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {editedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.menuName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ₹{item.finalPrice || item.originalPrice}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right min-w-[60px]">
                        <p className="font-semibold">₹{item.itemTotal || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Items */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => addNewItem(item)}
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.menuName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ₹{item.finalPrice || item.menuPrice}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
              ))}
            </div>

            {availableMenuItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No menu items available</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{totals.tax}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{totals.total}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || editedOrder.items.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {totals.totalItems} items • {editedOrder.items.length} unique items
          </p>
        </div>
      </div>
    </div>
  );
};

// Main MyOrdersPage Component
const MyOrdersPage = () => {
  const [captain, setCaptain] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [availableMenuItems, setAvailableMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Load captain data
  useEffect(() => {
    const loadCaptainData = async () => {
      try {
        const captainData = await captainServices.getCurrentCaptain();
        if (!captainData) {
          toast.error("Captain session not found. Please login again.");
          navigate("/captain/login");
          return;
        }
        setCaptain(captainData);
      } catch (error) {
        console.error("Error loading captain data:", error);
        setError("Error loading captain information");
      }
    };

    loadCaptainData();
  }, [navigate]);

  // Set up orders listener
  useEffect(() => {
    if (!captain?.hotelName && !hotelName) return;

    const targetHotelName = hotelName || captain.hotelName;
    const ordersRef = ref(db, `/hotels/${targetHotelName}/orders`);

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const ordersArray = Object.entries(data)
              .map(([key, value]) => ({ id: key, ...value }))
              .sort((a, b) => {
                const aTime = a.timestamps?.orderPlaced || a.orderTime || 0;
                const bTime = b.timestamps?.orderPlaced || b.orderTime || 0;
                return new Date(bTime) - new Date(aTime);
              });
            setOrders(ordersArray);
          } else {
            setOrders([]);
          }
        } catch (error) {
          console.error("Error processing orders:", error);
          setError("Error processing orders data");
        } finally {
          setLoading(false);
          setIsRefreshing(false);
        }
      },
      (error) => {
        console.error("Firebase orders listener error:", error);
        setError("Error connecting to orders database");
        setLoading(false);
        setIsRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [captain, hotelName]);

  // Load menu items for editing
  useEffect(() => {
    if (!captain?.hotelName && !hotelName) return;

    const targetHotelName = hotelName || captain.hotelName;
    const menuRef = ref(db, `/hotels/${targetHotelName}/menu`);

    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const menuArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setAvailableMenuItems(menuArray);
        } else {
          setAvailableMenuItems([]);
        }
      },
      (error) => {
        console.error("Error loading menu items:", error);
      }
    );

    return () => unsubscribe();
  }, [captain, hotelName]);

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toString().includes(searchTerm) ||
          order.tableNumber?.toString().includes(searchTerm) ||
          order.id.includes(searchTerm) ||
          order.items?.some((item) =>
            item.menuName?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  // Handlers
  const handleGoBack = useCallback(() => {
    navigate("/captain/dashboard");
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // The useEffect will handle the actual refresh through the listener
  }, []);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      const targetHotelName = hotelName || captain?.hotelName;
      if (!targetHotelName) return;

      setUpdatingOrders((prev) => new Set(prev).add(orderId));

      try {
        const currentOrder = orders.find((o) => o.id === orderId);
        if (!currentOrder) {
          throw new Error("Order not found");
        }

        const now = new Date().toISOString();

        // Create comprehensive status update matching kitchen admin format
        const statusUpdate = {
          status: newStatus,
          // Update lifecycle information
          lifecycle: {
            ...currentOrder.lifecycle,
            lastUpdated: now,
            statusHistory: [
              ...(currentOrder.lifecycle?.statusHistory || []),
              {
                status: newStatus,
                timestamp: now,
                updatedBy: "captain",
                note: `Status updated to ${newStatus} by captain`,
              },
            ],
          },
          // Update timestamps for status tracking
          timestamps: {
            ...currentOrder.timestamps,
            lastStatusUpdate: now,
            [`${newStatus}Time`]: now, // Add status-specific timestamp
          },
          // Update order tracking info
          orderTracking: {
            ...currentOrder.orderTracking,
            currentStatus: newStatus,
            lastUpdated: now,
            statusUpdates: [
              ...(currentOrder.orderTracking?.statusUpdates || []),
              {
                status: newStatus,
                timestamp: now,
                source: "captain_interface",
              },
            ],
          },
        };

        const orderRef = ref(
          db,
          `/hotels/${targetHotelName}/orders/${orderId}`
        );

        await update(orderRef, statusUpdate);

        toast.success(`Order status updated to ${newStatus}`);
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update order status");
      } finally {
        setUpdatingOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }
    },
    [captain, hotelName, orders]
  );

  const handleEditOrder = useCallback((order) => {
    setEditingOrder(order);
  }, []);

  const handleSaveOrder = useCallback(
    async (updatedOrder) => {
      const targetHotelName = hotelName || captain?.hotelName;
      if (!targetHotelName) return;

      try {
        const now = new Date().toISOString();

        // Ensure the updated order maintains all required fields
        const completeOrderUpdate = {
          ...updatedOrder,
          lifecycle: {
            ...updatedOrder.lifecycle,
            lastUpdated: now,
          },
          timestamps: {
            ...updatedOrder.timestamps,
            lastModified: now,
          },
        };

        const orderRef = ref(
          db,
          `/hotels/${targetHotelName}/orders/${updatedOrder.id}`
        );
        await update(orderRef, completeOrderUpdate);
        toast.success("Order updated successfully");
      } catch (error) {
        console.error("Error saving order:", error);
        toast.error("Failed to save order changes");
        throw error;
      }
    },
    [captain, hotelName]
  );

  const handleViewOrder = useCallback((order) => {
    setViewingOrder(order);
  }, []);

  const handleDeleteOrder = useCallback(
    async (orderId) => {
      const targetHotelName = hotelName || captain?.hotelName;
      if (!targetHotelName) return;

      if (!window.confirm("Are you sure you want to cancel this order?"))
        return;

      try {
        const orderRef = ref(
          db,
          `/hotels/${targetHotelName}/orders/${orderId}`
        );
        await remove(orderRef);
        toast.success("Order cancelled successfully");
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to cancel order");
      }
    },
    [captain, hotelName]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Orders
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MyOrdersHeader
        onGoBack={handleGoBack}
        ordersCount={filteredOrders.length}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by number, table, or item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-64">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filter Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
              {statusFilter !== "all" &&
                ` • Status: ${
                  ORDER_STATUSES.find((s) => s.value === statusFilter)?.label
                }`}
              {searchTerm && ` • Search: "${searchTerm}"`}
            </div>
          </div>
        )}

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onEdit={handleEditOrder}
                onView={handleViewOrder}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteOrder}
                isUpdating={updatingOrders.has(order.id)}
              />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <NoSearchResults
            searchTerm={searchTerm}
            onClearSearch={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            message="No orders match your search criteria"
          />
        ) : (
          <EmptyState
            icon={Package}
            title="No Orders Found"
            description="No orders have been placed yet. Orders will appear here once customers start placing them."
            actionLabel="Go to Dashboard"
            onAction={handleGoBack}
          />
        )}

        {/* Status Distribution */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Status Overview
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {ORDER_STATUSES.map((status) => {
                const count = orders.filter(
                  (order) => order.status === status.value
                ).length;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={status.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      statusFilter === status.value
                        ? `border-${status.color}-500 bg-${status.color}-50`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setStatusFilter(
                        statusFilter === status.value ? "all" : status.value
                      )
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <StatusIcon
                        className={`w-5 h-5 text-${status.color}-600`}
                      />
                      <span className="text-2xl font-bold text-gray-900">
                        {count}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {status.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {count === 0
                        ? "No orders"
                        : `${count} order${count !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveOrder}
          availableMenuItems={availableMenuItems}
        />
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details #{viewingOrder.orderNumber || viewingOrder.id}
                </h2>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Table Number</p>
                    <p className="font-semibold">{viewingOrder.tableNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Order Time</p>
                    <p className="font-semibold text-sm">
                      {viewingOrder.timestamps?.orderPlacedLocal ||
                        new Date(
                          viewingOrder.timestamps?.orderPlaced || Date.now()
                        ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Ready</p>
                    <p className="font-semibold text-sm">
                      {viewingOrder.timestamps?.estimatedReadyLocal ||
                        "25-30 mins"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Order Type</p>
                    <p className="font-semibold">
                      {viewingOrder.customerInfo?.orderType || "Dine-in"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Items ({viewingOrder.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {viewingOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{item.menuName}</h4>
                        <p className="text-sm text-gray-600">
                          ₹{item.finalPrice || item.originalPrice} x{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">₹{item.itemTotal || 0}</p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No items found
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{viewingOrder.pricing?.subtotal || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%):</span>
                    <span>₹{viewingOrder.pricing?.tax || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2">
                    <span>Total:</span>
                    <span>₹{viewingOrder.pricing?.total || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Last updated:{" "}
                  {viewingOrder.lifecycle?.lastUpdated
                    ? new Date(
                        viewingOrder.lifecycle.lastUpdated
                      ).toLocaleString()
                    : "N/A"}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setViewingOrder(null);
                      setEditingOrder(viewingOrder);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Order
                  </button>
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;

import React, { useState, useMemo } from "react";
import {
  X,
  Clock,
  MapPin,
  Utensils,
  Package,
  ChefHat,
  CheckCircle2,
  CheckCircle,
  User,
  Calendar,
  Timer,
  Receipt,
  Leaf,
  Flame,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";

const OrderDetailsModal = ({
  order,
  orderStatuses,
  onClose,
  onStatusUpdate,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Memoized calculations
  const orderCalculations = useMemo(() => {
    const items = order.items || [];
    const pricing = order.pricing || {};

    return {
      totalItems:
        order.orderDetails?.totalItems ||
        items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      uniqueItems: items.length,
      subtotal:
        pricing.subtotal ||
        items.reduce(
          (sum, item) => sum + (item.finalPrice || 0) * (item.quantity || 0),
          0
        ),
      tax: pricing.tax || 0,
      total: pricing.total || 0,
      vegItems:
        order.orderSummary?.vegItems ||
        items.filter((item) => item.isVeg).length,
      nonVegItems:
        order.orderSummary?.nonVegItems ||
        items.filter((item) => !item.isVeg).length,
      specialItems:
        order.orderSummary?.specialItems ||
        items.filter(
          (item) => item.isRecommended || item.isPopular || item.isBestseller
        ).length,
    };
  }, [order]);

  const statusConfig = useMemo(() => {
    return orderStatuses.reduce((acc, status) => {
      acc[status.value] = status;
      return acc;
    }, {});
  }, [orderStatuses]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTime.toString();
    }
  };

  const getItemIcon = (item) => {
    if (item.isRecommended) return <Star className="w-4 h-4 text-yellow-500" />;
    if (item.isPopular) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (item.isBestseller) return <Award className="w-4 h-4 text-purple-500" />;
    return null;
  };

  const currentStatusInfo = statusConfig[order.status] || {};
  const StatusIcon = currentStatusInfo.icon || Clock;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full bg-${currentStatusInfo.color}-100 flex items-center justify-center`}
              >
                <StatusIcon
                  className={`w-6 h-6 text-${currentStatusInfo.color}-600`}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{order.orderNumber || order.id}
                </h2>
                <p className="text-gray-600">
                  Table {order.tableNumber || order.tableNo} •{" "}
                  {orderCalculations.totalItems} items
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Table Number
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {order.tableNumber || order.tableNo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Order Time
                      </p>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(
                          order.timestamps?.orderPlaced || order.orderTime
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Estimated Ready
                      </p>
                      <p className="text-sm text-gray-900">
                        {order.timestamps?.estimatedReadyLocal ||
                          order.estimatedTime ||
                          "25-30 mins"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Order Type
                      </p>
                      <p className="text-sm text-gray-900">
                        {order.customerInfo?.orderType || "Dine-in"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Veg Items
                      </span>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {orderCalculations.vegItems}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Utensils className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Non-Veg Items
                      </span>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                      {orderCalculations.nonVegItems}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Special Items
                      </span>
                    </div>
                    <p className="text-xl font-bold text-yellow-600">
                      {orderCalculations.specialItems}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Total Items
                      </span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {orderCalculations.totalItems}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold">
                      ₹{orderCalculations.subtotal}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Tax (18%)</span>
                    <span className="font-semibold">
                      ₹{orderCalculations.tax}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{orderCalculations.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kitchen Info */}
              {order.kitchen && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Kitchen Status
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Priority</span>
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                        {order.kitchen.priority || "Normal"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-700">Prep Time</span>
                      <span className="font-semibold">
                        {order.kitchen.preparationTime || 25} mins
                      </span>
                    </div>

                    {order.kitchen.assignedChef && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Chef</span>
                        <span className="font-semibold">
                          {order.kitchen.assignedChef}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Items
                  </h3>
                  <p className="text-sm text-gray-600">
                    {orderCalculations.uniqueItems} unique items,{" "}
                    {orderCalculations.totalItems} total quantity
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {order.items && order.items.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {item.menuName}
                                </h4>
                                {getItemIcon(item)}
                                {item.isVeg ? (
                                  <Leaf className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Utensils className="w-4 h-4 text-red-600" />
                                )}
                                {item.isSpicy && (
                                  <Flame className="w-4 h-4 text-red-500" />
                                )}
                              </div>

                              {item.menuCategory && (
                                <p className="text-sm text-gray-600 mb-1">
                                  Category: {item.menuCategory}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-700">
                                  Qty:{" "}
                                  <span className="font-semibold">
                                    {item.quantity}
                                  </span>
                                </span>
                                <span className="text-gray-700">
                                  Price: ₹
                                  {item.finalPrice || item.originalPrice}
                                </span>
                                {item.discount > 0 && (
                                  <span className="text-green-600 font-medium">
                                    {item.discount}% off
                                  </span>
                                )}
                              </div>

                              {/* Item attributes */}
                              <div className="flex gap-2 mt-2">
                                {item.isRecommended && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                    Recommended
                                  </span>
                                )}
                                {item.isPopular && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    Popular
                                  </span>
                                )}
                                {item.isBestseller && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                    Bestseller
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-gray-900">
                                ₹
                                {item.itemTotal ||
                                  (item.finalPrice || item.originalPrice) *
                                    item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No items found in this order</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status History */}
              {order.lifecycle?.statusHistory && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Status History
                    </h3>
                  </div>

                  <div className="p-4">
                    <div className="space-y-3">
                      {order.lifecycle.statusHistory.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 capitalize">
                              {entry.status}
                            </p>
                            <p className="text-sm text-gray-600">
                              {entry.note}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDateTime(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Order ID: {order.id}
              {order.metadata?.source && (
                <span className="ml-2">• Source: {order.metadata.source}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Last updated: {formatDateTime(order.lifecycle?.lastUpdated)}
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;

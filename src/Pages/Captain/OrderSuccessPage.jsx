import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import {
  CheckCircle,
  Clock,
  ChefHat,
  Utensils,
  Home,
  Eye,
  RefreshCw,
  MapPin,
  Timer,
  Package,
} from "lucide-react";
import { db } from "../../services/firebase/firebaseConfig";
import { toast } from "react-toastify";

const OrderSuccessPage = ({ orderDetails, onGoHome }) => {
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isTrackingActive, setIsTrackingActive] = useState(true);

  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Order status configuration
  const statusConfig = {
    received: {
      icon: Package,
      color: "blue",
      title: "Order Received",
      description: "Your order has been received and is being processed",
      progress: 25,
    },
    preparing: {
      icon: ChefHat,
      color: "yellow",
      title: "Being Prepared",
      description: "Our chef is preparing your delicious meal",
      progress: 50,
    },
    ready: {
      icon: CheckCircle,
      color: "green",
      title: "Ready to Serve",
      description: "Your order is ready and will be served shortly",
      progress: 75,
    },
    served: {
      icon: Utensils,
      color: "purple",
      title: "Served",
      description: "Your order has been served. Enjoy your meal!",
      progress: 100,
    },
    completed: {
      icon: CheckCircle,
      color: "gray",
      title: "Completed",
      description: "Order completed. Thank you for dining with us!",
      progress: 100,
    },
  };

  // Set up real-time order tracking
  useEffect(() => {
    if (!orderDetails?.firebaseId || !hotelName || !isTrackingActive) return;

    const orderRef = ref(
      db,
      `/hotels/${hotelName}/orders/${orderDetails.firebaseId}`
    );

    const unsubscribe = onValue(
      orderRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCurrentOrderData(data);
          setLastUpdated(new Date());

          // Show status update notifications
          if (currentOrderData && data.status !== currentOrderData.status) {
            const statusInfo = statusConfig[data.status];
            if (statusInfo) {
              toast.success(`Order #${data.orderNumber}: ${statusInfo.title}`);
            }
          }
        }
      },
      (error) => {
        console.error("Error tracking order:", error);
        toast.error(
          "Unable to track order status. Please check your connection."
        );
      }
    );

    return () => unsubscribe();
  }, [orderDetails?.firebaseId, hotelName, isTrackingActive, currentOrderData]);

  // Initialize with order details
  useEffect(() => {
    if (orderDetails?.orderData && !currentOrderData) {
      setCurrentOrderData(orderDetails.orderData);
    }
  }, [orderDetails, currentOrderData]);

  const handleRefreshOrder = () => {
    setLoading(true);
    // Force refresh by toggling tracking
    setIsTrackingActive(false);
    setTimeout(() => {
      setIsTrackingActive(true);
      setLoading(false);
    }, 1000);
  };

  const handleTrackOrder = () => {
    if (hotelName) {
      navigate(`/captain/dashboard`);
    } else {
      onGoHome();
    }
  };

  const getEstimatedTime = () => {
    const orderData = currentOrderData || orderDetails?.orderData;
    if (orderData?.timestamps?.estimatedReadyLocal) {
      return orderData.timestamps.estimatedReadyLocal;
    }
    if (orderDetails?.estimatedTime) {
      return orderDetails.estimatedTime;
    }
    return "25-30 minutes";
  };

  const getCurrentStatus = () => {
    return currentOrderData?.status || orderDetails?.status || "received";
  };

  const getCurrentStatusConfig = () => {
    return statusConfig[getCurrentStatus()] || statusConfig.received;
  };

  const orderData = currentOrderData || orderDetails?.orderData || {};
  const currentStatus = getCurrentStatus();
  const currentStatusInfo = getCurrentStatusConfig();
  const StatusIcon = currentStatusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <div
            className={`w-16 h-16 bg-${currentStatusInfo.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <StatusIcon
              className={`w-8 h-8 text-${currentStatusInfo.color}-600`}
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStatusInfo.title}
          </h1>

          <p className="text-gray-600 mb-4">{currentStatusInfo.description}</p>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Order Progress
              </span>
              <span className="text-sm text-gray-600">
                {currentStatusInfo.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-${currentStatusInfo.color}-500 h-2 rounded-full transition-all duration-500`}
                style={{ width: `${currentStatusInfo.progress}%` }}
              ></div>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <button
                onClick={handleRefreshOrder}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Basic Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Order Number
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  #{orderDetails?.orderNumber || orderData.orderNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Table Number
                </label>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {orderDetails?.tableNumber || orderData.tableNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Total Items
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {orderDetails?.items || orderData.orderDetails?.totalItems}{" "}
                  items
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Total Amount
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{orderDetails?.total || orderData.pricing?.total}
                </p>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Estimated Ready Time
                </span>
              </div>
              <p className="text-blue-800 font-semibold">
                {getEstimatedTime()}
              </p>
            </div>

            {/* Order Items Summary */}
            {orderData.items && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Items Ordered
                </h3>
                <div className="space-y-2">
                  {orderData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.menuName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{item.itemTotal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Imp code hide for now  */}
        {/* Status Timeline */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Status Timeline
          </h3>

          <div className="space-y-4">
            {Object.entries(statusConfig).map(([status, config], index) => {
              const isActive = status === currentStatus;
              const isCompleted =
                Object.keys(statusConfig).indexOf(currentStatus) > index;
              const Icon = config.icon;

              return (
                <div key={status} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? `bg-${config.color}-100 border-2 border-${config.color}-500`
                        : isCompleted
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-gray-100 border-2 border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? `text-${config.color}-600`
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isActive || isCompleted
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {config.title}
                    </p>
                    <p
                      className={`text-sm ${
                        isActive || isCompleted
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {config.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Current</span>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Done</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div> */}

        {/* Imp code hide for now  */}
        {/* Support Info */}
        {/* <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-900">Need Help?</span>
          </div>
          <p className="text-sm text-amber-800">
            If you have any questions about your order or need assistance,
            please contact our staff at your table or visit the reception desk.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default OrderSuccessPage;

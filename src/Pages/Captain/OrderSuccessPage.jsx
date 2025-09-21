// src/Pages/Captain/OrderSuccessPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  User,
  Phone,
  Calendar,
  TrendingUp,
  AlertCircle,
  Wifi,
  WifiOff,
  Share2,
  Download,
  Receipt,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { toast } from "react-toastify";

import LoadingSpinner from "../../atoms/LoadingSpinner";

const OrderSuccessPage = ({ orderDetails, onGoHome }) => {
  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // State management
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isTrackingActive, setIsTrackingActive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [captainInfo, setCaptainInfo] = useState(null);
  const [estimatedReadyTime, setEstimatedReadyTime] = useState(null);

  const navigate = useNavigate();
  const { hotelName } = useParams();

  // ✅ ENHANCED: Order status configuration with better progress tracking
  const statusConfig = {
    received: {
      icon: Package,
      color: "blue",
      title: "Order Received",
      description: "Your order has been received and is being processed",
      progress: 25,
      estimatedMinutes: 5,
    },
    preparing: {
      icon: ChefHat,
      color: "yellow",
      title: "Being Prepared",
      description: "Our chef is preparing your delicious meal",
      progress: 50,
      estimatedMinutes: 15,
    },
    ready: {
      icon: CheckCircle,
      color: "green",
      title: "Ready to Serve",
      description: "Your order is ready and will be served shortly",
      progress: 75,
      estimatedMinutes: 2,
    },
    completed: {
      icon: Utensils,
      color: "purple",
      title: "Completed",
      description: "Your order has been completed. Enjoy your meal!",
      progress: 100,
      estimatedMinutes: 0,
    },
    rejected: {
      icon: AlertCircle,
      color: "red",
      title: "Order Issue",
      description: "There was an issue with your order. Please contact staff.",
      progress: 0,
      estimatedMinutes: 0,
    },
  };

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>Connecting...</span>
        </div>
      );
    } else if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
        </div>
      );
    } else if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>Live Tracking</span>
        </div>
      );
    }
    return null;
  };

  // ✅ NEW: Load captain information
  useEffect(() => {
    const loadCaptainInfo = async () => {
      const captainId = orderDetails?.orderData?.captainId || currentUser?.uid;
      if (!captainId) return;

      try {
        const captainDoc = await getDoc(doc(db, "captains", captainId));
        if (captainDoc.exists()) {
          setCaptainInfo({
            id: captainDoc.id,
            ...captainDoc.data(),
          });
        }
      } catch (error) {
        console.error("Error loading captain info:", error);
      }
    };

    loadCaptainInfo();
  }, [orderDetails, currentUser]);

  // ✅ ENHANCED: Set up real-time order tracking with Firestore
  useEffect(() => {
    if (!orderDetails?.firestoreId && !orderDetails?.orderData?.id) {
      console.warn("No order ID available for tracking");
      return;
    }

    const orderId = orderDetails.firestoreId || orderDetails.orderData?.id;
    if (!orderId || !isTrackingActive) return;

    setConnectionStatus("connecting");

    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (doc) => {
        if (doc.exists()) {
          const data = {
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to dates
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            estimatedReadyTime: doc.data().estimatedReadyTime?.toDate(),
          };

          setCurrentOrderData(data);
          setLastUpdated(new Date());
          setConnectionStatus("connected");

          // ✅ NEW: Update estimated ready time
          if (data.estimatedReadyTime) {
            setEstimatedReadyTime(data.estimatedReadyTime);
          }

          // ✅ ENHANCED: Show status update notifications with better messages
          if (currentOrderData && data.status !== currentOrderData.status) {
            const statusInfo = statusConfig[data.status];
            if (statusInfo) {
              toast.success(`Order #${data.orderNumber}: ${statusInfo.title}`, {
                icon: React.createElement(statusInfo.icon, {
                  className: `w-5 h-5 text-${statusInfo.color}-600`,
                }),
                autoClose: 3000,
              });

              // ✅ NEW: Play notification sound (optional)
              if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
            }
          }
        } else {
          console.warn("Order document not found");
          setConnectionStatus("error");
        }
      },
      (error) => {
        console.error("Error tracking order:", error);
        setConnectionStatus("error");
        toast.error(
          "Unable to track order status. Please check your connection."
        );
      }
    );

    return () => unsubscribe();
  }, [orderDetails, isTrackingActive, currentOrderData]);

  // Initialize with order details
  useEffect(() => {
    if (orderDetails?.orderData && !currentOrderData) {
      setCurrentOrderData({
        ...orderDetails.orderData,
        // Handle timestamp conversion
        createdAt: orderDetails.orderData.createdAt?.toDate
          ? orderDetails.orderData.createdAt.toDate()
          : new Date(orderDetails.orderData.createdAt || Date.now()),
        estimatedReadyTime: orderDetails.orderData.estimatedReadyTime?.toDate
          ? orderDetails.orderData.estimatedReadyTime.toDate()
          : new Date(Date.now() + 25 * 60000), // 25 minutes from now
      });
    }
  }, [orderDetails, currentOrderData]);

  // ✅ ENHANCED: Refresh order with better error handling
  const handleRefreshOrder = useCallback(async () => {
    setLoading(true);
    setConnectionStatus("connecting");

    try {
      // Force refresh by toggling tracking
      setIsTrackingActive(false);

      // Wait a moment then re-enable tracking
      setTimeout(() => {
        setIsTrackingActive(true);
        setLoading(false);
        toast.success("Order status refreshed");
      }, 1000);
    } catch (error) {
      console.error("Error refreshing order:", error);
      setLoading(false);
      setConnectionStatus("error");
      toast.error("Failed to refresh order status");
    }
  }, []);

  // ✅ ENHANCED: Navigation with better routing
  const handleTrackOrder = useCallback(() => {
    if (hotelName) {
      navigate(`/viewMenu/${hotelName}/captain/dashboard`);
    } else {
      onGoHome();
    }
  }, [navigate, hotelName, onGoHome]);

  // ✅ NEW: Share order details
  const handleShareOrder = useCallback(async () => {
    const orderData = currentOrderData || orderDetails?.orderData || {};
    const shareData = {
      title: `Order #${orderData.orderNumber}`,
      text: `Order for Table ${orderData.tableNumber} - Total: ₹${
        orderData.pricing?.total || orderDetails?.total
      }`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${shareData.title}\n${shareData.text}`;
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success("Order details copied to clipboard!");
      });
    }
  }, [currentOrderData, orderDetails]);

  // ✅ ENHANCED: Get estimated time with better calculation
  const getEstimatedTime = useCallback(() => {
    const orderData = currentOrderData || orderDetails?.orderData;

    // Use real estimated ready time if available
    if (estimatedReadyTime) {
      return estimatedReadyTime.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (orderData?.estimatedReadyTime) {
      const readyTime = orderData.estimatedReadyTime.toDate
        ? orderData.estimatedReadyTime.toDate()
        : new Date(orderData.estimatedReadyTime);
      return readyTime.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (orderDetails?.estimatedTime) {
      return orderDetails.estimatedTime;
    }

    // Calculate based on current status
    const currentStatus = getCurrentStatus();
    const statusInfo = statusConfig[currentStatus];
    if (statusInfo && statusInfo.estimatedMinutes > 0) {
      const estimatedTime = new Date(
        Date.now() + statusInfo.estimatedMinutes * 60000
      );
      return estimatedTime.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "25-30 minutes";
  }, [currentOrderData, orderDetails, estimatedReadyTime]);

  const getCurrentStatus = () => {
    return currentOrderData?.status || orderDetails?.status || "received";
  };

  const getCurrentStatusConfig = () => {
    return statusConfig[getCurrentStatus()] || statusConfig.received;
  };

  // ✅ NEW: Calculate time remaining
  const getTimeRemaining = () => {
    if (!estimatedReadyTime) return null;

    const now = new Date();
    const diffMs = estimatedReadyTime.getTime() - now.getTime();

    if (diffMs <= 0) return "Ready now!";

    const diffMins = Math.ceil(diffMs / (1000 * 60));
    return `${diffMins} minutes remaining`;
  };

  // Memoized values
  const orderData = useMemo(
    () => currentOrderData || orderDetails?.orderData || {},
    [currentOrderData, orderDetails]
  );

  const currentStatus = getCurrentStatus();
  const currentStatusInfo = getCurrentStatusConfig();
  const StatusIcon = currentStatusInfo.icon;
  const timeRemaining = getTimeRemaining();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ✅ ENHANCED: Success Header with connection status */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div
                className={`w-16 h-16 bg-${currentStatusInfo.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <StatusIcon
                  className={`w-8 h-8 text-${currentStatusInfo.color}-600`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ConnectionStatusIndicator />
              <button
                onClick={handleShareOrder}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Share Order"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStatusInfo.title}
          </h1>

          <p className="text-gray-600 mb-4">{currentStatusInfo.description}</p>

          {/* ✅ NEW: Time remaining indicator */}
          {timeRemaining &&
            currentStatus !== "completed" &&
            currentStatus !== "rejected" && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <Timer size={16} />
                  <span className="font-medium">{timeRemaining}</span>
                </div>
              </div>
            )}

          {/* Progress bar */}
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

        {/* ✅ ENHANCED: Order Details Card */}
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

            {/* ✅ NEW: Customer and Captain Info */}
            {(orderData.customerName || captainInfo) && (
              <div className="grid grid-cols-2 gap-4">
                {orderData.customerName && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Customer
                    </label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      {orderData.customerName}
                    </p>
                  </div>
                )}
                {captainInfo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Captain
                    </label>
                    <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                      <ChefHat className="w-4 h-4 text-gray-400" />
                      {captainInfo.name || captainInfo.firstName}
                    </p>
                  </div>
                )}
              </div>
            )}

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
              {timeRemaining && currentStatus !== "completed" && (
                <p className="text-blue-600 text-sm mt-1">{timeRemaining}</p>
              )}
            </div>

            {/* ✅ ENHANCED: Order Items Summary */}
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {item.menuName}
                          </p>
                          {item.isVeg ? (
                            <div className="w-3 h-3 border border-green-600 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="w-3 h-3 border border-red-600 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-red-600"></div>
                            </div>
                          )}
                        </div>
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

                {/* ✅ NEW: Billing breakdown */}
                {orderData.pricing && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{orderData.pricing.subtotal}</span>
                      </div>
                      {orderData.pricing.serviceCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Charge</span>
                          <span>₹{orderData.pricing.serviceCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span>₹{orderData.pricing.tax}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>₹{orderData.pricing.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW: Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleTrackOrder}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <TrendingUp size={18} />
            Go to Dashboard
          </button>

          {currentStatus === "completed" && (
            <button
              onClick={onGoHome}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Home size={18} />
              Place New Order
            </button>
          )}
        </div>

        {/* ✅ NEW: Support Info for rejected orders */}
        {currentStatus === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">Order Issue</span>
            </div>
            <p className="text-sm text-red-800">
              {orderData.rejectionReason ||
                "There was an issue with your order. Please contact the restaurant staff for assistance."}
            </p>
            {orderData.customerPhone && (
              <div className="mt-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">
                  Contact: {orderData.customerPhone}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">
                Refreshing order status...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;

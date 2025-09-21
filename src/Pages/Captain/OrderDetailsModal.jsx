// src/components/modals/OrderDetailsModal.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Edit,
  Trash2,
  Printer,
  Share2,
  AlertTriangle,
  Phone,
  MessageSquare,
  Wifi,
  WifiOff,
  DollarSign,
  Info,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import { 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { toast } from "react-toastify";

import LoadingSpinner from "../../atoms/LoadingSpinner";

const OrderDetailsModal = ({
  order,
  orderStatuses,
  onClose,
  onStatusUpdate,
  showDetailedInfo = false,
  allowEdit = true,
  allowStatusChange = true,
  captainMode = false,
}) => {
  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // State management
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [captainInfo, setCaptainInfo] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // ✅ NEW: Real-time order updates
  useEffect(() => {
    if (!order.id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'orders', order.id),
      (doc) => {
        if (doc.exists()) {
          const updatedOrder = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          };
          setCurrentOrder(updatedOrder);
          setConnectionStatus('connected');
        }
      },
      (error) => {
        console.error("Error listening to order updates:", error);
        setConnectionStatus('error');
      }
    );

    return () => unsubscribe();
  }, [order.id]);

  // ✅ NEW: Load captain information
  useEffect(() => {
    const loadCaptainInfo = async () => {
      if (!currentOrder.captainId) return;

      try {
        const captainDoc = await getDoc(doc(db, 'captains', currentOrder.captainId));
        if (captainDoc.exists()) {
          setCaptainInfo({
            id: captainDoc.id,
            ...captainDoc.data()
          });
        }
      } catch (error) {
        console.error("Error loading captain info:", error);
      }
    };

    loadCaptainInfo();
  }, [currentOrder.captainId]);

  // ✅ ENHANCED: Memoized calculations with hotel-specific rates
  const orderCalculations = useMemo(() => {
    const items = currentOrder.items || [];
    const pricing = currentOrder.pricing || {};

    // Get rates from hotel settings or current order
    const serviceChargeRate = selectedHotel?.serviceCharge || pricing.serviceChargeRate || 0.05;
    const taxRate = selectedHotel?.taxRate || pricing.taxPercentage ? pricing.taxPercentage / 100 : 0.18;

    const subtotal = pricing.subtotal || 
      items.reduce((sum, item) => sum + (item.finalPrice || 0) * (item.quantity || 0), 0);
    
    const serviceCharge = pricing.serviceCharge || Math.round(subtotal * serviceChargeRate);
    const taxableAmount = subtotal + serviceCharge;
    const tax = pricing.tax || Math.round(taxableAmount * taxRate);
    const total = pricing.total || taxableAmount + tax;

    return {
      totalItems: currentOrder.orderDetails?.totalItems ||
        items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      uniqueItems: items.length,
      subtotal,
      serviceCharge,
      serviceChargeRate,
      tax,
      taxRate,
      total,
      vegItems: currentOrder.orderSummary?.vegItems ||
        items.filter((item) => item.isVeg).length,
      nonVegItems: currentOrder.orderSummary?.nonVegItems ||
        items.filter((item) => !item.isVeg).length,
      specialItems: currentOrder.orderSummary?.specialItems ||
        items.filter((item) => item.isRecommended || item.isPopular || item.isBestseller).length,
      spicyItems: currentOrder.orderSummary?.spicyItems ||
        items.filter((item) => item.isSpicy).length,
    };
  }, [currentOrder, selectedHotel]);

  // ✅ ENHANCED: Status configuration with better UI
  const statusConfig = useMemo(() => {
    const config = {
      received: { 
        label: 'Received', 
        color: 'blue', 
        icon: Clock, 
        description: 'Order has been received and is being prepared' 
      },
      preparing: { 
        label: 'Preparing', 
        color: 'yellow', 
        icon: ChefHat, 
        description: 'Order is currently being prepared in the kitchen' 
      },
      ready: { 
        label: 'Ready', 
        color: 'green', 
        icon: CheckCircle, 
        description: 'Order is ready for pickup/serving' 
      },
      completed: { 
        label: 'Completed', 
        color: 'green', 
        icon: CheckCircle2, 
        description: 'Order has been completed and delivered' 
      },
      rejected: { 
        label: 'Rejected', 
        color: 'red', 
        icon: X, 
        description: 'Order has been rejected or cancelled' 
      },
    };

    // Override with provided status config if available
    orderStatuses.forEach(status => {
      if (config[status.value]) {
        config[status.value] = { ...config[status.value], ...status };
      }
    });

    return config;
  }, [orderStatuses]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === 'connecting') {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-xs">
          <Wifi className="animate-pulse" size={12} />
          <span>Syncing...</span>
        </div>
      );
    } else if (connectionStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-red-600 text-xs">
          <WifiOff size={12} />
          <span>Connection Error</span>
        </div>
      );
    } else if (connectionStatus === 'connected') {
      return (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle size={12} />
          <span>Live</span>
        </div>
      );
    }
    return null;
  };

  // ✅ ENHANCED: Handle status change with rejection reason
  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentOrder.status || isUpdatingStatus) return;

    // Show rejection modal for rejected status
    if (newStatus === 'rejected') {
      setShowRejectionModal(true);
      return;
    }

    await updateOrderStatus(newStatus);
  };

  // ✅ NEW: Update order status with proper Firestore integration
  const updateOrderStatus = useCallback(async (newStatus, reason = null) => {
    setIsUpdatingStatus(true);
    
    try {
      if (onStatusUpdate) {
        const result = await onStatusUpdate(currentOrder.id, newStatus, reason);
        if (result.success) {
          toast.success(`Order status updated to ${newStatus}`);
          setShowRejectionModal(false);
          setRejectionReason("");
        } else {
          toast.error(result.error || 'Failed to update status');
        }
      } else {
        // Direct Firestore update if no handler provided
        const orderDocRef = doc(db, 'orders', currentOrder.id);
        
        await updateDoc(orderDocRef, {
          status: newStatus,
          normalizedStatus: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
          updatedByName: captainInfo?.name || 'Staff',
          ...(reason && { rejectionReason: reason }),
          kitchen: {
            status: newStatus,
            lastUpdated: serverTimestamp(),
            notes: reason || `Status updated to ${newStatus}`,
          }
        });

        toast.success(`Order status updated to ${newStatus}`);
        setShowRejectionModal(false);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [currentOrder.id, onStatusUpdate, currentUser, captainInfo]);

  // ✅ ENHANCED: Format date/time with better handling
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    
    try {
      let date = dateTime;
      if (dateTime.toDate) {
        date = dateTime.toDate(); // Firestore Timestamp
      } else if (typeof dateTime === 'string') {
        date = new Date(dateTime);
      }
      
      return date.toLocaleString("en-IN", {
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

  // ✅ NEW: Get estimated completion time
  const getEstimatedTime = () => {
    if (currentOrder.estimatedReadyTime) {
      return formatDateTime(currentOrder.estimatedReadyTime);
    }
    
    if (currentOrder.kitchen?.estimatedCompletionTime) {
      return formatDateTime(currentOrder.kitchen.estimatedCompletionTime);
    }
    
    // Calculate based on creation time + preparation time
    const createdAt = currentOrder.createdAt || new Date(currentOrder.timestamps?.orderPlaced);
    const prepTime = currentOrder.kitchen?.preparationTime || 25; // 25 minutes default
    const estimatedTime = new Date(createdAt.getTime() + prepTime * 60000);
    
    return formatDateTime(estimatedTime);
  };

  // ✅ ENHANCED: Get item icon with better indicators
  const getItemIcon = (item) => {
    const icons = [];
    if (item.isRecommended) icons.push(<Star key="star" className="w-4 h-4 text-yellow-500" title="Recommended" />);
    if (item.isPopular) icons.push(<TrendingUp key="trending" className="w-4 h-4 text-blue-500" title="Popular" />);
    if (item.isBestseller) icons.push(<Award key="award" className="w-4 h-4 text-purple-500" title="Bestseller" />);
    if (item.isSpicy) icons.push(<Flame key="flame" className="w-4 h-4 text-red-500" title="Spicy" />);
    return icons.length > 0 ? <div className="flex gap-1">{icons}</div> : null;
  };

  const currentStatusInfo = statusConfig[currentOrder.status] || statusConfig.received;
  const StatusIcon = currentStatusInfo.icon || Clock;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* ✅ ENHANCED: Header with connection status and actions */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-${currentStatusInfo.color}-100 flex items-center justify-center`}>
                <StatusIcon className={`w-6 h-6 text-${currentStatusInfo.color}-600`} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{currentOrder.orderNumber || currentOrder.id}
                  </h2>
                  <ConnectionStatusIndicator />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>Table {currentOrder.tableNumber}</span>
                  </div>
                  {currentOrder.customerName && (
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{currentOrder.customerName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Package size={14} />
                    <span>{orderCalculations.totalItems} items</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    <span>₹{orderCalculations.total}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* ✅ NEW: Quick action buttons */}
              {captainMode && (
                <>
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Print Order"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.share && navigator.share({
                        title: `Order #${currentOrder.orderNumber}`,
                        text: `Order details for Table ${currentOrder.tableNumber}`,
                      });
                    }}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Share Order"
                  >
                    <Share2 size={16} />
                  </button>
                </>
              )}
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* ✅ NEW: Status change buttons */}
          {allowStatusChange && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(statusConfig).map(([statusKey, statusInfo]) => (
                <button
                  key={statusKey}
                  onClick={() => handleStatusChange(statusKey)}
                  disabled={isUpdatingStatus || currentOrder.status === statusKey}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    currentOrder.status === statusKey
                      ? `bg-${statusInfo.color}-100 text-${statusInfo.color}-800 border-2 border-${statusInfo.color}-300`
                      : `bg-gray-100 text-gray-700 hover:bg-${statusInfo.color}-50 hover:text-${statusInfo.color}-700 border border-gray-300`
                  } disabled:opacity-50`}
                >
                  {isUpdatingStatus && currentOrder.status !== statusKey ? (
                    <LoadingSpinner size="xs" />
                  ) : (
                    statusInfo.label
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info size={18} />
                  Order Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Table Number</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentOrder.tableNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Order Time</p>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(currentOrder.createdAt || currentOrder.timestamps?.orderPlaced)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estimated Ready</p>
                      <p className="text-sm text-gray-900">{getEstimatedTime()}</p>
                    </div>
                  </div>

                  {currentOrder.customerPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-900">{currentOrder.customerPhone}</p>
                      </div>
                    </div>
                  )}

                  {captainInfo && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Captain</p>
                        <p className="text-sm text-gray-900">{captainInfo.name || captainInfo.firstName}</p>
                      </div>
                    </div>
                  )}

                  {currentOrder.specialInstructions && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                        <p className="text-sm text-gray-900 bg-yellow-50 p-2 rounded mt-1">
                          {currentOrder.specialInstructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Veg Items</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">{orderCalculations.vegItems}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Utensils className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Non-Veg</span>
                    </div>
                    <p className="text-xl font-bold text-red-600">{orderCalculations.nonVegItems}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Spicy Items</span>
                    </div>
                    <p className="text-xl font-bold text-orange-600">{orderCalculations.spicyItems}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">Special</span>
                    </div>
                    <p className="text-xl font-bold text-yellow-600">{orderCalculations.specialItems}</p>
                  </div>
                </div>
              </div>

              {/* ✅ ENHANCED: Payment Summary with service charges */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold">₹{orderCalculations.subtotal}</span>
                  </div>

                  {orderCalculations.serviceCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        Service Charge ({(orderCalculations.serviceChargeRate * 100).toFixed(0)}%)
                      </span>
                      <span className="font-semibold">₹{orderCalculations.serviceCharge}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      Tax ({(orderCalculations.taxRate * 100).toFixed(0)}%)
                    </span>
                    <span className="font-semibold">₹{orderCalculations.tax}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-600">₹{orderCalculations.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                  <p className="text-sm text-gray-600">
                    {orderCalculations.uniqueItems} unique items, {orderCalculations.totalItems} total quantity
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {currentOrder.items && currentOrder.items.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {currentOrder.items.map((item, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{item.menuName}</h4>
                                {getItemIcon(item)}
                                {item.isVeg ? (
                                  <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-red-600"></div>
                                  </div>
                                )}
                              </div>

                              {item.menuCategory && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Category: {item.menuCategory}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-700">
                                  Qty: <span className="font-semibold">{item.quantity}</span>
                                </span>
                                <span className="text-gray-700">
                                  Price: ₹{item.finalPrice || item.originalPrice}
                                </span>
                                {item.discount > 0 && (
                                  <span className="text-green-600 font-medium">
                                    {item.discount}% off
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{item.itemTotal || (item.finalPrice || item.originalPrice) * item.quantity}
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

              {/* ✅ ENHANCED: Status History with better UI */}
              {currentOrder.lifecycle?.statusHistory && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Status History</h3>
                      <button
                        onClick={() => setShowStatusHistory(!showStatusHistory)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {showStatusHistory ? 'Hide' : 'Show'} History
                      </button>
                    </div>
                  </div>

                  {showStatusHistory && (
                    <div className="p-4">
                      <div className="space-y-3">
                        {currentOrder.lifecycle.statusHistory.map((entry, index) => (
                          <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                            <div className={`w-8 h-8 bg-${statusConfig[entry.status]?.color || 'blue'}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                              <CheckCircle className={`w-4 h-4 text-${statusConfig[entry.status]?.color || 'blue'}-600`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 capitalize">{entry.status}</p>
                              {entry.note && (
                                <p className="text-sm text-gray-600">{entry.note}</p>
                              )}
                              {entry.updatedByName && (
                                <p className="text-xs text-gray-500">by {entry.updatedByName}</p>
                              )}
                              <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ NEW: Rejection Reason Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Reject Order
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this order:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="3"
                required
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateOrderStatus('rejected', rejectionReason)}
                  disabled={!rejectionReason.trim() || isUpdatingStatus}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingStatus ? <LoadingSpinner size="xs" /> : null}
                  Reject Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;

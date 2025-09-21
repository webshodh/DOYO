// src/components/modals/EditOrderModal.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X,
  Package,
  Minus,
  Plus,
  Search,
  AlertCircle,
  Save,
  ChevronLeft,
  ShoppingCart,
  Clock,
  DollarSign,
  User,
  MapPin,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";

import LoadingSpinner from "atoms/LoadingSpinner";

// Edit Order Modal Component
const EditOrderModal = ({
  order,
  onClose,
  onSave,
  availableMenuItems = [],
}) => {
  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // State management
  const [editedOrder, setEditedOrder] = useState({
    ...order,
    items: order.items ? [...order.items] : [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'add'
  const [captainInfo, setCaptainInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ✅ NEW: Get hotel ID for queries
  const hotelId = useMemo(() => {
    return selectedHotel?.id || order.hotelId;
  }, [selectedHotel, order.hotelId]);

  // ✅ ENHANCED: Use Firestore collection hook for real-time menu items
  const {
    documents: menuItems,
    loading: menuLoading,
    error: menuError,
    connectionStatus: menuConnection,
  } = useFirestoreCollection("menuItems", {
    where: hotelId
      ? [
          ["hotelId", "==", hotelId],
          ["availability", "==", "Available"],
        ]
      : null,
    orderBy: [["menuName", "asc"]],
    realtime: true,
  });

  // ✅ NEW: Load captain information
  useEffect(() => {
    const loadCaptainInfo = async () => {
      if (!currentUser?.uid) return;

      try {
        const captainDoc = await getDoc(doc(db, "captains", currentUser.uid));
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
  }, [currentUser]);

  // ✅ NEW: Track unsaved changes
  useEffect(() => {
    const originalItemsStr = JSON.stringify(order.items || []);
    const currentItemsStr = JSON.stringify(editedOrder.items || []);
    setHasUnsavedChanges(originalItemsStr !== currentItemsStr);
  }, [editedOrder.items, order.items]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (menuConnection === "connecting" || menuLoading) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-xs">
          <Wifi className="animate-pulse" size={12} />
          <span>Loading menu...</span>
        </div>
      );
    } else if (menuConnection === "error" || menuError) {
      return (
        <div className="flex items-center gap-2 text-red-600 text-xs">
          <WifiOff size={12} />
          <span>Connection Error</span>
        </div>
      );
    } else if (menuConnection === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle size={12} />
          <span>Menu loaded</span>
        </div>
      );
    }
    return null;
  };

  // ✅ ENHANCED: Filter available menu items with better search
  const filteredMenuItems = useMemo(() => {
    const items =
      menuItems && menuItems.length > 0 ? menuItems : availableMenuItems;

    if (!searchTerm) return items.slice(0, 20);

    const search = searchTerm.toLowerCase();
    return items
      .filter(
        (item) =>
          item.menuName?.toLowerCase().includes(search) ||
          item.menuCategory?.toLowerCase().includes(search) ||
          item.mainCategory?.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [menuItems, availableMenuItems, searchTerm]);

  // ✅ ENHANCED: Update item quantity with validation
  const updateItemQuantity = useCallback((itemId, newQuantity) => {
    setEditedOrder((prev) => ({
      ...prev,
      items: prev.items
        .map((item) => {
          if (item.id === itemId) {
            const updatedQuantity = Math.max(0, newQuantity);
            const itemPrice = item.finalPrice || item.originalPrice || 0;
            return {
              ...item,
              quantity: updatedQuantity,
              itemTotal: itemPrice * updatedQuantity,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  // ✅ ENHANCED: Add new item with better data structure
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
        const itemPrice = parseFloat(
          menuItem.finalPrice || menuItem.menuPrice || 0
        );
        const newItem = {
          id: menuItem.id,
          menuName: menuItem.menuName,
          menuCategory: menuItem.menuCategory || "",
          mainCategory: menuItem.mainCategory || "",
          categoryType: menuItem.categoryType || "",
          originalPrice: parseFloat(menuItem.menuPrice || 0),
          finalPrice: itemPrice,
          quantity: 1,
          itemTotal: itemPrice,
          isVeg:
            menuItem.categoryType === "Veg" || menuItem.categoryType === "veg",
          availability: menuItem.availability || "Available",
          imageUrl: menuItem.imageUrl || null,
          // ✅ NEW: Additional fields for better tracking
          addedAt: new Date().toISOString(),
          addedBy: captainInfo?.id || currentUser?.uid,
          isModified: true, // Mark as modified for tracking
        };

        setEditedOrder((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
      }

      setSearchTerm("");

      // Switch to current items tab on mobile after adding
      if (window.innerWidth < 768) {
        setActiveTab("current");
      }
    },
    [editedOrder.items, updateItemQuantity, captainInfo, currentUser]
  );

  // ✅ ENHANCED: Calculate totals with hotel-specific rates
  const totals = useMemo(() => {
    const subtotal = editedOrder.items.reduce(
      (sum, item) => sum + (item.itemTotal || 0),
      0
    );

    // Get rates from hotel settings or use defaults
    const serviceChargeRate = selectedHotel?.serviceCharge || 0.05; // 5%
    const taxRate = selectedHotel?.taxRate || 0.18; // 18% GST

    const serviceCharge = Math.round(subtotal * serviceChargeRate);
    const taxableAmount = subtotal + serviceCharge;
    const tax = Math.round(taxableAmount * taxRate);
    const total = taxableAmount + tax;

    const totalItems = editedOrder.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    return {
      subtotal,
      serviceCharge,
      tax,
      total,
      totalItems,
      serviceChargeRate,
      taxRate,
    };
  }, [editedOrder.items, selectedHotel]);

  // ✅ ENHANCED: Save changes with Firestore integration
  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    setIsLoading(true);
    setConnectionStatus("connecting");

    try {
      // ✅ FIRESTORE: Prepare updated order data
      const updatedOrder = {
        ...editedOrder,
        items: editedOrder.items,

        // Update order details
        orderDetails: {
          ...editedOrder.orderDetails,
          totalItems: totals.totalItems,
          uniqueItems: editedOrder.items.length,
        },

        // Update pricing with hotel-specific rates
        pricing: {
          ...editedOrder.pricing,
          subtotal: totals.subtotal,
          serviceCharge: totals.serviceCharge,
          serviceChargeRate: totals.serviceChargeRate,
          tax: totals.tax,
          taxPercentage: totals.taxRate * 100,
          total: totals.total,
          breakdown: {
            itemsTotal: totals.subtotal,
            serviceCharge: totals.serviceCharge,
            taxableAmount: totals.subtotal + totals.serviceCharge,
            finalAmount: totals.total,
          },
        },

        // Update timestamps and tracking
        updatedAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        modifiedBy: captainInfo?.id || currentUser?.uid,
        modifiedByName:
          captainInfo?.name || captainInfo?.firstName || "Captain",

        // Add to status history
        lifecycle: {
          ...editedOrder.lifecycle,
          statusHistory: [
            ...(editedOrder.lifecycle?.statusHistory || []),
            {
              status: "modified",
              timestamp: serverTimestamp(),
              updatedBy: captainInfo?.id || currentUser?.uid,
              updatedByName:
                captainInfo?.name || captainInfo?.firstName || "Captain",
              note: `Order items modified - ${totals.totalItems} items, ₹${totals.total} total`,
              changes: {
                itemsCount: totals.totalItems,
                totalAmount: totals.total,
                modifiedAt: new Date().toISOString(),
              },
            },
          ],
        },
      };

      // ✅ FIRESTORE: Update order in Firestore
      if (order.id || order.firestoreId) {
        const orderDocRef = doc(db, "orders", order.id || order.firestoreId);
        await updateDoc(orderDocRef, {
          items: updatedOrder.items,
          orderDetails: updatedOrder.orderDetails,
          pricing: updatedOrder.pricing,
          updatedAt: serverTimestamp(),
          lastModified: serverTimestamp(),
          modifiedBy: captainInfo?.id || currentUser?.uid,
          modifiedByName:
            captainInfo?.name || captainInfo?.firstName || "Captain",
          "lifecycle.statusHistory": updatedOrder.lifecycle.statusHistory,
        });
      }

      // ✅ NEW: Update captain stats
      if (captainInfo?.id) {
        try {
          await updateDoc(doc(db, "captains", captainInfo.id), {
            "stats.ordersModified":
              (captainInfo.stats?.ordersModified || 0) + 1,
            lastActivity: serverTimestamp(),
          });
        } catch (updateError) {
          console.warn("Could not update captain stats:", updateError);
        }
      }

      setConnectionStatus("connected");
      toast.success(`Order #${order.orderNumber} updated successfully!`);

      // Call parent save handler
      if (onSave) {
        await onSave(updatedOrder);
      }

      onClose();
    } catch (error) {
      console.error("Error saving order:", error);
      setConnectionStatus("error");

      let errorMessage = "Failed to save order changes";
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to modify this order";
      } else if (error.code === "not-found") {
        errorMessage = "Order not found";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Handle close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full h-full sm:h-auto sm:rounded-xl sm:max-w-4xl sm:max-h-[90vh] overflow-hidden">
        {/* ✅ ENHANCED: Header with connection status */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Edit Order #{order.orderNumber || order.id}
                </h2>
                <ConnectionStatusIndicator />
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>Table {order.tableNumber}</span>
                </div>
                {order.customerName && (
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{order.customerName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{order.status || "received"}</span>
                </div>
              </div>

              {hasUnsavedChanges && (
                <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>You have unsaved changes</span>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full touch-manipulation ml-4"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden mt-4">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("current")}
                className={`flex-1 py-2 px-4 text-center font-medium touch-manipulation ${
                  activeTab === "current"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Current ({editedOrder.items.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("add")}
                className={`flex-1 py-2 px-4 text-center font-medium touch-manipulation ${
                  activeTab === "add"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Items
                </div>
              </button>
            </div>
          </div>

          {/* ✅ NEW: Order summary bar */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="font-medium">{totals.totalItems} items</span>
                <span className="text-gray-600">
                  Subtotal: ₹{totals.subtotal}
                </span>
              </div>
              <div className="font-semibold text-blue-600">
                Total: ₹{totals.total}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row h-[calc(100vh-280px)] sm:h-[calc(90vh-360px)]">
          {/* Current Items */}
          <div
            className={`${
              activeTab === "current" ? "block" : "hidden"
            } md:block flex-1 p-4 sm:p-6 md:border-r md:border-gray-200 overflow-y-auto`}
          >
            <h3 className="text-lg font-semibold mb-4 hidden md:block">
              Current Items
            </h3>

            {editedOrder.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No items in this order</p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="mt-4 md:hidden px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add Items
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {editedOrder.items.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.isModified
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.menuName}
                            {item.isModified && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Modified
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ₹{item.finalPrice || item.originalPrice}
                            {item.menuCategory && (
                              <span className="ml-2 text-xs text-gray-500">
                                {item.menuCategory}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 text-red-600 hover:bg-red-100 rounded touch-manipulation"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold min-w-[32px]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 text-green-600 hover:bg-green-100 rounded touch-manipulation"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right min-w-[60px]">
                        <p className="font-semibold text-sm sm:text-base">
                          ₹{item.itemTotal || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Items */}
          <div
            className={`${
              activeTab === "add" ? "block" : "hidden"
            } md:block flex-1 p-4 sm:p-6 overflow-y-auto`}
          >
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={menuLoading}
                  className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-100"
                />
              </div>

              {menuLoading && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <LoadingSpinner size="xs" />
                  <span>Loading menu items...</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer touch-manipulation active:bg-gray-100"
                  onClick={() => addNewItem(item)}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.menuName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>₹{item.finalPrice || item.menuPrice}</span>
                      {item.menuCategory && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.menuCategory}
                        </span>
                      )}
                      {item.categoryType === "Veg" && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Veg
                        </span>
                      )}
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && !menuLoading && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {searchTerm
                    ? `No items found for "${searchTerm}"`
                    : "No menu items available"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ENHANCED: Footer with totals breakdown */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          {/* Totals breakdown */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <span>Subtotal: ₹{totals.subtotal}</span>
                {totals.serviceCharge > 0 && (
                  <span>Service: ₹{totals.serviceCharge}</span>
                )}
                <span>Tax: ₹{totals.tax}</span>
              </div>
              <div className="font-semibold text-lg">
                Total: ₹{totals.total}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 sm:p-6 flex justify-center">
            <div className="flex flex-row gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  isLoading ||
                  editedOrder.items.length === 0 ||
                  !hasUnsavedChanges
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation font-medium"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {hasUnsavedChanges ? "Save Changes" : "No Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;

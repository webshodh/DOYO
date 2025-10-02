import { default as LoadingSpinner } from "atoms/LoadingSpinner";
import {
  X,
  Package,
  Minus,
  Plus,
  Search,
  AlertCircle,
  Save,
  ShoppingCart,
} from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

// EditOrderModal component
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
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'add'

  // Filter available menu items
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return availableMenuItems.slice(0, 20);
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

  // Add new item (fixed to functional setState for closure safety)
  const addNewItem = useCallback(
    (menuItem) => {
      setEditedOrder((prev) => {
        const existingItemIndex = prev.items.findIndex(
          (item) => item.id === menuItem.id
        );

        if (existingItemIndex !== -1) {
          // Increase quantity of existing item
          const updatedItems = [...prev.items];
          const existing = updatedItems[existingItemIndex];
          const newQuantity = existing.quantity + 1;
          updatedItems[existingItemIndex] = {
            ...existing,
            quantity: newQuantity,
            itemTotal:
              (existing.finalPrice || existing.originalPrice) * newQuantity,
          };
          return { ...prev, items: updatedItems };
        } else {
          // Add new item with quantity 1
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
            itemTotal: parseFloat(
              menuItem.finalPrice || menuItem.menuPrice || 0
            ),
            isVeg:
              menuItem.categoryType === "Veg" ||
              menuItem.categoryType === "veg",
            availability: menuItem.availability || "Available",
          };
          return { ...prev, items: [...prev.items, newItem] };
        }
      });
      setSearchTerm("");
      if (window.innerWidth < 768) {
        setActiveTab("current");
      }
    },
    [setEditedOrder, setSearchTerm, setActiveTab]
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

  // Save handler
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full h-full sm:h-auto sm:rounded-xl sm:max-w-4xl sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Edit Order #{order.orderNumber || order.id}
              </h2>
              <p className="text-gray-600">Table {order.tableNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
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
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] sm:h-[calc(90vh-280px)]">
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
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.menuName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ₹{item.finalPrice || item.originalPrice}
                      </p>
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
                  className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>
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
                    <p className="text-sm text-gray-600">
                      ₹{item.finalPrice || item.menuPrice}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
        <div className="sticky bottom-0 p-2 flex justify-center sm:p-6 border-t border-gray-200 bg-white">
          <div className="flex flex-row gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || editedOrder.items.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation font-medium"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;

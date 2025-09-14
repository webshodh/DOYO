const { default: LoadingSpinner } = require("atoms/LoadingSpinner");
const { X, Package, Minus, Plus, Search, AlertCircle, Save } = require("lucide-react");
const { useState, useMemo, useCallback } = require("react");
const { toast } = require("react-toastify");

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

export default EditOrderModal

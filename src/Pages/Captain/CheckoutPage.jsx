import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, push, set, get, onValue } from "firebase/database";
import { db } from "../../data/firebase/firebaseConfig";
import {
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const CheckoutPage = ({ cartItems, onGoBack, onOrderSuccess }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("preparing"); // preparing, ready, served

  const { hotelName } = useParams();

  // Get next order number on component mount
  useEffect(() => {
    if (hotelName) {
      getNextOrderNumber();
    }
  }, [hotelName]);

  const getNextOrderNumber = async () => {
    setIsLoading(true);
    try {
      const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = snapshot.val();
        const orderNumbers = Object.values(orders).map(
          (order) => order.orderNumber
        );
        const maxOrderNumber = Math.max(...orderNumbers, 0);
        setOrderNumber(maxOrderNumber + 1);
      } else {
        setOrderNumber(1);
      }
    } catch (error) {
      console.error("Error getting next order number:", error);
      setOrderNumber(1);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.finalPrice || item.menuPrice) * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTaxAmount = () => {
    return Math.round(getTotalAmount() * 0.18);
  };

  const getFinalTotal = () => {
    return getTotalAmount() + getTaxAmount();
  };

  const validateTableNumber = () => {
    if (!tableNumber.trim()) {
      setError("Please enter a table number");
      return false;
    }
    if (isNaN(tableNumber) || parseInt(tableNumber) <= 0) {
      setError("Please enter a valid table number");
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    setError("");

    if (!validateTableNumber()) {
      return;
    }

    if (cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order object with comprehensive data
      const orderData = {
        orderNumber: orderNumber,
        tableNumber: parseInt(tableNumber),
        status: orderStatus,
        items: cartItems.map((item) => ({
          id: item.id,
          menuName: item.menuName,
          menuCategory: item.menuCategory || "",
          mainCategory: item.mainCategory || "",
          categoryType: item.categoryType || "",
          originalPrice: item.menuPrice || 0,
          finalPrice: item.finalPrice || item.menuPrice || 0,
          discount: item.discount || 0,
          quantity: item.quantity,
          itemTotal: (item.finalPrice || item.menuPrice || 0) * item.quantity,
          // Include special category flags
          isVeg: item.categoryType === "Veg" || item.categoryType === "veg",
          isSpicy: item.isSpicy || false,
          isRecommended: item.isRecommended || false,
          isPopular: item.isPopular || false,
          isBestseller: item.isBestseller || false,
          availability: item.availability || "Available",
        })),
        pricing: {
          subtotal: getTotalAmount(),
          tax: getTaxAmount(),
          taxPercentage: 18,
          total: getFinalTotal(),
        },
        orderDetails: {
          totalItems: getTotalItems(),
          totalQuantity: getTotalItems(),
          uniqueItems: cartItems.length,
        },
        timestamps: {
          orderPlaced: new Date().toISOString(),
          orderPlacedLocal: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          estimatedReady: new Date(Date.now() + 20 * 60000).toISOString(), // 20 minutes from now
          orderDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
          orderTime: new Date().toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: false,
          }),
        },
        customerInfo: {
          tableNumber: parseInt(tableNumber),
          orderType: "dine-in",
          servingStatus: "pending", // pending, served, completed
        },
        orderSummary: {
          vegItems: cartItems.filter(
            (item) => item.categoryType === "Veg" || item.categoryType === "veg"
          ).length,
          nonVegItems: cartItems.filter(
            (item) => item.categoryType !== "Veg" && item.categoryType !== "veg"
          ).length,
          categories: [
            ...new Set(
              cartItems.map(
                (item) => item.menuCategory || item.mainCategory || "Other"
              )
            ),
          ],
          specialItems: cartItems.filter(
            (item) => item.isRecommended || item.isPopular || item.isBestseller
          ).length,
        },
        kitchen: {
          status: "received", // received, preparing, ready
          priority: "normal", // normal, high, urgent
          preparationTime: 20, // minutes
          specialInstructions: "",
          assignedChef: "",
        },
        metadata: {
          hotelName: hotelName,
          version: "1.0",
          source: "captain_app",
          deviceInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          },
        },
      };

      // Add order to Firebase
      const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, orderData);

      // Show success and call callback
      onOrderSuccess({
        orderNumber: orderNumber,
        tableNumber: parseInt(tableNumber),
        total: getFinalTotal(),
        items: getTotalItems(),
      });
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Add some items to proceed with checkout
          </p>
          <button
            onClick={onGoBack}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onGoBack}
              className="text-orange-600 hover:text-orange-800 p-1"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
          </div>

          {/* Order Number Display */}
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-orange-800">
                Order Number:
              </span>
              <span className="text-lg font-bold text-orange-600">
                {isLoading ? "Loading..." : `#${orderNumber}`}
              </span>
            </div>
          </div>
        </div>

        {/* Table Number Input */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Table Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Number *
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                min="1"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>

          {/* Items List */}
          <div className="space-y-3 mb-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {item.menuName}
                    </span>
                    {item.categoryType === "Veg" ||
                    item.categoryType === "veg" ? (
                      <div className="w-3 h-3 border-2 border-green-500 bg-white rounded-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-3 h-3 border-2 border-red-500 bg-white rounded-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>₹{item.finalPrice || item.menuPrice}</span>
                    <span>×</span>
                    <span>{item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-800">
                    ₹{(item.finalPrice || item.menuPrice) * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({getTotalItems()} items)</span>
              <span>₹{getTotalAmount()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax & Charges (18%)</span>
              <span>₹{getTaxAmount()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
              <span>Total Amount</span>
              <span>₹{getFinalTotal()}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Place Order - ₹{getFinalTotal()}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            By placing this order, you confirm the items and table number are
            correct.
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-blue-600 mt-0.5 flex-shrink-0"
            />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Order Information:</p>
              <ul className="space-y-1 text-xs">
                <li>• Estimated preparation time: 15-25 minutes</li>
                <li>• Your order will be prepared fresh</li>
                <li>• Please ensure table number is correct</li>
                <li>• Order cannot be modified after submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

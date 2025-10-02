// pages/CheckoutPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, push, set, get } from "firebase/database";
import { rtdb } from "../../services/firebase/firebaseConfig";
import { toast } from "react-toastify";
import EmptyCartMessage from "atoms/Messages/EmptyCartMessage";
import CheckoutHeader from "atoms/Headers/CheckoutHeader";
import OrderNumberDisplay from "atoms/OrderNumberDisplay";
import TableNumberInput from "atoms/TableNumberInput";
import OrderSummary from "components/order-dashboard/OrderSummary";
import PlaceOrderButton from "atoms/Buttons/PlaceOrderButton";
import OrderInfoAlert from "atoms/Messages/OrderInfoAlert";

const CheckoutPage = ({ cartItems, onGoBack, onOrderSuccess }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("received");

  const { hotelName } = useParams();
  const navigate = useNavigate();

  // Get next order number on component mount
  useEffect(() => {
    if (hotelName) {
      getNextOrderNumber();
    }
  }, [hotelName]);

  const getNextOrderNumber = useCallback(async () => {
    setIsLoading(true);
    try {
      const ordersRef = ref(rtdb, `/hotels/${hotelName}/orders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = snapshot.val();
        const orderNumbers = Object.values(orders)
          .map((order) => order.orderNumber || 0)
          .filter((num) => typeof num === "number");
        const maxOrderNumber =
          orderNumbers.length > 0 ? Math.max(...orderNumbers) : 0;
        setOrderNumber(maxOrderNumber + 1);
      } else {
        setOrderNumber(1);
      }
    } catch (error) {
      console.error("Error getting next order number:", error);
      setOrderNumber(Math.floor(Date.now() / 1000) % 10000); // Fallback unique number
    } finally {
      setIsLoading(false);
    }
  }, [hotelName]);

  const getTotalAmount = useCallback(() => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.finalPrice || item.menuPrice) * item.quantity,
      0
    );
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getTaxAmount = useCallback(() => {
    return Math.round(getTotalAmount() * 0.18);
  }, [getTotalAmount]);

  const getFinalTotal = useCallback(() => {
    return getTotalAmount() + getTaxAmount();
  }, [getTotalAmount, getTaxAmount]);

  const validateTableNumber = useCallback(() => {
    if (!tableNumber.trim()) {
      setError("Please enter a table number");
      return false;
    }
    if (isNaN(tableNumber) || parseInt(tableNumber) <= 0) {
      setError("Please enter a valid table number");
      return false;
    }
    return true;
  }, [tableNumber]);

  const generateOrderId = useCallback(() => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleSubmitOrder = useCallback(async () => {
    setError("");

    if (!validateTableNumber()) {
      return;
    }

    if (cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }

    if (!orderNumber) {
      setError("Order number not generated. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = generateOrderId();
      const currentTime = new Date();
      const estimatedReadyTime = new Date(currentTime.getTime() + 25 * 60000); // 25 minutes from now

      // Create comprehensive order object
      const orderData = {
        // Basic order info
        orderNumber: orderNumber,
        tableNumber: parseInt(tableNumber),
        status: orderStatus,
        orderId: orderId,

        // Items with detailed information
        items: cartItems.map((item) => ({
          id: item.id,
          menuName: item.menuName,
          menuCategory: item.menuCategory || "",
          mainCategory: item.mainCategory || "",
          categoryType: item.categoryType || "",
          originalPrice: parseFloat(item.menuPrice || 0),
          finalPrice: parseFloat(item.finalPrice || item.menuPrice || 0),
          discount: parseFloat(item.discount || 0),
          quantity: parseInt(item.quantity),
          itemTotal:
            parseFloat(item.finalPrice || item.menuPrice || 0) *
            parseInt(item.quantity),
          isVeg: item.categoryType === "Veg" || item.categoryType === "veg",
          isSpicy: Boolean(item.isSpicy),
          isRecommended: Boolean(item.isRecommended),
          isPopular: Boolean(item.isPopular),
          isBestseller: Boolean(item.isBestseller),
          availability: item.availability || "Available",
          specialAttributes: {
            spicy: Boolean(item.isSpicy),
            recommended: Boolean(item.isRecommended),
            popular: Boolean(item.isPopular),
            bestseller: Boolean(item.isBestseller),
          },
        })),

        // Pricing breakdown
        pricing: {
          subtotal: getTotalAmount(),
          tax: getTaxAmount(),
          taxPercentage: 18,
          total: getFinalTotal(),
          currency: "INR",
        },

        // Order summary details
        orderDetails: {
          totalItems: getTotalItems(),
          totalQuantity: getTotalItems(),
          uniqueItems: cartItems.length,
          averageItemPrice: Math.round(getTotalAmount() / getTotalItems()),
        },

        // Comprehensive timestamps
        timestamps: {
          orderPlaced: currentTime.toISOString(),
          orderPlacedLocal: currentTime.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          estimatedReady: estimatedReadyTime.toISOString(),
          estimatedReadyLocal: estimatedReadyTime.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          }),
          orderDate: currentTime.toISOString().split("T")[0],
          orderTime: currentTime.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: true,
          }),
          dayOfWeek: currentTime.toLocaleDateString("en-IN", {
            weekday: "long",
          }),
        },

        // Customer and service information
        customerInfo: {
          tableNumber: parseInt(tableNumber),
          orderType: "dine-in",
          servingStatus: "pending",
          guestCount: null,
          specialRequests: "",
        },

        // Order categorization and summary
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
          spicyItems: cartItems.filter((item) => item.isSpicy).length,
        },

        // Kitchen management
        kitchen: {
          status: "received",
          priority: "normal",
          preparationTime: 25,
          estimatedCompletionTime: estimatedReadyTime.toISOString(),
          specialInstructions: "",
          assignedChef: "",
          cookingStartTime: null,
          readyTime: null,
        },

        // Payment and billing
        billing: {
          paymentStatus: "pending",
          paymentMethod: null,
          billGenerated: false,
          paidAmount: 0,
          changeAmount: 0,
        },

        // Tracking and analytics
        tracking: {
          orderSource: "captain_app",
          deviceInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            platform: "web",
          },
          captainId: null, // Add captain ID when available
          sessionId: null,
        },

        // Order lifecycle
        lifecycle: {
          created: currentTime.toISOString(),
          lastUpdated: currentTime.toISOString(),
          statusHistory: [
            {
              status: "received",
              timestamp: currentTime.toISOString(),
              note: "Order placed by captain",
            },
          ],
        },

        // Metadata
        metadata: {
          hotelName: hotelName,
          version: "2.0",
          source: "captain_app",
          orderFormat: "dine_in",
          systemGenerated: {
            orderNumber: true,
            timestamps: true,
            pricing: true,
          },
        },
      };

      // Add order to Firebase
      const ordersRef = ref(rtdb, `/hotels/${hotelName}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, orderData);

      // Also store the order ID in the order data for easier reference
      await set(
        ref(rtdb, `/hotels/${hotelName}/orders/${newOrderRef.key}/firebaseId`),
        newOrderRef.key
      );

      // Show success toast
      toast.success(`Order #${orderNumber} placed successfully!`);

      // Call success callback with comprehensive data
      onOrderSuccess({
        orderNumber: orderNumber,
        orderId: orderId,
        firebaseId: newOrderRef.key,
        tableNumber: parseInt(tableNumber),
        total: getFinalTotal(),
        items: getTotalItems(),
        estimatedTime: estimatedReadyTime.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: orderStatus,
        orderData: orderData,
      });
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
      toast.error(
        "Failed to place order. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateTableNumber,
    cartItems,
    orderNumber,
    orderStatus,
    tableNumber,
    hotelName,
    generateOrderId,
    getTotalAmount,
    getTotalItems,
    getTaxAmount,
    getFinalTotal,
    onOrderSuccess,
  ]);

  // Show empty cart message if no items
  if (cartItems.length === 0) {
    return <EmptyCartMessage onGoBack={onGoBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header with Order Number */}
        <div>
          <CheckoutHeader onGoBack={onGoBack} />
          <OrderNumberDisplay orderNumber={orderNumber} isLoading={isLoading} />
        </div>

        {/* Table Number Input */}
        <TableNumberInput
          tableNumber={tableNumber}
          onTableNumberChange={setTableNumber}
          error={error}
        />

        {/* Order Summary */}
        <OrderSummary
          cartItems={cartItems}
          subtotal={getTotalAmount()}
          totalItems={getTotalItems()}
          taxAmount={getTaxAmount()}
          taxPercentage={18}
          finalTotal={getFinalTotal()}
          // grandTotal={cartCalculations.grandTotal}
          isCheckout={true}
        />

        {/* Place Order Button */}
        <PlaceOrderButton
          onSubmit={handleSubmitOrder}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          finalTotal={getFinalTotal()}
        />

        {/* Order Information Alert */}
        <OrderInfoAlert />
      </div>
    </div>
  );
};

export default CheckoutPage;

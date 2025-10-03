import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, push, set, get } from "firebase/database";
import { rtdb } from "../../services/firebase/firebaseConfig";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import EmptyCartMessage from "atoms/Messages/EmptyCartMessage";
import CheckoutHeader from "atoms/Headers/CheckoutHeader";
import OrderNumberDisplay from "atoms/OrderNumberDisplay";
import TableNumberInput from "atoms/TableNumberInput";
import OrderSummary from "components/order-dashboard/OrderSummary";
import PlaceOrderButton from "atoms/Buttons/PlaceOrderButton";
import OrderInfoAlert from "atoms/Messages/OrderInfoAlert";

const firestore = getFirestore();

const CheckoutPage = ({ cartItems, onGoBack, onOrderSuccess }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [orderNumber, setOrderNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("received");

  const { hotelName } = useParams();
  const navigate = useNavigate();

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
        const maxOrderNumber = orderNumbers.length
          ? Math.max(...orderNumbers)
          : 0;
        setOrderNumber(maxOrderNumber + 1);
      } else {
        setOrderNumber(1);
      }
    } catch (error) {
      console.error("Error getting next order number:", error);
      setOrderNumber(Math.floor(Date.now() / 1000) % 10000);
    } finally {
      setIsLoading(false);
    }
  }, [hotelName]);

  const getTotalAmount = useCallback(() => {
    return cartItems.reduce(
      (total, item) =>
        total + (item.finalPrice || item.menuPrice) * item.quantity,
      0,
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

  const validateCustomerInfo = useCallback(() => {
    if (!customerName.trim()) {
      setError("Please enter customer name");
      return false;
    }
    if (!customerMobile.trim()) {
      setError("Please enter customer mobile number");
      return false;
    }
    // Basic mobile number validation (10 digits)
    if (!/^\d{10}$/.test(customerMobile.trim())) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  }, [customerName, customerMobile]);

  const generateOrderId = useCallback(() => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleSubmitOrder = useCallback(async () => {
    setError("");

    if (!validateTableNumber()) return;
    if (!validateCustomerInfo()) return;

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
      const estimatedReadyTime = new Date(currentTime.getTime() + 25 * 60000);

      const orderData = {
        orderNumber,
        tableNumber: parseInt(tableNumber),
        status: orderStatus,
        orderId,

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

        pricing: {
          subtotal: getTotalAmount(),
          tax: getTaxAmount(),
          taxPercentage: 18,
          total: getFinalTotal(),
          currency: "INR",
        },

        orderDetails: {
          totalItems: getTotalItems(),
          totalQuantity: getTotalItems(),
          uniqueItems: cartItems.length,
          averageItemPrice: Math.round(getTotalAmount() / getTotalItems()),
        },

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

        customerInfo: {
          name: customerName.trim(),
          mobile: customerMobile.trim(),
          tableNumber: parseInt(tableNumber),
          orderType: "dine-in",
          servingStatus: "pending",
          guestCount: null,
          specialRequests: "",
        },

        orderSummary: {
          vegItems: cartItems.filter(
            (item) =>
              item.categoryType === "Veg" || item.categoryType === "veg",
          ).length,
          nonVegItems: cartItems.filter(
            (item) =>
              item.categoryType !== "Veg" && item.categoryType !== "veg",
          ).length,
          categories: [
            ...new Set(
              cartItems.map(
                (item) => item.menuCategory || item.mainCategory || "Other",
              ),
            ),
          ],
          specialItems: cartItems.filter(
            (item) => item.isRecommended || item.isPopular || item.isBestseller,
          ).length,
          spicyItems: cartItems.filter((item) => item.isSpicy).length,
        },

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

        billing: {
          paymentStatus: "pending",
          paymentMethod: null,
          billGenerated: false,
          paidAmount: 0,
          changeAmount: 0,
        },

        tracking: {
          orderSource: "captain_app",
          deviceInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            platform: "web",
          },
          captainId: null,
          sessionId: null,
        },

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

      // Save order to Realtime Database
      const ordersRef = ref(rtdb, `/hotels/${hotelName}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, orderData);

      // Save firebaseId inside order for reference
      await set(
        ref(rtdb, `/hotels/${hotelName}/orders/${newOrderRef.key}/firebaseId`),
        newOrderRef.key,
      );

      // Save customer info to Firestore customers collection
      const customerDocRef = doc(
        collection(firestore, "customers"),
        newOrderRef.key,
      );
      await setDoc(customerDocRef, {
        name: customerName.trim(),
        mobile: customerMobile.trim(),
        lastOrderDate: serverTimestamp(),
        lastOrderAmount: getFinalTotal(),
        orderId: newOrderRef.key,
        hotelName,
      });

      toast.success(`Order #${orderNumber} placed successfully!`);

      onOrderSuccess({
        orderNumber,
        orderId,
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
        orderData,
      });
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
      toast.error(
        "Failed to place order. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateTableNumber,
    validateCustomerInfo,
    cartItems,
    orderNumber,
    orderStatus,
    tableNumber,
    customerName,
    customerMobile,
    hotelName,
    generateOrderId,
    getTotalAmount,
    getTotalItems,
    getTaxAmount,
    getFinalTotal,
    onOrderSuccess,
  ]);

  if (cartItems.length === 0) {
    return <EmptyCartMessage onGoBack={onGoBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <CheckoutHeader onGoBack={onGoBack} />
        <OrderNumberDisplay orderNumber={orderNumber} isLoading={isLoading} />

        {/* Table Number Input */}
        <TableNumberInput
          tableNumber={tableNumber}
          onTableNumberChange={setTableNumber}
          error={error}
        />

        {/* Customer Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Customer Mobile Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
            placeholder="Enter 10-digit mobile number"
            className="w-full border border-gray-300 rounded-md p-2"
            maxLength={10}
          />
        </div>

        {/* Order Summary */}
        <OrderSummary
          cartItems={cartItems}
          subtotal={getTotalAmount()}
          totalItems={getTotalItems()}
          taxAmount={getTaxAmount()}
          taxPercentage={18}
          finalTotal={getFinalTotal()}
          isCheckout={true}
        />

        {/* Place Order Button */}
        <PlaceOrderButton
          onSubmit={handleSubmitOrder}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          finalTotal={getFinalTotal()}
        />

        <OrderInfoAlert />
      </div>
    </div>
  );
};

export default CheckoutPage;

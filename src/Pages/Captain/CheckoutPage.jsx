// pages/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, push, set, get } from "firebase/database";
import { db } from "../../data/firebase/firebaseConfig";
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
  const [orderStatus, setOrderStatus] = useState("preparing");

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
          estimatedReady: new Date(Date.now() + 20 * 60000).toISOString(),
          orderDate: new Date().toISOString().split("T")[0],
          orderTime: new Date().toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour12: false,
          }),
        },
        customerInfo: {
          tableNumber: parseInt(tableNumber),
          orderType: "dine-in",
          servingStatus: "pending",
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
          status: "received",
          priority: "normal",
          preparationTime: 20,
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

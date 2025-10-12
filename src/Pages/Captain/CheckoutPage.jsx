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
import TableNumberInput from "components/Forms/FormInput";
import OrderSummary from "components/Dashboard/OrderSummary";
import PlaceOrderButton from "atoms/Buttons/PlaceOrderButton";
import OrderInfoAlert from "atoms/Messages/OrderInfoAlert";
import FormSelect from "components/Forms/FormSelect";
import FormInput from "components/Forms/FormInput";

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

  // Enhanced order fields
  const [orderType, setOrderType] = useState("dine-in");
  const [instructions, setInstructions] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPlatform, setDeliveryPlatform] = useState("");
  const [orderPriority, setOrderPriority] = useState("normal");
  const [paymentMethod, setPaymentMethod] = useState("pending");
  const [customerEmail, setCustomerEmail] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [occasionType, setOccasionType] = useState("");

  const { hotelName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (hotelName) {
      getNextOrderNumber();
    }
  }, [hotelName]);

  // Delivery platform options based on Indian market
  const deliveryPlatforms = [
    { label: "Direct Order", value: "direct" },
    { label: "Swiggy", value: "swiggy" },
    { label: "Zomato", value: "zomato" },
    { label: "Uber Eats", value: "uber-eats" },
    { label: "Dunzo", value: "dunzo" },
    { label: "Shadowfax", value: "shadowfax" },
    { label: "BigBasket (BB Daily)", value: "bigbasket" },
    { label: "Amazon Food", value: "amazon-food" },
    { label: "Foodpanda", value: "foodpanda" },
    { label: "Magic Pin", value: "magicpin" },
    { label: "Thrive", value: "thrive" },
    { label: "EatSure", value: "eatsure" },
    { label: "ONDC Network", value: "ondc" },
    { label: "PhonePe", value: "phonepe" },
    { label: "Paytm", value: "paytm" },
    { label: "Other", value: "other" },
  ];

  const orderPriorityOptions = [
    { label: "Normal", value: "normal" },
    { label: "High Priority", value: "high" },
    { label: "Express", value: "express" },
    { label: "VIP Customer", value: "vip" },
  ];

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

  const validateForm = useCallback(() => {
    setError("");

    // Basic validations
    if (!customerName.trim()) {
      setError("Please enter customer name");
      return false;
    }

    if (!customerMobile.trim()) {
      setError("Please enter customer mobile number");
      return false;
    }

    if (!/^\d{10}$/.test(customerMobile.trim())) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    // Order type specific validations
    if (orderType === "dine-in") {
      if (!tableNumber.trim()) {
        setError("Please enter a table number for dine-in orders");
        return false;
      }
      if (isNaN(tableNumber) || parseInt(tableNumber) <= 0) {
        setError("Please enter a valid table number");
        return false;
      }
    }

    if (orderType === "delivery") {
      if (!deliveryPlatform) {
        setError("Please select delivery platform");
        return false;
      }
    }

    return true;
  }, [
    customerName,
    customerMobile,
    orderType,
    tableNumber,
    deliveryAddress,
    deliveryPlatform,
    customerEmail,
    alternatePhone,
  ]);

  const generateOrderId = useCallback(() => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleSubmitOrder = useCallback(async () => {
    if (!validateForm()) return;

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
        tableNumber: orderType === "dine-in" ? parseInt(tableNumber) : null,
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
          orderType: orderType,
          priority: orderPriority,
          occasionType: occasionType || null,
          specialInstructions: instructions.trim() || null,
          guestCount: guestCount ? parseInt(guestCount) : null,
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
          email: customerEmail.trim() || null,
          alternatePhone: alternatePhone.trim() || null,
          tableNumber: orderType === "dine-in" ? parseInt(tableNumber) : null,
          orderType: orderType,
          servingStatus: "pending",
          guestCount: guestCount ? parseInt(guestCount) : null,
          specialRequests: instructions.trim() || null,
          customerType: "walk-in", // Can be enhanced to track regular/new customers
          loyaltyPoints: 0, // Can be integrated with loyalty system
        },

        // Enhanced delivery information
        deliveryInfo:
          orderType === "delivery"
            ? {
                address: deliveryAddress.trim(),
                landmark: landmark.trim() || null,
                deliveryInstructions: deliveryInstructions.trim() || null,
                platform: deliveryPlatform,
                platformOrderId: null, // To be filled when order comes from platform
                deliveryFee: 0, // Can be calculated based on distance
                estimatedDeliveryTime: new Date(
                  currentTime.getTime() + 45 * 60000
                ).toISOString(),
                deliveryStatus: "pending",
                assignedDriver: null,
                driverPhone: null,
                trackingId: null,
              }
            : null,

        // Platform tracking for analytics
        platformTracking: {
          orderSource: deliveryPlatform || "direct",
          platformName: deliveryPlatform
            ? deliveryPlatforms.find((p) => p.value === deliveryPlatform)?.label
            : "Direct Order",
          isAggregatorOrder: deliveryPlatform && deliveryPlatform !== "direct",
          platformCommission:
            deliveryPlatform && deliveryPlatform !== "direct"
              ? getTotalAmount() * 0.2
              : 0, // Typical 20% commission
          netRevenue:
            deliveryPlatform && deliveryPlatform !== "direct"
              ? getTotalAmount() * 0.8
              : getTotalAmount(),
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
          spicyItems: cartItems.filter((item) => item.isSpicy).length,
        },

        kitchen: {
          status: "received",
          priority: orderPriority,
          preparationTime: 25,
          estimatedCompletionTime: estimatedReadyTime.toISOString(),
          specialInstructions: instructions.trim() || "",
          assignedChef: "",
          cookingStartTime: null,
          readyTime: null,
          kitchenNotes: "",
        },

        billing: {
          paymentStatus: paymentMethod === "pending" ? "pending" : "paid",
          paymentMethod: paymentMethod,
          billGenerated: false,
          paidAmount: paymentMethod !== "pending" ? getFinalTotal() : 0,
          changeAmount: 0,
          discount: 0,
          couponCode: null,
          loyaltyPointsUsed: 0,
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
          ipAddress: null, // Can be captured if needed
        },

        lifecycle: {
          created: currentTime.toISOString(),
          lastUpdated: currentTime.toISOString(),
          statusHistory: [
            {
              status: "received",
              timestamp: currentTime.toISOString(),
              note: `Order placed by captain - ${orderType}`,
              updatedBy: "captain_app",
            },
          ],
        },

        // Analytics and reporting data
        analytics: {
          orderValue: getFinalTotal(),
          itemCount: getTotalItems(),
          averageItemPrice: Math.round(getTotalAmount() / getTotalItems()),
          orderChannel: deliveryPlatform || "direct",
          customerSegment: "walk-in",
          peakHourOrder: isBusinessHour(),
          weekendOrder: isWeekend(),
          festivalOrder: occasionType === "festival",
          repeatCustomer: false, // Can be enhanced to check customer history
        },

        metadata: {
          hotelName: hotelName,
          version: "3.0",
          source: "captain_app_enhanced",
          orderFormat: orderType,
          systemGenerated: {
            orderNumber: true,
            timestamps: true,
            pricing: true,
            analytics: true,
          },
          lastModified: currentTime.toISOString(),
          createdBy: "captain",
        },
      };

      // Save order to Realtime Database
      const ordersRef = ref(rtdb, `/hotels/${hotelName}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, orderData);

      // Save firebaseId inside order for reference
      await set(
        ref(rtdb, `/hotels/${hotelName}/orders/${newOrderRef.key}/firebaseId`),
        newOrderRef.key
      );

      // Enhanced customer info save to Firestore
      const customerDocRef = doc(
        collection(firestore, "customers"),
        newOrderRef.key
      );
      await setDoc(customerDocRef, {
        name: customerName.trim(),
        mobile: customerMobile.trim(),
        email: customerEmail.trim() || null,
        alternatePhone: alternatePhone.trim() || null,
        lastOrderDate: serverTimestamp(),
        lastOrderAmount: getFinalTotal(),
        orderId: newOrderRef.key,
        hotelName,
        orderType: orderType,
        preferredPlatform: deliveryPlatform || "direct",
        totalOrders: 1, // Can be enhanced to increment
        totalSpent: getFinalTotal(),
        avgOrderValue: getFinalTotal(),
        lastDeliveryAddress:
          orderType === "delivery" ? deliveryAddress.trim() : null,
        customerTags: [orderType, deliveryPlatform || "direct"].filter(Boolean),
        createdAt: serverTimestamp(),
      });

      // Store platform analytics separately for better reporting
      if (deliveryPlatform && deliveryPlatform !== "direct") {
        const platformAnalyticsRef = ref(
          rtdb,
          `/hotels/${hotelName}/platformAnalytics/${
            currentTime.toISOString().split("T")[0]
          }/${deliveryPlatform}`
        );
        const analyticsSnapshot = await get(platformAnalyticsRef);
        const currentStats = analyticsSnapshot.exists()
          ? analyticsSnapshot.val()
          : {
              orderCount: 0,
              totalRevenue: 0,
              totalCommission: 0,
              netRevenue: 0,
            };

        await set(platformAnalyticsRef, {
          orderCount: currentStats.orderCount + 1,
          totalRevenue: currentStats.totalRevenue + getTotalAmount(),
          totalCommission:
            currentStats.totalCommission + getTotalAmount() * 0.2,
          netRevenue: currentStats.netRevenue + getTotalAmount() * 0.8,
          lastUpdated: currentTime.toISOString(),
          platformName: deliveryPlatforms.find(
            (p) => p.value === deliveryPlatform
          )?.label,
        });
      }

      toast.success(`Order #${orderNumber} placed successfully!`);

      onOrderSuccess({
        orderNumber,
        orderId,
        firebaseId: newOrderRef.key,
        tableNumber: orderType === "dine-in" ? parseInt(tableNumber) : null,
        total: getFinalTotal(),
        items: getTotalItems(),
        estimatedTime: estimatedReadyTime.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: orderStatus,
        orderType: orderType,
        customerName: customerName.trim(),
        platform: deliveryPlatform || "direct",
        orderData,
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
    validateForm,
    cartItems,
    orderNumber,
    orderStatus,
    tableNumber,
    customerName,
    customerMobile,
    customerEmail,
    alternatePhone,
    orderType,
    instructions,
    guestCount,
    deliveryAddress,
    deliveryPlatform,
    orderPriority,
    paymentMethod,
    landmark,
    deliveryInstructions,
    occasionType,
    hotelName,
    generateOrderId,
    getTotalAmount,
    getTotalItems,
    getTaxAmount,
    getFinalTotal,
    onOrderSuccess,
    deliveryPlatforms,
  ]);

  // Helper functions
  const isBusinessHour = () => {
    const hour = new Date().getHours();
    return (hour >= 11 && hour <= 14) || (hour >= 19 && hour <= 22);
  };

  const isWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  if (cartItems.length === 0) {
    return <EmptyCartMessage onGoBack={onGoBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <CheckoutHeader onGoBack={onGoBack} />
        <OrderNumberDisplay orderNumber={orderNumber} isLoading={isLoading} />

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Customer Name"
              type="text"
              value={customerName}
              onChange={setCustomerName}
              placeholder="Enter customer name"
            />

            <FormInput
              label="Mobile Number"
              type="tel"
              value={customerMobile}
              onChange={setCustomerMobile}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Order Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Order Type"
              value={orderType}
              onChange={setOrderType}
              options={[
                { label: "Dine In", value: "dine-in" },
                { label: "Take Away", value: "takeaway" },
                { label: "Delivery", value: "delivery" },
              ]}
              required
            />

            {/* <FormSelect
              label="Order Priority"
              value={orderPriority}
              onChange={setOrderPriority}
              options={orderPriorityOptions}
            /> */}

            {orderType === "dine-in" && (
              <>
                <FormInput
                  label="Table Number"
                  type="number"
                  value={tableNumber}
                  onChange={setTableNumber}
                  placeholder="Enter table number"
                  required
                  min={1}
                />
              </>
            )}
          </div>

          <FormInput
            label="Special Instructions"
            type="text"
            value={instructions}
            onChange={setInstructions}
            placeholder="Add instructions (optional)"
          />
        </div>

        {/* Delivery Information - Show only when order type is delivery */}
        {orderType === "delivery" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Delivery Information
            </h3>

            <FormSelect
              label="Delivery Platform"
              value={deliveryPlatform}
              onChange={setDeliveryPlatform}
              options={deliveryPlatforms}
              required
            />
          </div>
        )}

        {/* Order Summary */}
        <OrderSummary
          cartItems={cartItems}
          subtotal={getTotalAmount()}
          totalItems={getTotalItems()}
          taxAmount={getTaxAmount()}
          taxPercentage={18}
          finalTotal={getFinalTotal()}
          isCheckout={true}
          orderType={orderType}
          deliveryPlatform={deliveryPlatform}
        />

        {/* Place Order Button */}
        <PlaceOrderButton
          onSubmit={handleSubmitOrder}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          finalTotal={getFinalTotal()}
          orderType={orderType}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <OrderInfoAlert />
      </div>
    </div>
  );
};

export default CheckoutPage;

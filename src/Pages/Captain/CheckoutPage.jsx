// src/Pages/Captain/CheckoutPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  limit
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { toast } from "react-toastify";

// ✅ NEW: Import context hooks
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

// Components
import EmptyCartMessage from "atoms/Messages/EmptyCartMessage";
import CheckoutHeader from "atoms/Headers/CheckoutHeader";
import OrderNumberDisplay from "atoms/OrderNumberDisplay";
import TableNumberInput from "atoms/TableNumberInput";
import OrderSummary from "components/order-dashboard/OrderSummary";
import PlaceOrderButton from "atoms/Buttons/PlaceOrderButton";
import OrderInfoAlert from "atoms/Messages/OrderInfoAlert";
import LoadingSpinner from "../../atoms/LoadingSpinner";

// ✅ NEW: Enhanced customer info component
// import CustomerInfoSection from "components/checkout/CustomerInfoSection";
// import OrderConfirmationModal from "components/modals/OrderConfirmationModal";

const CheckoutPage = ({ cartItems, onGoBack, onOrderSuccess }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("received");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [captainInfo, setCaptainInfo] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    specialInstructions: ''
  });
  const [tableSessionId, setTableSessionId] = useState(null);

  const { hotelName } = useParams();
  const navigate = useNavigate();

  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // ✅ NEW: Get hotel ID for Firestore queries
  const hotelId = useMemo(() => {
    return selectedHotel?.id || hotelName;
  }, [selectedHotel, hotelName]);

  // ✅ NEW: Load captain information
  useEffect(() => {
    const loadCaptainInfo = async () => {
      if (!currentUser?.uid) return;

      try {
        const captainDoc = await getDoc(doc(db, 'captains', currentUser.uid));
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
  }, [currentUser]);

  // ✅ ENHANCED: Get next order number from Firestore
  useEffect(() => {
    if (hotelId) {
      getNextOrderNumber();
    }
  }, [hotelId]);

  const getNextOrderNumber = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✅ FIRESTORE: Query orders collection for this hotel
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('hotelId', '==', hotelId),
        orderBy('orderNumber', 'desc'),
        limit(1)
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      
      let nextOrderNumber = 1;
      if (!ordersSnapshot.empty) {
        const lastOrder = ordersSnapshot.docs[0].data();
        nextOrderNumber = (lastOrder.orderNumber || 0) + 1;
      }

      setOrderNumber(nextOrderNumber);
    } catch (error) {
      console.error("Error getting next order number:", error);
      // Fallback: generate unique number based on timestamp
      setOrderNumber(Math.floor(Date.now() / 1000) % 10000);
    } finally {
      setIsLoading(false);
    }
  }, [hotelId]);

  // ✅ NEW: Check for existing table session
  useEffect(() => {
    const checkTableSession = async () => {
      if (!tableNumber || !hotelId) return;

      try {
        const sessionsRef = collection(db, 'tableSessions');
        const sessionQuery = query(
          sessionsRef,
          where('hotelId', '==', hotelId),
          where('tableNumber', '==', parseInt(tableNumber)),
          where('status', '==', 'active')
        );

        const sessionSnapshot = await getDocs(sessionQuery);
        if (!sessionSnapshot.empty) {
          setTableSessionId(sessionSnapshot.docs[0].id);
        } else {
          setTableSessionId(null);
        }
      } catch (error) {
        console.warn("Error checking table session:", error);
      }
    };

    if (tableNumber) {
      checkTableSession();
    }
  }, [tableNumber, hotelId]);

  // ✅ ENHANCED: Calculate totals with hotel-specific rates
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

  // ✅ NEW: Get tax and service charge rates from hotel settings
  const getServiceCharge = useCallback(() => {
    const serviceChargeRate = selectedHotel?.serviceCharge || 0.05; // 5%
    return Math.round(getTotalAmount() * serviceChargeRate);
  }, [getTotalAmount, selectedHotel]);

  const getTaxAmount = useCallback(() => {
    const taxRate = selectedHotel?.taxRate || 0.18; // 18% GST
    const taxableAmount = getTotalAmount() + getServiceCharge();
    return Math.round(taxableAmount * taxRate);
  }, [getTotalAmount, getServiceCharge, selectedHotel]);

  const getFinalTotal = useCallback(() => {
    return getTotalAmount() + getServiceCharge() + getTaxAmount();
  }, [getTotalAmount, getServiceCharge, getTaxAmount]);

  // ✅ ENHANCED: Validation with customer info
  const validateOrder = useCallback(() => {
    if (!tableNumber.trim()) {
      setError("Please enter a table number");
      return false;
    }
    if (isNaN(tableNumber) || parseInt(tableNumber) <= 0) {
      setError("Please enter a valid table number");
      return false;
    }
    if (!customerInfo.name?.trim()) {
      setError("Please enter customer name");
      return false;
    }
    if (!captainInfo) {
      setError("Captain information not available");
      return false;
    }
    if (!selectedHotel) {
      setError("Hotel information not available");
      return false;
    }
    return true;
  }, [tableNumber, customerInfo.name, captainInfo, selectedHotel]);

  const generateOrderId = useCallback(() => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ✅ NEW: Create or get table session
  const createTableSession = useCallback(async (tableNum) => {
    if (!hotelId || !captainInfo) return null;

    try {
      // Check if session already exists
      if (tableSessionId) {
        return tableSessionId;
      }

      // Create new table session
      const sessionData = {
        hotelId,
        tableNumber: parseInt(tableNum),
        status: 'active',
        captainId: captainInfo.id,
        captainName: captainInfo.name || captainInfo.firstName,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        guestCount: 1, // Default, can be modified later
        sessionType: 'dine-in'
      };

      const sessionDoc = await addDoc(collection(db, 'tableSessions'), sessionData);
      return sessionDoc.id;
    } catch (error) {
      console.error("Error creating table session:", error);
      return null;
    }
  }, [hotelId, captainInfo, customerInfo, tableSessionId]);

  // ✅ ENHANCED: Handle submit order with comprehensive Firestore integration
  const handleSubmitOrder = useCallback(async () => {
    setError("");

    if (!validateOrder()) {
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

    setShowConfirmation(true);
  }, [validateOrder, cartItems, orderNumber]);

  // ✅ NEW: Confirm and place order
  const confirmAndPlaceOrder = useCallback(async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      const orderId = generateOrderId();
      const currentTime = new Date();
      const estimatedReadyTime = new Date(currentTime.getTime() + 25 * 60000); // 25 minutes from now

      // Create or get table session
      const sessionId = await createTableSession(tableNumber);

      // ✅ FIRESTORE: Create comprehensive order object
      const orderData = {
        // Basic order info
        orderNumber: orderNumber,
        orderId: orderId,
        hotelId: hotelId,
        hotelName: selectedHotel?.businessName || selectedHotel?.name || hotelName,
        tableNumber: parseInt(tableNumber),
        status: orderStatus,
        normalizedStatus: orderStatus, // For consistent filtering

        // Captain and customer info
        captainId: captainInfo.id,
        captainName: captainInfo.name || captainInfo.firstName,
        captainEmail: captainInfo.email,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || null,
        specialInstructions: customerInfo.specialInstructions || '',

        // Table session reference
        sessionId: sessionId,

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
          itemTotal: parseFloat(item.finalPrice || item.menuPrice || 0) * parseInt(item.quantity),
          isVeg: item.categoryType === "Veg" || item.categoryType === "veg",
          isSpicy: Boolean(item.isSpicy),
          isRecommended: Boolean(item.isRecommended),
          isPopular: Boolean(item.isPopular),
          isBestseller: Boolean(item.isBestseller),
          availability: item.availability || "Available",
          imageUrl: item.imageUrl || null,
          specialAttributes: {
            spicy: Boolean(item.isSpicy),
            recommended: Boolean(item.isRecommended),
            popular: Boolean(item.isPopular),
            bestseller: Boolean(item.isBestseller),
          },
        })),

        // Enhanced pricing breakdown
        pricing: {
          subtotal: getTotalAmount(),
          serviceCharge: getServiceCharge(),
          serviceChargeRate: selectedHotel?.serviceCharge || 0.05,
          tax: getTaxAmount(),
          taxPercentage: (selectedHotel?.taxRate || 0.18) * 100,
          total: getFinalTotal(),
          currency: "INR",
          breakdown: {
            itemsTotal: getTotalAmount(),
            serviceCharge: getServiceCharge(),
            taxableAmount: getTotalAmount() + getServiceCharge(),
            finalAmount: getFinalTotal()
          }
        },

        // Order summary details
        orderDetails: {
          totalItems: getTotalItems(),
          totalQuantity: getTotalItems(),
          uniqueItems: cartItems.length,
          averageItemPrice: Math.round(getTotalAmount() / getTotalItems()),
        },

        // Comprehensive timestamps using Firestore serverTimestamp
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        orderDate: currentTime.toISOString().split("T")[0],
        orderTime: currentTime.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
        }),
        estimatedReadyTime: estimatedReadyTime,

        // Customer and service information
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone || null,
          tableNumber: parseInt(tableNumber),
          orderType: "dine-in",
          servingStatus: "pending",
          guestCount: 1,
          specialRequests: customerInfo.specialInstructions || "",
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
          estimatedCompletionTime: estimatedReadyTime,
          specialInstructions: customerInfo.specialInstructions || "",
          assignedChef: null,
          cookingStartTime: null,
          readyTime: null,
          notes: []
        },

        // Payment and billing
        billing: {
          paymentStatus: "pending",
          paymentMethod: null,
          billGenerated: false,
          paidAmount: 0,
          changeAmount: 0,
          totalAmount: getFinalTotal()
        },

        // Tracking and analytics
        tracking: {
          orderSource: "captain_app",
          deviceInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            platform: "web",
          },
          captainId: captainInfo.id,
          sessionId: sessionId,
        },

        // Order lifecycle with status history
        lifecycle: {
          statusHistory: [
            {
              status: "received",
              timestamp: serverTimestamp(),
              updatedBy: captainInfo.id,
              updatedByName: captainInfo.name || captainInfo.firstName,
              note: "Order placed by captain",
            },
          ],
        },

        // Metadata
        metadata: {
          version: "3.0",
          source: "captain_app",
          orderFormat: "dine_in",
          firestoreDoc: true,
          systemGenerated: {
            orderNumber: true,
            timestamps: true,
            pricing: true,
          },
        },
      };

      // ✅ FIRESTORE: Add order to Firestore
      const orderDocRef = await addDoc(collection(db, 'orders'), orderData);

      // ✅ NEW: Update table session with order reference
      if (sessionId) {
        await updateDoc(doc(db, 'tableSessions', sessionId), {
          hasActiveOrder: true,
          lastOrderId: orderDocRef.id,
          lastOrderNumber: orderNumber,
          updatedAt: serverTimestamp()
        });
      }

      // ✅ NEW: Update captain stats
      if (captainInfo.id) {
        try {
          await updateDoc(doc(db, 'captains', captainInfo.id), {
            'stats.totalOrders': (captainInfo.stats?.totalOrders || 0) + 1,
            'stats.totalRevenue': (captainInfo.stats?.totalRevenue || 0) + getFinalTotal(),
            lastOrderPlaced: serverTimestamp(),
            lastActivity: serverTimestamp()
          });
        } catch (updateError) {
          console.warn("Could not update captain stats:", updateError);
        }
      }

      // Show success toast
      toast.success(`Order #${orderNumber} placed successfully!`);

      // Call success callback with comprehensive data
      onOrderSuccess({
        orderNumber: orderNumber,
        orderId: orderId,
        firestoreId: orderDocRef.id,
        tableNumber: parseInt(tableNumber),
        total: getFinalTotal(),
        items: getTotalItems(),
        estimatedTime: estimatedReadyTime.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: orderStatus,
        customerName: customerInfo.name,
        sessionId: sessionId,
        orderData: {
          ...orderData,
          firestoreId: orderDocRef.id
        },
      });

    } catch (error) {
      console.error("Error placing order:", error);
      setError(`Failed to place order: ${error.message}`);
      toast.error("Failed to place order. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    generateOrderId,
    createTableSession,
    tableNumber,
    orderNumber,
    orderStatus,
    hotelId,
    selectedHotel,
    captainInfo,
    customerInfo,
    cartItems,
    getTotalAmount,
    getTotalItems,
    getServiceCharge,
    getTaxAmount,
    getFinalTotal,
    onOrderSuccess,
    hotelName
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
          <CheckoutHeader 
            onGoBack={onGoBack} 
            hotelName={selectedHotel?.businessName || selectedHotel?.name || hotelName}
            captainName={captainInfo?.name || captainInfo?.firstName}
          />
          <OrderNumberDisplay orderNumber={orderNumber} isLoading={isLoading} />
        </div>

        {/* ✅ NEW: Customer Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Customer Name *"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              placeholder="Special Instructions (optional)"
              value={customerInfo.specialInstructions}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
            />
          </div>
        </div>

        {/* Table Number Input */}
        <TableNumberInput
          tableNumber={tableNumber}
          onTableNumberChange={setTableNumber}
          error={error}
          showSessionInfo={!!tableSessionId}
        />

        {/* ✅ ENHANCED: Order Summary with service charges */}
        <OrderSummary
          cartItems={cartItems}
          subtotal={getTotalAmount()}
          serviceCharge={getServiceCharge()}
          serviceChargeRate={selectedHotel?.serviceCharge || 0.05}
          totalItems={getTotalItems()}
          taxAmount={getTaxAmount()}
          taxPercentage={(selectedHotel?.taxRate || 0.18) * 100}
          grandTotal={getFinalTotal()}
          isCheckout={true}
          showBreakdown={true}
        />

        {/* Place Order Button */}
        <PlaceOrderButton
          onSubmit={handleSubmitOrder}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          finalTotal={getFinalTotal()}
          disabled={!customerInfo.name || !tableNumber || isSubmitting}
          buttonText="Review Order"
        />

        {/* Order Information Alert */}
        <OrderInfoAlert 
          estimatedTime="25 minutes"
          captainName={captainInfo?.name || captainInfo?.firstName}
        />

        {/* ✅ NEW: Order Confirmation Modal */}
        {/* {showConfirmation && (
          <OrderConfirmationModal
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={confirmAndPlaceOrder}
            orderData={{
              orderNumber,
              customerName: customerInfo.name,
              tableNumber: parseInt(tableNumber),
              items: cartItems,
              subtotal: getTotalAmount(),
              serviceCharge: getServiceCharge(),
              tax: getTaxAmount(),
              total: getFinalTotal(),
              estimatedTime: "25 minutes"
            }}
            isSubmitting={isSubmitting}
          />
        )} */}

        {/* ✅ NEW: Processing overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">Placing order...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

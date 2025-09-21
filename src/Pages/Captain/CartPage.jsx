// src/Pages/Captain/CartPage.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Info,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

// Components
import ErrorState from "atoms/Messages/ErrorState";
import CartItem from "components/CartItem";
import OrderSummary from "components/order-dashboard/OrderSummary";
import InfoCard from "components/Cards/InfoCard";
import EmptyState from "atoms/Messages/EmptyState";
import LoadingSpinner from "../../atoms/LoadingSpinner";

// ✅ ENHANCED: Empty cart component with captain context
const EmptyCart = ({ onGoBack, captainName, hotelName }) => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
            {captainName && (
              <p className="text-sm text-gray-600 mt-1">
                <User size={14} className="inline mr-1" />
                {captainName} • {hotelName}
              </p>
            )}
          </div>
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg px-2 py-1"
          >
            <ArrowLeft size={18} />
            Back to Menu
          </button>
        </div>

        <EmptyState
          hasFilters={false}
          onClearFilters={onGoBack}
          isLoading={false}
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any delicious items to your cart yet. Browse our menu and discover amazing dishes!"
          actionLabel="Explore Menu"
        />
      </div>
    </div>
  </div>
);

// ✅ NEW: Customer information component
const CustomerInfoSection = ({
  customerInfo,
  onCustomerInfoChange,
  loading,
}) => {
  const [isEditing, setIsEditing] = useState(!customerInfo?.name);
  const [localInfo, setLocalInfo] = useState(
    customerInfo || {
      name: "",
      phone: "",
      tableNumber: "",
      specialInstructions: "",
    }
  );

  const handleSave = () => {
    onCustomerInfoChange(localInfo);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Customer Information
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!localInfo.name || !localInfo.tableNumber}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Customer Name *"
            value={localInfo.name}
            onChange={(e) =>
              setLocalInfo((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={localInfo.phone}
            onChange={(e) =>
              setLocalInfo((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Table Number *"
            value={localInfo.tableNumber}
            onChange={(e) =>
              setLocalInfo((prev) => ({ ...prev, tableNumber: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            min="1"
          />
          <textarea
            placeholder="Special Instructions (optional)"
            value={localInfo.specialInstructions}
            onChange={(e) =>
              setLocalInfo((prev) => ({
                ...prev,
                specialInstructions: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <span className="font-medium">
              {customerInfo?.name || "Not provided"}
            </span>
          </div>
          {customerInfo?.phone && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                📞 {customerInfo.phone}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-sm">
              Table {customerInfo?.tableNumber || "Not assigned"}
            </span>
          </div>
          {customerInfo?.specialInstructions && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Special Instructions:</strong>{" "}
                {customerInfo.specialInstructions}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main CartPage component
const CartPage = ({ cartItems = [], onUpdateCart, onGoBack, onCheckout }) => {
  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // State management
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [captainInfo, setCaptainInfo] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    tableNumber: "",
    specialInstructions: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

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

  // ✅ ENHANCED: Memoized calculations with tax and service charges
  const cartCalculations = useMemo(() => {
    if (!cartItems?.length) {
      return {
        totalItems: 0,
        subtotal: 0,
        serviceCharge: 0,
        taxAmount: 0,
        grandTotal: 0,
      };
    }

    const totalItems = cartItems.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );

    const subtotal = cartItems.reduce(
      (total, item) =>
        total + (item.finalPrice || item.menuPrice || 0) * (item.quantity || 0),
      0
    );

    // Get rates from hotel settings or use defaults
    const serviceChargeRate = selectedHotel?.serviceCharge || 0.05; // 5%
    const taxRate = selectedHotel?.taxRate || 0.18; // 18% GST

    const serviceCharge = Math.round(subtotal * serviceChargeRate);
    const taxableAmount = subtotal + serviceCharge;
    const taxAmount = Math.round(taxableAmount * taxRate);
    const grandTotal = taxableAmount + taxAmount;

    return { totalItems, subtotal, serviceCharge, taxAmount, grandTotal };
  }, [cartItems, selectedHotel]);

  // ✅ ENHANCED: Handle quantity change with Firestore integration
  const handleQuantityChange = useCallback(
    async (item, quantityChange) => {
      const itemId = item.id;
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      setError("");

      try {
        // Simulate API call delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (onUpdateCart) {
          onUpdateCart(item, quantityChange);
        }

        // ✅ NEW: Log cart activity (optional)
        if (captainInfo && selectedHotel) {
          try {
            await updateDoc(doc(db, "captains", captainInfo.id), {
              lastActivity: serverTimestamp(),
              "stats.cartUpdates": (captainInfo.stats?.cartUpdates || 0) + 1,
            });
          } catch (updateError) {
            console.warn("Could not update captain activity:", updateError);
          }
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        setError("Failed to update item. Please try again.");
      } finally {
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [onUpdateCart, captainInfo, selectedHotel]
  );

  // ✅ NEW: Handle customer information change
  const handleCustomerInfoChange = useCallback((info) => {
    setCustomerInfo(info);
    setValidationErrors({});
  }, []);

  // ✅ NEW: Validate customer information
  const validateCustomerInfo = useCallback(() => {
    const errors = {};

    if (!customerInfo.name?.trim()) {
      errors.name = "Customer name is required";
    }

    if (!customerInfo.tableNumber) {
      errors.tableNumber = "Table number is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [customerInfo]);

  // ✅ ENHANCED: Handle checkout with validation and Firestore integration
  const handleCheckout = useCallback(async () => {
    if (!cartItems?.length) {
      setError("Cart is empty");
      return;
    }

    if (!validateCustomerInfo()) {
      setError("Please fill in required customer information");
      return;
    }

    if (!captainInfo) {
      setError("Captain information not available");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // ✅ NEW: Check for active table session
      let tableSessionId = null;

      if (customerInfo.tableNumber && selectedHotel) {
        const sessionsQuery = query(
          collection(db, "tableSessions"),
          where("hotelId", "==", selectedHotel.id),
          where("tableNumber", "==", parseInt(customerInfo.tableNumber)),
          where("status", "==", "active")
        );

        const sessionsSnapshot = await getDocs(sessionsQuery);

        if (!sessionsSnapshot.empty) {
          tableSessionId = sessionsSnapshot.docs[0].id;
        }
      }

      // Prepare checkout data with all necessary information
      const checkoutData = {
        cartItems,
        customerInfo,
        captainInfo,
        hotelInfo: selectedHotel,
        calculations: cartCalculations,
        tableSessionId,
        timestamp: new Date(),
      };

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onCheckout) {
        onCheckout(checkoutData);
      }
    } catch (error) {
      console.error("Error processing checkout:", error);
      setError("Failed to proceed to checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    cartItems,
    customerInfo,
    captainInfo,
    selectedHotel,
    cartCalculations,
    validateCustomerInfo,
    onCheckout,
  ]);

  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    }
  }, [onGoBack]);

  // Early return for empty cart
  if (!cartItems?.length) {
    return (
      <EmptyCart
        onGoBack={handleGoBack}
        captainName={captainInfo?.name || captainInfo?.firstName}
        hotelName={selectedHotel?.businessName || selectedHotel?.name}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ✅ ENHANCED: Header with captain and hotel info */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1"
                aria-label="Go back to menu"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Cart ({cartCalculations.totalItems} items)
                </h1>
                {captainInfo && selectedHotel && (
                  <p className="text-sm text-gray-600">
                    <User size={14} className="inline mr-1" />
                    {captainInfo.name || captainInfo.firstName} •{" "}
                    {selectedHotel.businessName || selectedHotel.name}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ NEW: Order time indicator */}
            <div className="text-right">
              <p className="text-xs text-gray-500">
                <Clock size={12} className="inline mr-1" />
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle size={16} />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* ✅ NEW: Customer Information Section */}
        <CustomerInfoSection
          customerInfo={customerInfo}
          onCustomerInfoChange={handleCustomerInfoChange}
          loading={isProcessing}
        />

        {/* Validation Errors */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <AlertTriangle size={16} />
              <span className="font-medium">
                Please complete required fields:
              </span>
            </div>
            <ul className="text-yellow-600 text-sm space-y-1">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={`${item.id}-${item.quantity}`}
              item={item}
              onQuantityChange={handleQuantityChange}
              isUpdating={updatingItems.has(item.id)}
              showExtendedInfo={true}
              captainMode={true}
            />
          ))}
        </div>

        {/* ✅ ENHANCED: Order Summary with service charges */}
        <OrderSummary
          totalItems={cartCalculations.totalItems}
          subtotal={cartCalculations.subtotal}
          serviceCharge={cartCalculations.serviceCharge}
          taxAmount={cartCalculations.taxAmount}
          grandTotal={cartCalculations.grandTotal}
          onCheckout={handleCheckout}
          isProcessing={isProcessing}
          showDeliveryInfo={false}
          checkoutButtonText="Proceed to Order"
          disabled={!customerInfo.name || !customerInfo.tableNumber}
          serviceChargeRate={selectedHotel?.serviceCharge || 0.05}
          taxRate={selectedHotel?.taxRate || 0.18}
        />

        {/* ✅ ENHANCED: Captain Instructions */}
        <InfoCard
          icon={Info}
          title="Captain Guidelines"
          content={`• Verify customer details before placing order
• Double-check table number assignment
• Confirm special dietary requirements
• Estimated preparation time: ${Math.ceil(cartItems.length * 8)} minutes`}
          variant="info"
        />

        {/* ✅ NEW: Loading overlay for processing */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">
                Processing order...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ ENHANCED: Default props with better defaults
CartPage.defaultProps = {
  cartItems: [],
  onUpdateCart: () => {},
  onGoBack: () => {},
  onCheckout: () => {},
};

export default CartPage;

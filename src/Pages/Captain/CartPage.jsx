import React, { useState, useCallback, useMemo } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

// Separate component for veg/non-veg indicator
const VegIndicator = ({ isVeg, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const dotSizeClasses = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 ${
        isVeg ? "border-green-500" : "border-red-500"
      } bg-white rounded-sm flex items-center justify-center`}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <div
        className={`${dotSizeClasses[size]} ${
          isVeg ? "bg-green-500" : "bg-red-500"
        } rounded-full`}
      />
    </div>
  );
};

// Separate component for quantity controls
const QuantityControls = ({ item, onQuantityChange, isUpdating = false }) => {
  const handleDecrease = useCallback(() => {
    onQuantityChange(item, -1);
  }, [item, onQuantityChange]);

  const handleIncrease = useCallback(() => {
    onQuantityChange(item, 1);
  }, [item, onQuantityChange]);

  return (
    <div className="flex items-center bg-orange-50 rounded-lg border border-orange-200">
      <button
        onClick={handleDecrease}
        disabled={isUpdating || item.quantity <= 1}
        className="p-2 text-orange-600 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Decrease quantity"
      >
        {item.quantity <= 1 ? <Trash2 size={16} /> : <Minus size={16} />}
      </button>
      <span className="px-4 py-2 font-semibold text-orange-700 min-w-[50px] text-center">
        {isUpdating ? "..." : item.quantity}
      </span>
      <button
        onClick={handleIncrease}
        disabled={isUpdating}
        className="p-2 text-orange-600 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

// Separate component for cart item
const CartItem = ({ item, onQuantityChange, isUpdating = false }) => {
  const isVeg = item.categoryType === "Veg" || item.categoryType === "veg";
  const itemTotal = (item.finalPrice || item.menuPrice || 0) * item.quantity;
  const hasDiscount = item.discount > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">{item.menuName}</h3>
            <VegIndicator isVeg={isVeg} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 font-bold text-lg">
                ₹{item.finalPrice || item.menuPrice}
              </span>
              {item.menuPrice &&
                item.finalPrice &&
                item.finalPrice < item.menuPrice && (
                  <span className="text-gray-500 line-through text-sm">
                    ₹{item.menuPrice}
                  </span>
                )}
            </div>

            {hasDiscount && (
              <div className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                <Tag size={12} />
                {item.discount}% OFF
              </div>
            )}
          </div>

          {item.menuCategory && (
            <span className="text-xs text-gray-500 mt-1 block">
              {item.menuCategory}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <QuantityControls
          item={item}
          onQuantityChange={onQuantityChange}
          isUpdating={isUpdating}
        />
        <div className="text-right">
          <div className="font-bold text-gray-800 text-lg">₹{itemTotal}</div>
          <div className="text-xs text-gray-500">
            ₹{item.finalPrice || item.menuPrice} × {item.quantity}
          </div>
        </div>
      </div>
    </div>
  );
};

// Separate component for order summary
const OrderSummary = ({
  totalItems,
  subtotal,
  taxAmount,
  grandTotal,
  onCheckout,
  isProcessing = false,
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>

    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal ({totalItems} items)</span>
        <span>₹{subtotal}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Tax & Charges (18%)</span>
        <span>₹{taxAmount}</span>
      </div>
      <div className="border-t pt-3">
        <div className="flex justify-between text-lg font-bold text-gray-800">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>
    </div>

    <button
      onClick={onCheckout}
      disabled={isProcessing}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Processing...
        </>
      ) : (
        <>
          <CheckCircle size={20} />
          Proceed to Checkout
        </>
      )}
    </button>

    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start gap-2">
        <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Delivery Information:</p>
          <ul className="text-xs space-y-0.5">
            <li>• Free delivery on orders above ₹500</li>
            <li>• Estimated preparation: 15-25 minutes</li>
            <li>• Fresh ingredients, prepared with care</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Empty cart component
const EmptyCart = ({ onGoBack }) => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg px-2 py-1"
          >
            <ArrowLeft size={18} />
            Back to Menu
          </button>
        </div>

        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Looks like you haven't added any delicious items to your cart yet.
            Browse our menu and discover amazing dishes!
          </p>
          <button
            onClick={onGoBack}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Explore Menu
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Main CartPage component
const CartPage = ({ cartItems = [], onUpdateCart, onGoBack, onCheckout }) => {
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Memoized calculations for better performance
  const cartCalculations = useMemo(() => {
    if (!cartItems?.length) {
      return {
        totalItems: 0,
        subtotal: 0,
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
    const taxAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + taxAmount;

    return { totalItems, subtotal, taxAmount, grandTotal };
  }, [cartItems]);

  const handleQuantityChange = useCallback(
    async (item, quantityChange) => {
      const itemId = item.id;
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      setError("");

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (onUpdateCart) {
          onUpdateCart(item, quantityChange);
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
    [onUpdateCart]
  );

  const handleCheckout = useCallback(async () => {
    if (!cartItems?.length) {
      setError("Cart is empty");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onCheckout) {
        onCheckout();
      }
    } catch (error) {
      console.error("Error processing checkout:", error);
      setError("Failed to proceed to checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, onCheckout]);

  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    }
  }, [onGoBack]);

  // Early return for empty cart
  if (!cartItems?.length) {
    return <EmptyCart onGoBack={handleGoBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
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
              <h1 className="text-xl font-bold text-gray-800">
                Cart ({cartCalculations.totalItems} items)
              </h1>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">{error}</span>
            </div>
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
            />
          ))}
        </div>

        {/* Order Summary */}
        <OrderSummary
          totalItems={cartCalculations.totalItems}
          subtotal={cartCalculations.subtotal}
          taxAmount={cartCalculations.taxAmount}
          grandTotal={cartCalculations.grandTotal}
          onCheckout={handleCheckout}
          isProcessing={isProcessing}
        />

        {/* Quick Actions */}
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-900">
              Quick Tip
            </span>
          </div>
          <p className="text-sm text-orange-800">
            Double-check your order before checkout. You can modify quantities
            or remove items by reducing quantity to zero.
          </p>
        </div>
      </div>
    </div>
  );
};

// Default props for better development experience
CartPage.defaultProps = {
  cartItems: [],
  onUpdateCart: () => {},
  onGoBack: () => {},
  onCheckout: () => {},
};

export default CartPage;

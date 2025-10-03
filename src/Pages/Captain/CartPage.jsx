import React, { useState, useCallback, useMemo } from "react";
import { ArrowLeft, ShoppingCart, Info } from "lucide-react";
import ErrorState from "atoms/Messages/ErrorState";
import CartItem from "components/CartItem";
import OrderSummary from "components/order-dashboard/OrderSummary";
import InfoCard from "components/Cards/InfoCard";
import EmptyState from "atoms/Messages/EmptyState";

// Empty cart component using existing EmptyState
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
      0,
    );
    const subtotal = cartItems.reduce(
      (total, item) =>
        total + (item.finalPrice || item.menuPrice || 0) * (item.quantity || 0),
      0,
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
    [onUpdateCart],
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
          <ErrorState
            message={error}
            variant="error"
            closeable={true}
            onClose={() => setError("")}
          />
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
          showDeliveryInfo={true}
        />

        {/* Quick Tip */}
        <InfoCard
          icon={Info}
          title="Quick Tip"
          content="Double-check your order before checkout. You can modify quantities or remove items by reducing quantity to zero."
          variant="tip"
        />
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

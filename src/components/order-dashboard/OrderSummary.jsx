import React, { memo } from "react";
import { CheckCircle, Info } from "lucide-react";

const OrderSummary = memo(
  ({
    totalItems,
    subtotal,
    taxAmount,
    grandTotal,
    onCheckout,
    isProcessing = false,
    showDeliveryInfo = true,
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Order Summary
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({totalItems} items)</span>
          <span>&#8377;{subtotal}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax & Charges (18%)</span>
          <span>&#8377;{taxAmount}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Grand Total</span>
            <span>&#8377;{grandTotal}</span>
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

      {showDeliveryInfo && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Delivery Information:</p>
              <ul className="text-xs space-y-0.5">
                <li>• Free delivery on orders above &#8377;500</li>
                <li>• Estimated preparation: 15-25 minutes</li>
                <li>• Fresh ingredients, prepared with care</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
);

OrderSummary.displayName = "OrderSummary";
export default OrderSummary;

// components/checkout/PlaceOrderButton.jsx
import { CheckCircle } from "lucide-react";

const PlaceOrderButton = ({
  onSubmit,
  isSubmitting,
  isLoading,
  finalTotal,
  buttonText = "Place Order",
  loadingText = "Placing Order...",
  disclaimerText = "By placing this order, you confirm the items and table number are correct.",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <button
        onClick={onSubmit}
        disabled={isSubmitting || isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            {loadingText}
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            {buttonText} - ₹{finalTotal}
          </>
        )}
      </button>

      {disclaimerText && (
        <p className="text-xs text-gray-500 text-center mt-3">
          {disclaimerText}
        </p>
      )}
    </div>
  );
};

export default PlaceOrderButton;

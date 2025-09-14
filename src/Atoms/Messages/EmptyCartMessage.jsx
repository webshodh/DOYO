// components/checkout/EmptyCartMessage.jsx
import { ShoppingCart } from "lucide-react";

const EmptyCartMessage = ({ onGoBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Cart is empty
        </h3>
        <p className="text-gray-500 mb-6">
          Add some items to proceed with checkout
        </p>
        <button
          onClick={onGoBack}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default EmptyCartMessage;

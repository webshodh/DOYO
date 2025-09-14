// components/checkout/CheckoutHeader.jsx
import { ArrowLeft } from "lucide-react";

const CheckoutHeader = ({ onGoBack, title = "Checkout" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onGoBack}
          className="text-orange-600 hover:text-orange-800 p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
    </div>
  );
};

export default CheckoutHeader;

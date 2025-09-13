// components/order-success/SuccessAnimation.jsx
import { CheckCircle } from "lucide-react";

const SuccessAnimation = ({
  title = "Order Placed Successfully!",
  description = "Your order has been sent to the kitchen",
  iconSize = 48,
  showAnimation = true,
}) => {
  return (
    <div className="mb-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
        {showAnimation && (
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
        )}
        <CheckCircle size={iconSize} className="text-green-600 relative z-10" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default SuccessAnimation;

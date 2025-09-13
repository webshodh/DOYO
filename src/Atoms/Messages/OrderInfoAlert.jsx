// components/checkout/OrderInfoAlert.jsx
import { AlertCircle } from "lucide-react";

const OrderInfoAlert = ({
  title = "Order Information:",
  items = [
    "Estimated preparation time: 15-25 minutes",
    "Your order will be prepared fresh",
    "Please ensure table number is correct",
    "Order cannot be modified after submission",
  ],
}) => {
  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">{title}</p>
          <ul className="space-y-1 text-xs">
            {items.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoAlert;

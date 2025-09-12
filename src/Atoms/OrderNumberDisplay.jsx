// components/checkout/OrderNumberDisplay.jsx
const OrderNumberDisplay = ({ orderNumber, isLoading }) => {
  return (
    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mt-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-orange-800">
          Order Number:
        </span>
        <span className="text-lg font-bold text-orange-600">
          {isLoading ? "Loading..." : `#${orderNumber}`}
        </span>
      </div>
    </div>
  );
};

export default OrderNumberDisplay;

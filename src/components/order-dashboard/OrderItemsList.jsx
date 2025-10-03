// components/checkout/OrderItemsList.jsx
const OrderItemsList = ({ items = [] }) => {
  const renderVegIndicator = (categoryType) => {
    const isVeg = categoryType === "Veg" || categoryType === "veg";

    return (
      <div
        className={`w-3 h-3 border-2 ${isVeg ? "border-green-500" : "border-red-500"} bg-white rounded-sm flex items-center justify-center`}
      >
        <div
          className={`w-1 h-1 ${isVeg ? "bg-green-500" : "bg-red-500"} rounded-full`}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-3 mb-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-800">{item.menuName}</span>
              {renderVegIndicator(item.categoryType)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>₹{item.finalPrice || item.menuPrice}</span>
              <span>×</span>
              <span>{item.quantity}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-gray-800">
              ₹{(item.finalPrice || item.menuPrice) * item.quantity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItemsList;

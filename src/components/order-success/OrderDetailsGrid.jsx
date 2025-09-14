// components/order-success/OrderDetailsGrid.jsx
const OrderDetailsGrid = ({
  orderNumber,
  tableNumber,
  totalItems,
  totalAmount,
  currency = "₹",
}) => {
  const details = [
    {
      label: "Order Number",
      value: `#${orderNumber}`,
      className: "text-orange-600",
    },
    {
      label: "Table Number",
      value: tableNumber,
      className: "text-gray-900",
    },
    {
      label: "Total Items",
      value: totalItems,
      className: "text-gray-900",
    },
    {
      label: "Total Amount",
      value: `${currency}${totalAmount}`,
      className: "text-green-600",
    },
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        {details.map((detail, index) => (
          <div key={index} className="text-center">
            <p className="text-gray-600 mb-1">{detail.label}</p>
            <p className={`text-xl font-bold ${detail.className}`}>
              {detail.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetailsGrid;

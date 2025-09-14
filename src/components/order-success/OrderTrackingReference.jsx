// components/order-success/OrderTrackingReference.jsx
const OrderTrackingReference = ({
  orderNumber,
  message = "Keep this screen for reference or show Order #{orderNumber} to staff",
}) => {
  const displayMessage = message.replace("{orderNumber}", orderNumber);

  return (
    <div className="text-center mt-4">
      <p className="text-xs text-gray-500">{displayMessage}</p>
    </div>
  );
};

export default OrderTrackingReference;

// components/order-success/FooterMessage.jsx
const FooterMessage = ({
  message = "Thank you for your order! We're preparing it with care. 🍽️",
  showBorder = true,
}) => {
  return (
    <div
      className={`mt-6 ${showBorder ? "pt-4 border-t border-gray-200" : ""}`}
    >
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
};

export default FooterMessage;

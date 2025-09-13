// components/checkout/PricingBreakdown.jsx
const PricingBreakdown = ({
  subtotal,
  totalItems,
  taxAmount,
  taxPercentage = 18,
  finalTotal,
}) => {
  return (
    <div className="space-y-2 border-t pt-4">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal ({totalItems} items)</span>
        <span>₹{subtotal}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Tax & Charges ({taxPercentage}%)</span>
        <span>₹{taxAmount}</span>
      </div>
      <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
        <span>Total Amount</span>
        <span>₹{finalTotal}</span>
      </div>
    </div>
  );
};

export default PricingBreakdown;

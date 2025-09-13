// pages/OrderSuccessPage.jsx
import React from "react";

// Import reusable components
import SuccessAnimation from "../../components/order-success/SuccessAnimation";
import OrderDetailsGrid from "../../components/order-success/OrderDetailsGrid";
import EstimatedTimeCard from "../../components/Cards/EstimatedTimeCard";
import OrderProgress from "../../components/order-success/OrderProgress";
import ImportantNotes from "../../atoms/Messages/ImportantNotes";
import ActionButtons from "../../components/order-success/ActionButtons";
import OrderTrackingReference from "../../components/order-success/OrderTrackingReference";
import FooterMessage from "../../atoms/Messages/FooterMessage";
import ErrorMessage from "atoms/Messages/ErrorMessage";

const OrderSuccessPage = ({ orderDetails, onGoHome, onCallStaff }) => {
  // Validate props
  if (!orderDetails) {
    return <ErrorMessage onAction={onGoHome} />;
  }

  const { orderNumber, tableNumber, total, items } = orderDetails;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
        {/* Success Animation */}
        <SuccessAnimation />

        {/* Order Details Card */}
        <OrderDetailsGrid
          orderNumber={orderNumber}
          tableNumber={tableNumber}
          totalItems={items}
          totalAmount={total}
        />

        {/* Estimated Time */}
        <EstimatedTimeCard />

        {/* Order Status Steps */}
        <OrderProgress />

        {/* Important Notes */}
        <ImportantNotes />

        {/* Action Buttons */}
        <ActionButtons
          orderNumber={orderNumber}
          onGoHome={onGoHome}
          onCallStaff={onCallStaff}
        />

        {/* Order Tracking Reference */}
        <OrderTrackingReference orderNumber={orderNumber} />

        {/* Footer Message */}
        <FooterMessage />
      </div>
    </div>
  );
};

// Default props
OrderSuccessPage.defaultProps = {
  onGoHome: () => {},
  onCallStaff: null,
};

export default OrderSuccessPage;

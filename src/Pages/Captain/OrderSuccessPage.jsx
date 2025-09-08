import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  Clock,
  Utensils,
  Home,
  Copy,
  Phone,
  Star,
  AlertCircle,
} from "lucide-react";

// Separate component for success animation
const SuccessAnimation = () => (
  <div className="mb-6">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
      <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
      <CheckCircle size={48} className="text-green-600 relative z-10" />
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">
      Order Placed Successfully!
    </h1>
    <p className="text-gray-600">Your order has been sent to the kitchen</p>
  </div>
);

// Separate component for order details grid
const OrderDetailsGrid = ({ orderDetails }) => {
  const { orderNumber, tableNumber, total, items } = orderDetails;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-600 mb-1">Order Number</p>
          <p className="text-xl font-bold text-orange-600">#{orderNumber}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-1">Table Number</p>
          <p className="text-xl font-bold text-gray-900">{tableNumber}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-1">Total Items</p>
          <p className="text-xl font-bold text-gray-900">{items}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-1">Total Amount</p>
          <p className="text-xl font-bold text-green-600">₹{total}</p>
        </div>
      </div>
    </div>
  );
};

// Separate component for estimated time
const EstimatedTimeCard = () => (
  <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <Clock size={24} className="text-blue-600 flex-shrink-0" />
    <div className="text-center">
      <p className="text-sm font-medium text-blue-900 mb-1">
        Estimated Preparation Time
      </p>
      <p className="text-xl font-bold text-blue-600">15-25 minutes</p>
    </div>
  </div>
);

// Separate component for order progress steps
const OrderProgress = () => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Simulate progress updates
    const timer = setTimeout(() => {
      setCurrentStep(2);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      id: 1,
      title: "Order Placed",
      status: "completed",
      icon: CheckCircle,
      description: "Your order has been received",
    },
    {
      id: 2,
      title: "Kitchen Preparation",
      status: currentStep >= 2 ? "in-progress" : "pending",
      icon: Clock,
      description: "Chef is preparing your meal",
    },
    {
      id: 3,
      title: "Ready to Serve",
      status: currentStep >= 3 ? "completed" : "pending",
      icon: Utensils,
      description: "Order ready for serving",
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        Order Progress
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.status === "completed";
          const isInProgress = step.status === "in-progress";
          const isPending = step.status === "pending";

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isInProgress
                    ? "bg-yellow-100 border-2 border-yellow-500 text-yellow-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <span
                  className={`text-sm font-medium ${
                    isPending ? "text-gray-500" : "text-gray-700"
                  }`}
                >
                  {step.title}
                </span>
                <p
                  className={`text-xs mt-0.5 ${
                    isPending ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {step.description}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : isInProgress
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isCompleted
                  ? "Completed"
                  : isInProgress
                  ? "In Progress"
                  : "Pending"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Separate component for important notes
const ImportantNotes = () => (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
    <h4 className="flex items-center gap-2 font-medium text-orange-900 mb-3">
      <Star size={16} />
      Important Information
    </h4>
    <ul className="text-sm text-orange-800 space-y-2">
      <li className="flex items-start gap-2">
        <span className="text-orange-500 mt-0.5">•</span>
        <span>Please remain at your table during preparation</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-orange-500 mt-0.5">•</span>
        <span>Your order will be served hot and fresh</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-orange-500 mt-0.5">•</span>
        <span>Kitchen staff will notify you when ready</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-orange-500 mt-0.5">•</span>
        <span>Contact staff if you need any assistance</span>
      </li>
    </ul>
  </div>
);

// Separate component for action buttons
const ActionButtons = ({ orderNumber, onGoHome }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`#${orderNumber}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy order number:", error);
    }
  }, [orderNumber]);

  const handleCallStaff = useCallback(() => {
    // This could integrate with a restaurant's staff notification system
    alert("Staff will be notified shortly");
  }, []);

  return (
    <div className="space-y-3">
      <button
        onClick={onGoHome}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <Home size={20} />
        Back to Menu
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCopyOrderNumber}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <Copy size={16} />
          {copied ? "Copied!" : "Copy Order #"}
        </button>

        <button
          onClick={handleCallStaff}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Phone size={16} />
          Call Staff
        </button>
      </div>
    </div>
  );
};

// Main OrderSuccessPage component
const OrderSuccessPage = ({ orderDetails, onGoHome }) => {
  // Validate props
  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Order Details Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            There was an issue loading your order information.
          </p>
          <button
            onClick={onGoHome}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const { orderNumber, tableNumber, total, items } = orderDetails;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
        {/* Success Animation */}
        <SuccessAnimation />

        {/* Order Details Card */}
        <OrderDetailsGrid orderDetails={orderDetails} />

        {/* Estimated Time */}
        <EstimatedTimeCard />

        {/* Order Status Steps */}
        <OrderProgress />

        {/* Important Notes */}
        <ImportantNotes />

        {/* Action Buttons */}
        <ActionButtons orderNumber={orderNumber} onGoHome={onGoHome} />

        {/* Order Tracking Reference */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Keep this screen for reference or show Order #{orderNumber} to staff
          </p>
        </div>

        {/* Footer Message */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Thank you for your order! We're preparing it with care. 🍽️
          </p>
        </div>
      </div>
    </div>
  );
};

// PropTypes for better development experience
OrderSuccessPage.defaultProps = {
  onGoHome: () => {},
};

export default OrderSuccessPage;

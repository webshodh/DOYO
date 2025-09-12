// components/order-success/ActionButtons.jsx
import { Home } from "lucide-react";
import CopyButton from "./CopyButton";

const ActionButtons = ({
  orderNumber,
  onGoHome,
  onCallStaff,
  showCopyButton = true,
  showCallStaffButton = true,
  primaryButtonLabel = "Back to Menu",
}) => {
  const handleCallStaff = () => {
    if (onCallStaff) {
      onCallStaff();
    } else {
      // Default behavior
      alert("Staff will be notified shortly");
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={onGoHome}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <Home size={20} />
        {primaryButtonLabel}
      </button>

      {(showCopyButton || showCallStaffButton) && (
        <div className="grid grid-cols-2 gap-3">
          {showCopyButton && (
            <CopyButton textToCopy={`#${orderNumber}`} label="Copy Order #" />
          )}

          {/* {showCallStaffButton && (
            <CallStaffButton onCallStaff={handleCallStaff} />
          )} */}
        </div>
      )}
    </div>
  );
};

export default ActionButtons;

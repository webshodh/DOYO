import React, { memo } from "react";
import { AlertCircle } from "lucide-react";

const AvailabilityOverlay = memo(({ availability }) => {
  if (availability === "Available") return null;

  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-70 rounded-lg flex items-center justify-center backdrop-blur-sm z-10"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center">
        <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <span className="bg-red-500 text-white px-3 py-2 text-sm font-bold rounded-lg shadow-lg">
          {availability}
        </span>
      </div>
    </div>
  );
});

AvailabilityOverlay.displayName = "AvailabilityOverlay";

export default AvailabilityOverlay;

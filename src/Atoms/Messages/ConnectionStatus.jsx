import React, { memo } from "react";
import { WifiOff } from "lucide-react";

const ConnectionStatus = memo(({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="bg-red-100 border border-red-200 p-2 text-center">
      <div className="flex items-center justify-center gap-2 text-red-800 text-sm">
        <WifiOff size={16} />
        <span>No internet connection. Some features may not work.</span>
      </div>
    </div>
  );
});

ConnectionStatus.displayName = "ConnectionStatus";
export default ConnectionStatus;

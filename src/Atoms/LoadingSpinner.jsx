// Loading component
import React, { memo } from "react";
import { LoaderCircle } from "lucide-react";

const LoadingSpinner = memo(({ size = "md", text = "Loading..." }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoaderCircle
        className={`${sizes[size]} animate-spin text-orange-500 mb-3`}
      />
      <p className="text-gray-600 text-sm font-medium">{text}</p>
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";
export default LoadingSpinner;

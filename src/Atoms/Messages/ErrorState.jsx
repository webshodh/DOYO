import React, { memo } from "react";
import { AlertCircle } from "lucide-react";
import { SIZE_VARIANTS } from "Constants/Themes/sizeVariants";


const ErrorState = memo(
  ({ size = "medium", message = "Error loading data" }) => {
    const sizeConfig = SIZE_VARIANTS[size];

    return (
      <div
        className={`bg-white rounded-lg ${sizeConfig.container} flex items-start ${sizeConfig.gap} shadow-sm border border-red-200`}
      >
        <div
          className={`${sizeConfig.iconContainer} bg-red-500 rounded-full flex items-center justify-center flex-shrink-0`}
          style={{ marginTop: "15px" }}
        >
          <AlertCircle className={`${sizeConfig.icon} text-white`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <p
              className={`${sizeConfig.valueText} font-bold text-red-800 leading-tight`}
            >
              Error
            </p>
          </div>
          <p
            className={`${sizeConfig.labelText} text-red-600 font-medium mt-1 leading-tight`}
          >
            {message}
          </p>
        </div>
      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";

export default ErrorState;

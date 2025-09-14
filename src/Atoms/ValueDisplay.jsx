import React, { memo } from "react";

const ValueDisplay = memo(({ value, unit, colors, sizeConfig }) => {
  // Format large numbers for better readability
  const formatValue = (val) => {
    if (typeof val === "number") {
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="flex items-baseline gap-1 flex-wrap">
      <p
        className={`${sizeConfig.valueText} font-bold ${colors.textSecondary} leading-tight select-text`}
      >
        {formatValue(value)}
      </p>
      {unit && (
        <p
          className={`${sizeConfig.unitText} ${colors.textPrimary} font-medium select-text`}
        >
          {unit}
        </p>
      )}
    </div>
  );
});

ValueDisplay.displayName = "ValueDisplay";

export default ValueDisplay;

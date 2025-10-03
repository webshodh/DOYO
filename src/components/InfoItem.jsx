import React, { useMemo, memo } from "react";
import { Check, X } from "lucide-react";
import InfoItemSkeleton from "../atoms/InfoItemSkeleton";

const InfoItem = memo(
  ({
    label = "",
    value,
    type = "text",
    labelColor = "text-gray-600",
    valueColor = "text-gray-800",
    showCondition = true,
    customRenderer = null,
    isLoading = false,
    highlightValue = false,
    icon: Icon = null,
    className = "",
    onClick,
    testId,
  }) => {
    // Memoized value renderer - moved to top before any conditions
    const renderValue = useMemo(() => {
      if (customRenderer) {
        return customRenderer(value);
      }

      switch (type) {
        case "boolean":
          return (
            <div className="flex items-center gap-1">
              {value ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="font-semibold text-green-600">Yes</span>
                </>
              ) : (
                <>
                  <X className="w-3 h-3 text-gray-400" />
                  <span className="font-semibold text-gray-500">No</span>
                </>
              )}
            </div>
          );

        case "number":
          return (
            <span className={`font-semibold ${valueColor}`}>
              {typeof value === "number"
                ? value.toLocaleString()
                : value || "0"}
            </span>
          );

        case "currency":
          return (
            <span className={`font-semibold ${valueColor}`}>
              ₹
              {typeof value === "number"
                ? value.toLocaleString()
                : value || "0"}
            </span>
          );

        case "percentage":
          return (
            <span className={`font-semibold ${valueColor}`}>
              {value || "0"}%
            </span>
          );

        case "badge":
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {value || "N/A"}
            </span>
          );

        case "text":
        case "conditional":
        default:
          return (
            <span
              className={`font-semibold ${valueColor} ${
                highlightValue ? "bg-yellow-100 px-1 rounded" : ""
              }`}
            >
              {value || "N/A"}
            </span>
          );
      }
    }, [value, type, customRenderer, valueColor, highlightValue]);

    // Don't render if conditions are not met
    if (!showCondition || (type === "conditional" && !value)) {
      return null;
    }

    // Show loading skeleton
    if (isLoading) {
      return <InfoItemSkeleton />;
    }

    return (
      <div
        className={`flex justify-between items-center bg-white rounded-lg p-2 hover:bg-gray-50 transition-colors duration-150 ${
          onClick ? "cursor-pointer" : ""
        } ${className}`}
        onClick={onClick}
        data-testid={testId}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3 h-3 text-gray-400" />}
          <span className={`font-medium ${labelColor} text-sm`}>{label}:</span>
        </div>
        <div className="flex items-center">{renderValue}</div>
      </div>
    );
  },
);

InfoItem.displayName = "InfoItem";

// Default props
InfoItem.defaultProps = {
  label: "",
  type: "text",
  labelColor: "text-gray-600",
  valueColor: "text-gray-800",
  showCondition: true,
  isLoading: false,
  highlightValue: false,
  className: "",
};

export default InfoItem;

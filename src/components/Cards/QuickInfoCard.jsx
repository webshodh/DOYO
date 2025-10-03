import React, { memo } from "react";

const QuickInfoCard = memo(
  ({ icon: Icon, label = "", value = "", colorScheme = "blue" }) => {
    // Color themes
    const colors = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-600",
        label: "text-blue-700",
        value: "text-blue-900",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: "text-green-600",
        label: "text-green-700",
        value: "text-green-900",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-600",
        label: "text-red-700",
        value: "text-red-900",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: "text-orange-600",
        label: "text-orange-700",
        value: "text-orange-900",
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: "text-yellow-600",
        label: "text-yellow-700",
        value: "text-yellow-900",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        icon: "text-purple-600",
        label: "text-purple-700",
        value: "text-purple-900",
      },
    };

    const colorTheme = colors[colorScheme] || colors.blue;

    // Handle missing data
    if (!label && !value) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[100px] flex flex-col items-center justify-center">
          <div className="text-gray-500 text-sm">No Data</div>
        </div>
      );
    }

    return (
      <div
        className={`${colorTheme.bg} border ${colorTheme.border} rounded-xl p-2 min-h-[100px] flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md`}
      >
        {/* Icon */}
        {Icon && (
          <Icon className={`w-6 h-6 ${colorTheme.icon} mb-2 flex-shrink-0`} />
        )}

        {/* Label */}
        {label && (
          <p
            className={`text-sm ${colorTheme.label} font-medium mb-1 leading-tight`}
          >
            {label}
          </p>
        )}

        {/* Value */}
        {value && (
          <p
            className={`text-base font-bold ${colorTheme.value} leading-tight`}
          >
            {value}
          </p>
        )}
      </div>
    );
  },
);

QuickInfoCard.displayName = "QuickInfoCard";

export default QuickInfoCard;

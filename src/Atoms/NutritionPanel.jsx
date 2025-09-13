import React, { memo } from "react";

const NutritionPanel = memo(
  ({
    children,
    className = "",
    title = "Nutrition Facts",
    layout = "grid", // grid, stack
  }) => {
    const layoutClasses =
      layout === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        : "flex flex-col gap-3";

    return (
      <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            {title}
          </h3>
        )}
        <div className={layoutClasses}>{children}</div>
      </div>
    );
  }
);

NutritionPanel.displayName = "NutritionPanel";

export default NutritionPanel;

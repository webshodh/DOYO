import React, { memo } from "react";

const QuickInfoGroup = memo(
  ({
    children,
    className = "",
    gap = "gap-3",
    direction = "horizontal", // horizontal, vertical
  }) => {
    const groupClasses = [
      "flex",
      direction === "horizontal" ? "flex-row flex-wrap" : "flex-col",
      gap,
      className,
    ].join(" ");

    return (
      <div className={groupClasses} role="group">
        {children}
      </div>
    );
  }
);

QuickInfoGroup.displayName = "QuickInfoGroup";

export default QuickInfoGroup;

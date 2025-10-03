import DetailSectionCard from "components/Cards/DetailSectionCard";
import React, { memo } from "react";

const DetailSectionGroup = memo(
  ({
    sections = [],
    className = "",
    layout = "stack", // stack, grid
  }) => {
    const layoutClasses =
      layout === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-0";

    return (
      <div className={`${layoutClasses} ${className}`}>
        {sections.map((section, index) => (
          <DetailSectionCard key={section.title || index} {...section} />
        ))}
      </div>
    );
  },
);

DetailSectionGroup.displayName = "DetailSectionGroup";

export default DetailSectionGroup;

import React, { memo } from "react";
import { TagsContainer } from "Atoms/Tags";

const TagsSection = memo(({ modalData }) => (
  <div className="space-y-3 mb-6">
    <div className="flex items-center gap-2 flex-wrap">
      <TagsContainer data={modalData} categories={["primary"]} />
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <TagsContainer data={modalData} categories={["dietaries"]} />
    </div>
  </div>
));

TagsSection.displayName = "TagsSection";

export default TagsSection;

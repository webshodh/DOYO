import React, { memo } from "react";

const InfoItemSkeleton = memo(() => (
  <div className="flex justify-between bg-white rounded-lg p-2 animate-pulse">
    <div className="h-4 w-20 bg-gray-300 rounded" />
    <div className="h-4 w-16 bg-gray-300 rounded" />
  </div>
));

InfoItemSkeleton.displayName = "InfoItemSkeleton";

export default InfoItemSkeleton;

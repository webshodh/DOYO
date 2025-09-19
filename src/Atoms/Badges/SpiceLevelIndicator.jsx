import React, { memo, useMemo } from "react";
import { Flame } from "lucide-react";

const SpiceLevelIndicator = memo(({ spiceLevel }) => {
  const spiceConfig = useMemo(() => {
    const configs = {
      Mild: { color: "text-green-500" },
      Medium: { color: "text-yellow-500" },
      Hot: { color: "text-orange-500" },
      "Extra Hot": { color: "text-red-500" },
    };
    return configs[spiceLevel] || { color: "text-yellow-500" };
  }, [spiceLevel]);

  if (!spiceLevel) return null;

  return (
    <div className="flex items-center gap-1">
      <Flame className={`w-3 h-3 ${spiceConfig.color}`} />
      <span className="text-xs">
        <span className="hidden sm:inline">{spiceLevel}</span>
        <span className="sm:hidden">{spiceLevel}</span>
      </span>
    </div>
  );
});

SpiceLevelIndicator.displayName = "SpiceLevelIndicator";

export default SpiceLevelIndicator;

import { STATUS_BADGE_CONFIG } from "Constants/constant";
import React, { memo } from "react";

const StatusBadge = memo(({ status }) => {
  const config = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.received;
  const Icon = config.icon;

  return (
    <div
      className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
    >
      <div className="flex items-center gap-1">
        <Icon size={16} />
        <span className="capitalize">{config.label}</span>
      </div>
    </div>
  );
});

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;

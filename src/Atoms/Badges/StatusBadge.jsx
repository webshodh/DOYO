import React, { memo } from "react";
import { Clock, ChefHat, Bell, CheckCircle, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  received: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Pending",
  },
  preparing: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: ChefHat,
    label: "Preparing",
  },
  ready: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Bell,
    label: "Ready",
  },
  completed: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: CheckCircle,
    label: "Completed",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Rejected",
  },
};

const StatusBadge = memo(({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.received;
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

// Order status badge component
import React, { memo } from "react";
import { Clock } from "lucide-react";

const OrderStatusBadge = memo(({ status, orderStatuses }) => {
  const statusConfig = orderStatuses.find((s) => s.value === status);
  const StatusIcon = statusConfig?.icon || Clock;
  const statusColor = statusConfig?.color || "gray";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}
    >
      <StatusIcon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

OrderStatusBadge.displayName = "OrderStatusBadge";
export default OrderStatusBadge;

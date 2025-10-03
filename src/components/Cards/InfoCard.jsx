import React, { memo } from "react";

const InfoCard = memo(
  ({
    icon: Icon,
    title,
    content,
    variant = "default", // "default" | "tip" | "warning" | "success"
  }) => {
    const variantClasses = {
      default: "bg-gray-50 border-gray-200 text-gray-800",
      tip: "bg-orange-50 border-orange-200 text-orange-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      success: "bg-green-50 border-green-200 text-green-800",
    };

    const iconColors = {
      default: "text-gray-600",
      tip: "text-orange-600",
      warning: "text-yellow-600",
      success: "text-green-600",
    };

    return (
      <div className={`${variantClasses[variant]} rounded-xl p-4 border`}>
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon size={16} className={iconColors[variant]} />}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="text-sm">{content}</p>
      </div>
    );
  },
);

InfoCard.displayName = "InfoCard";
export default InfoCard;

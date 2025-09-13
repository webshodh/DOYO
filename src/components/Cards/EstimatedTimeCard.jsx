// components/order-success/EstimatedTimeCard.jsx
import { Clock } from "lucide-react";

const EstimatedTimeCard = ({
  estimatedTime = "15-25 minutes",
  title = "Estimated Preparation Time",
  icon: IconComponent = Clock,
  variant = "blue", // blue, orange, green
}) => {
  const variants = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      timeColor: "text-blue-600",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconColor: "text-orange-600",
      titleColor: "text-orange-900",
      timeColor: "text-orange-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      timeColor: "text-green-600",
    },
  };

  const styles = variants[variant] || variants.blue;

  return (
    <div
      className={`flex items-center justify-center gap-3 mb-6 p-4 ${styles.bg} rounded-lg border ${styles.border}`}
    >
      <IconComponent
        size={24}
        className={`${styles.iconColor} flex-shrink-0`}
      />
      <div className="text-center">
        <p className={`text-sm font-medium ${styles.titleColor} mb-1`}>
          {title}
        </p>
        <p className={`text-xl font-bold ${styles.timeColor}`}>
          {estimatedTime}
        </p>
      </div>
    </div>
  );
};

export default EstimatedTimeCard;

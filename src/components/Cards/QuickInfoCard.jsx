import { Clock, Users, Flame, Zap } from "lucide-react";

const QuickInfoCard = ({ icon: Icon, label, value, colorScheme = "blue" }) => {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-r from-blue-50 to-blue-100",
      border: "border-blue-200",
      iconColor: "text-blue-600",
      labelColor: "text-blue-600",
      valueColor: "text-blue-800",
    },
    orange: {
      bg: "bg-gradient-to-r from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconColor: "text-orange-600",
      labelColor: "text-orange-600",
      valueColor: "text-orange-800",
    },
    red: {
      bg: "bg-gradient-to-r from-red-50 to-red-100",
      border: "border-red-200",
      iconColor: "text-red-600",
      labelColor: "text-red-600",
      valueColor: "text-red-800",
    },
    green: {
      bg: "bg-gradient-to-r from-green-50 to-green-100",
      border: "border-green-200",
      iconColor: "text-green-600",
      labelColor: "text-green-600",
      valueColor: "text-green-800",
    },
    purple: {
      bg: "bg-gradient-to-r from-purple-50 to-purple-100",
      border: "border-purple-200",
      iconColor: "text-purple-600",
      labelColor: "text-purple-600",
      valueColor: "text-purple-800",
    },
    gray: {
      bg: "bg-gradient-to-r from-gray-50 to-gray-100",
      border: "border-gray-200",
      iconColor: "text-gray-600",
      labelColor: "text-gray-600",
      valueColor: "text-gray-800",
    },
  };

  const colors = colorClasses[colorScheme] || colorClasses.blue;

  return (
    <div className={`${colors.bg} rounded-xl p-3 border ${colors.border}`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colors.iconColor}`} />
        <div>
          <p className={`text-xs ${colors.labelColor} font-medium`}>{label}</p>
          <p className={`text-sm font-bold ${colors.valueColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default QuickInfoCard;

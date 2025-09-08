const NutritionCard = ({
  icon: Icon,
  label,
  value,
  unit = "",
  colorScheme = "green",
  showLetter = false,
  letter = "",
}) => {
  const colorClasses = {
    green: {
      bg: "bg-green-500",
      textPrimary: "text-green-600",
      textSecondary: "text-green-800",
    },
    blue: {
      bg: "bg-blue-500",
      textPrimary: "text-blue-600",
      textSecondary: "text-blue-800",
    },
    red: {
      bg: "bg-red-500",
      textPrimary: "text-red-600",
      textSecondary: "text-red-800",
    },
    orange: {
      bg: "bg-orange-500",
      textPrimary: "text-orange-600",
      textSecondary: "text-orange-800",
    },
    purple: {
      bg: "bg-purple-500",
      textPrimary: "text-purple-600",
      textSecondary: "text-purple-800",
    },
  };

  const colors = colorClasses[colorScheme] || colorClasses.green;

  return (
    <div className="bg-white rounded-lg p-3 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div style={{marginTop:"15px"}}
        className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}
      >
        {showLetter ? (
          <span className="text-white text-xs font-bold">
            {letter || label.charAt(0).toUpperCase()}
          </span>
        ) : (
          Icon && <Icon className="w-4 h-4 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1 flex-wrap">
          <p className={`text-lg font-bold ${colors.textSecondary} leading-tight`}>
            {value}
          </p>
          {unit && (
            <p className={`text-xs ${colors.textPrimary} font-medium`}>
              {unit}
            </p>
          )}
        </div>
        <p className={`text-xs ${colors.textPrimary} font-medium capitalize mt-1 leading-tight`}>
          {label}
        </p>
      </div>
    </div>
  );
};

export default NutritionCard;
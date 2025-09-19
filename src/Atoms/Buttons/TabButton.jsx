const { Grid3x3, Star, Zap, Filter } = require("lucide-react");
const { memo } = require("react");

// Tab button component with enhanced styling
const TabButton = memo(
  ({
    label,
    count,
    isActive,
    onClick,
    type,
    disabled = false,
    className = "",
  }) => {
    // Theme configuration for different tab types
    const themes = {
      all: {
        active:
          "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400",
        icon: Grid3x3,
      },
      main: {
        active:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400",
        icon: Star,
      },
      special: {
        active:
          "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400",
        icon: Zap,
      },
      regular: {
        active:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
        icon: Filter,
      },
    };

    const theme = themes[type] || themes.regular;
    const IconComponent = theme.icon;

    return (
      <button
        onClick={onClick}
        className={`
        flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2
        transition-all duration-200 transform hover:scale-105 active:scale-95
        ${
          isActive
            ? "bg-orange-500 text-white border-transparent shadow-lg"
            : "bg-white text-gray-600 border-gray-300 hover:shadow-md hover:border-gray-400"
        }
        ${className || ""}
      `}
      >
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        {typeof count === "number" && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);

TabButton.displayName = "TabButton";
export default TabButton;

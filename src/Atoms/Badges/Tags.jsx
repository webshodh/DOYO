import React from "react";
import {
  Tag,
  Utensils,
  ChefHat,
  Leaf,
  Shield,
  Activity,
  Heart,
  Users,
  Star,
  Award,
  TrendingUp,
  AlertCircle,
  Clock,
  Thermometer,
} from "lucide-react";

// Individual Tag Component
const CustomTag = ({
  label,
  icon: Icon,
  variant = "default",
  size = "sm",
  className = "",
  showIcon = true,
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500",
    secondary:
      "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-400",
    success:
      "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500",
    warning:
      "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500",
    info: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-500",
    purple:
      "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500",
    pink: "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500",
    indigo:
      "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-500",
    emerald:
      "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500",
    orange:
      "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500",
    teal: "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-500",
    default:
      "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`
      inline-flex items-center gap-1.5 
      ${variants[variant]} 
      ${sizes[size]}
      rounded-full border font-medium
      shadow-sm hover:shadow-md
      transform transition-all duration-200 hover:scale-105
      ${className}
    `}
    >
      {showIcon && Icon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
};

// Tag Configuration
const tagConfig = {
  // Category & Type Tags
  menuCategory: { icon: Tag, variant: "primary", size: "sm" },
  categoryType: {
    icon: null, // Will use custom icon based on value
    variant: "purple",
    size: "sm",
    customIcon: (value) => (value === "veg" ? "🌱" : "🍖"),
  },
  mealType: { icon: Utensils, variant: "orange", size: "sm" },
  cuisineType: { icon: ChefHat, variant: "success", size: "sm" },

  // Special Features
  isVegan: { icon: Leaf, variant: "success", size: "xs", label: "Vegan" },
  isGlutenFree: {
    icon: Shield,
    variant: "info",
    size: "xs",
    label: "Gluten Free",
  },
  isSugarFree: {
    icon: Shield,
    variant: "purple",
    size: "xs",
    label: "Sugar Free",
  },
  isLactoseFree: {
    icon: Shield,
    variant: "teal",
    size: "xs",
    label: "Lactose Free",
  },
  isOrganic: { icon: Leaf, variant: "emerald", size: "xs", label: "Organic" },
  isHighProtein: {
    icon: Activity,
    variant: "danger",
    size: "xs",
    label: "High Protein",
  },
  isJainFriendly: {
    icon: Heart,
    variant: "warning",
    size: "xs",
    label: "Jain Friendly",
  },
  isKidsFriendly: {
    icon: Users,
    variant: "pink",
    size: "xs",
    label: "Kids Friendly",
  },
  isSeasonal: { icon: Star, variant: "orange", size: "xs", label: "Seasonal" },
  isLimitedEdition: {
    icon: Award,
    variant: "indigo",
    size: "xs",
    label: "Limited Edition",
  },
  isMostOrdered: {
    icon: TrendingUp,
    variant: "danger",
    size: "xs",
    label: "Most Ordered",
  },
  isBeverageAlcoholic: {
    icon: AlertCircle,
    variant: "danger",
    size: "xs",
    label: "Alcoholic",
  },
  chefSpecial: {
    icon: Star,
    variant: "warning",
    size: "xs",
    label: "Chef Special",
  },
  isPopular: {
    icon: TrendingUp,
    variant: "pink",
    size: "xs",
    label: "Popular",
  },
  isRecommended: {
    icon: Award,
    variant: "emerald",
    size: "xs",
    label: "Recommended",
  },

  // Additional possible tags
  spiceLevel: { icon: Thermometer, variant: "danger", size: "xs" },
  preparationMethod: { icon: ChefHat, variant: "secondary", size: "xs" },
  cookingTime: { icon: Clock, variant: "info", size: "xs" },
};

// Main TagsContainer Component
const TagsContainer = ({
  data,
  categories = ["primary", "features"],
  className = "",
  spacing = "gap-2",
}) => {
  // Helper function to format display text
  const formatDisplayText = (key, value) => {
    const config = tagConfig[key];

    // Use custom label if defined
    if (config?.label) return config.label;

    // Special cases
    switch (key) {
      case "categoryType":
        return value === "veg" ? "Vegetarian" : "Non-Vegetarian";
      case "spiceLevel":
        return `${value} Spice`;
      case "cookingTime":
        return `${value} mins`;
      default:
        return value;
    }
  };

  // Categorize tags
  const primaryTags = [
    "menuCategory",
    "categoryType",
    "mealType",
    "cuisineType",
  ];
  const featureTags = [
    "isSeasonal",
    "isLimitedEdition",
    "isMostOrdered",
    "isBeverageAlcoholic",
    "chefSpecial",
    "isPopular",
    "isRecommended",
  ];
  const dietaryTags = [
    "isVegan",
    "isGlutenFree",
    "isSugarFree",
    "isLactoseFree",
    "isOrganic",
    "isHighProtein",
    "isJainFriendly",
    "isKidsFriendly",
  ];

  const renderTags = (tagKeys) => {
    return tagKeys
      .filter((key) => {
        const value = data[key];
        // Show tag if value exists and is truthy (for booleans) or has content (for strings)
        return (
          value &&
          (typeof value === "boolean" ? value : value.toString().trim())
        );
      })
      .map((key) => {
        const value = data[key];
        const config = tagConfig[key] || {};
        const label = formatDisplayText(key, value);

        // Handle custom icons
        let IconComponent = config.icon;
        let customIcon = null;

        if (config.customIcon) {
          customIcon = config.customIcon(value);
        }

        return (
          <CustomTag
            key={key}
            label={label}
            icon={IconComponent}
            variant={config.variant || "default"}
            size={config.size || "sm"}
            showIcon={!customIcon}
            className={customIcon ? "relative" : ""}
          >
            {customIcon && <span className="mr-1 text-sm">{customIcon}</span>}
          </CustomTag>
        );
      });
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Primary Tags (Category, Type, etc.) */}
      {categories.includes("primary") && (
        <div className={`flex items-center flex-wrap ${spacing}`}>
          {renderTags(primaryTags)}
        </div>
      )}

      {/* Feature Tags */}
      {categories.includes("features") && (
        <div className={`flex items-center flex-wrap ${spacing}`}>
          {renderTags(featureTags)}
        </div>
      )}
      {/* Feature Tags */}
      {categories.includes("dietaries") && (
        <div className={`flex items-center flex-wrap ${spacing}`}>
          {renderTags(dietaryTags)}
        </div>
      )}
    </div>
  );
};

// Export individual components for direct use
export { CustomTag, TagsContainer };

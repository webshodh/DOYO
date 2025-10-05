import React from "react";
import {
  TAG_CATEGORIES,
  TAG_CONFIG,
  TAG_ICON_SIZES,
  TAG_SIZES,
  TAG_VARIANTS,
} from "Constants/constant";

// Individual Tag Component
const CustomTag = ({
  label,
  icon: Icon,
  variant = "default",
  size = "sm",
  className = "",
  showIcon = true,
}) => {
  return (
    <span
      className={`
      inline-flex items-center gap-1.5 
      ${TAG_VARIANTS[variant]} 
      ${TAG_SIZES[size]}
      rounded-full border font-medium
      shadow-sm hover:shadow-md
      transform transition-all duration-200 hover:scale-105
      ${className}
    `}
    >
      {showIcon && Icon && <Icon className={TAG_ICON_SIZES[size]} />}
      {label}
    </span>
  );
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
    const config = TAG_CONFIG[key];

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
        const config = TAG_CONFIG[key] || {};
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
          {renderTags(TAG_CATEGORIES.PRIMARY)}
        </div>
      )}

      {/* Feature Tags */}
      {categories.includes("features") && (
        <div className={`flex items-center flex-wrap ${spacing}`}>
          {renderTags(TAG_CATEGORIES.FEATURES)}
        </div>
      )}
      {/* Feature Tags */}
      {categories.includes("dietaries") && (
        <div className={`flex items-center flex-wrap ${spacing}`}>
          {renderTags(TAG_CATEGORIES.DIETARY)}
        </div>
      )}
    </div>
  );
};

// Export individual components for direct use
export { CustomTag, TagsContainer };

import React from "react";
import { AlertCircle } from "lucide-react";

// Universal reusable component for displaying any type of information
const InfoItem = ({
  label,
  value,
  type = "text",
  labelColor = "text-gray-600",
  valueColor = "text-gray-800",
  showCondition = true,
  customRenderer = null,
}) => {
  // Don't render if showCondition is false or value is falsy (for conditional rendering)
  if (!showCondition || (type === "conditional" && !value)) {
    return null;
  }

  const renderValue = () => {
    if (customRenderer) {
      return customRenderer(value);
    }

    switch (type) {
      case "boolean":
        return (
          <span
            className={`font-semibold ${
              value ? "text-green-600" : "text-gray-600"
            }`}
          >
            {value ? "Yes ✓" : "No"}
          </span>
        );
      case "text":
      case "conditional":
      default:
        return (
          <span className={`font-semibold ${valueColor}`}>
            {value || "N/A"}
          </span>
        );
    }
  };

  return (
    <div className="flex justify-between bg-white rounded-lg p-2">
      <span className={`font-medium ${labelColor}`}>{label}:</span>
      {renderValue()}
    </div>
  );
};

// Enhanced generic component that renders items in a responsive grid
const DetailSectionCard = ({
  title,
  items,
  data,
  className = "",
  showIcon = false,
  iconComponent = AlertCircle,
  iconColor = "text-red-500",
  containerBg = "bg-red-50",
  containerBorder = "border-red-200",
  gridCols = {
    default: 2, // 2 columns by default
    md: 3, // 3 columns on medium screens and up
    lg: 4, // 4 columns on large screens and up
    xl: 5, // 5 columns on extra large screens and up
  },
}) => {
  const IconComponent = iconComponent;

  // Build grid classes based on gridCols configuration
  const getGridClasses = () => {
    let classes = `grid gap-3 text-sm`;

    if (gridCols.default) classes += ` grid-cols-${gridCols.default}`;
    if (gridCols.sm) classes += ` sm:grid-cols-${gridCols.sm}`;
    if (gridCols.md) classes += ` md:grid-cols-${gridCols.md}`;
    if (gridCols.lg) classes += ` lg:grid-cols-${gridCols.lg}`;
    if (gridCols.xl) classes += ` xl:grid-cols-${gridCols.xl}`;
    if (gridCols["2xl"]) classes += ` 2xl:grid-cols-${gridCols["2xl"]}`;

    return classes;
  };

  // Filter out items that shouldn't be shown
  const visibleItems = items.filter((item) => {
    if (item.showCondition === false) return false;
    if (item.type === "conditional" && !data[item.key]) return false;
    return true;
  });

  if (visibleItems.length === 0) return null;

  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          {showIcon && <IconComponent className={`w-5 h-5 ${iconColor}`} />}
          {title}
        </h3>
      )}
      <div
        className={`${containerBg} rounded-xl p-4 border ${containerBorder}`}
      >
        <div className={getGridClasses()}>
          {visibleItems.map((item) => (
            <InfoItem
              key={item.key}
              label={item.label}
              value={data[item.key]}
              type={item.type || "text"}
              labelColor={item.labelColor}
              valueColor={item.valueColor}
              showCondition={item.showCondition !== false}
              customRenderer={item.customRenderer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailSectionCard;

// Configuration for different sections
export const getDietaryItems = () => [
  {
    label: "Vegan",
    key: "isVegan",
    type: "boolean",
    labelColor: "text-red-600",
  },
  {
    label: "Gluten Free",
    key: "isGlutenFree",
    type: "boolean",
    labelColor: "text-red-600",
  },
  {
    label: "Sugar Free",
    key: "isSugarFree",
    type: "boolean",
    labelColor: "text-red-600",
  },
  {
    label: "Lactose Free",
    key: "isLactoseFree",
    type: "boolean",
    labelColor: "text-red-600",
  },
  {
    label: "Jain Friendly",
    key: "isJainFriendly",
    type: "boolean",
    labelColor: "text-red-600",
  },
  {
    label: "Organic",
    key: "isOrganic",
    type: "boolean",
    labelColor: "text-red-600",
  },
  {
    label: "Kids Friendly",
    key: "isKidsFriendly",
    type: "boolean",
    labelColor: "text-red-600",
  },
];

export const getAdditionalDetails = () => [
  {
    label: "Menu Category",
    key: "menuCategory",
    type: "conditional",
  },
  {
    label: "Meal Type",
    key: "mealType",
    type: "conditional",
  },
  {
    label: "Cuisine Type",
    key: "cuisineType",
    type: "conditional",
  },
  {
    label: "Spice Level",
    key: "spiceLevel",
    type: "conditional",
  },
];

export const getPreparationItems = () => [
  {
    label: "Preparation Method",
    key: "preparationMethod",
    type: "conditional",
  },
  { label: "Cooking Style", key: "cookingStyle", type: "conditional" },
  { label: "Taste Profile", key: "tasteProfile", type: "conditional" },
  { label: "Texture", key: "texture", type: "conditional" },
];

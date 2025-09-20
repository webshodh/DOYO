// src/components/atoms/CategoryBadge/CategoryBadge.jsx
import React, { memo } from "react";

const CategoryBadge = memo(
  ({
    categoryType,
    variant = "indicator", // "indicator" | "logo"
    size = "sm",
    position = "relative", // "relative" | "absolute"
    className = "",
  }) => {
    // Normalize category type
    const normalizedType = categoryType?.toLowerCase();
    const isVeg = normalizedType === "veg" || normalizedType === "vegetarian";
    const isNonVeg = [
      "nonveg",
      "non veg",
      "non-veg",
      "non vegetarian",
      "meat",
    ].includes(normalizedType);

    // Return null if category type is not recognized
    if (!isVeg && !isNonVeg) return null;

    // Size configurations
    const sizeClasses = {
      xs: {
        container: "w-3 h-3",
        dot: "w-1 h-1",
        logo: "w-2 h-2",
        border: "border",
      },
      sm: {
        container: "w-4 h-4",
        dot: "w-1.5 h-1.5",
        logo: "w-3 h-3",
        border: "border-2",
      },
      md: {
        container: "w-5 h-5",
        dot: "w-2 h-2",
        logo: "w-4 h-4",
        border: "border-2",
      },
      lg: {
        container: "w-6 h-6",
        dot: "w-2.5 h-2.5",
        logo: "w-5 h-5",
        border: "border-2",
      },
    };

    // Position classes
    const positionClasses = {
      relative: "",
      absolute: "absolute top-2 right-4 z-10",
    };

    // Color scheme
    const colors = {
      veg: {
        border: "border-green-500",
        bg: "bg-green-500",
        label: "Vegetarian",
      },
      nonveg: {
        border: "border-red-500",
        bg: "bg-red-500",
        label: "Non-vegetarian",
      },
    };

    const colorScheme = isVeg ? colors.veg : colors.nonveg;
    const currentSize = sizeClasses[size];

    // Indicator variant (dot style)
    if (variant === "indicator") {
      return (
        <div
          className={`
          ${currentSize.container} 
          ${currentSize.border}
          ${colorScheme.border}
          ${positionClasses[position]}
          bg-white rounded-sm flex items-center justify-center
          ${className}
        `}
          aria-label={`${colorScheme.label} item`}
          role="img"
          title={colorScheme.label}
        >
          <div
            className={`
            ${currentSize.dot} 
            ${colorScheme.bg} 
            rounded-full
          `}
          />
        </div>
      );
    }

    // Logo variant (image style)
    if (variant === "logo") {
      const logoSrc = isVeg ? "/veglogo.jpeg" : "/nonVeglogo.png";

      return (
        <div className={`${positionClasses[position]} ${className}`}>
          <div>
            <img
              src={logoSrc}
              alt={colorScheme.label}
              className={currentSize.logo}
              title={colorScheme.label}
              loading="lazy"
            />
          </div>
        </div>
      );
    }

    return null;
  }
);

CategoryBadge.displayName = "CategoryBadge";

export default CategoryBadge;


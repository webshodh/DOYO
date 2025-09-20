// src/components/atoms/CategoryBadge/CategoryBadge.jsx

import {
  COLOR_CLASSES,
  NORMALIZED_NONVEG,
  NORMALIZED_VEG,
  POSITION_CLASSES,
  SIZE_CLASSES,
} from "Constants/constant";
import React, { memo, useMemo } from "react";

function normalizeType(input) {
  const key = input?.toLowerCase().trim();
  if (NORMALIZED_VEG.includes(key)) return "veg";
  if (NORMALIZED_NONVEG.includes(key)) return "nonveg";
  return null;
}

const CategoryBadge = memo(
  ({
    categoryType,
    variant = "indicator", // "indicator" | "logo"
    size = "sm",
    position = "relative", // "relative" | "absolute"
    className = "",
  }) => {
    const typeKey = useMemo(() => normalizeType(categoryType), [categoryType]);
    if (!typeKey) return null;

    const sizeCls = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
    const posCls = POSITION_CLASSES[position] || "";
    const colors = COLOR_CLASSES[typeKey];

    if (variant === "indicator") {
      return (
        <div
          className={`${sizeCls.container} ${colors.border} ${posCls} bg-white rounded-sm flex items-center justify-center ${className}`}
          aria-label={`${colors.label} item`}
          role="img"
          title={colors.label}
        >
          <div className={`${sizeCls.dot} ${colors.bg} rounded-full`} />
        </div>
      );
    }

    if (variant === "logo") {
      const logoSrc = typeKey === "veg" ? "/veglogo.jpeg" : "/nonVeglogo.png";
      return (
        <div className={`${posCls} ${className}`}>
          <img
            src={logoSrc}
            alt={colors.label}
            title={colors.label}
            className={sizeCls.logo}
            loading="lazy"
          />
        </div>
      );
    }

    return null;
  }
);

CategoryBadge.displayName = "CategoryBadge";

export default CategoryBadge;

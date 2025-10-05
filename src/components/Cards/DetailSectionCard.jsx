import React, { useMemo, memo, forwardRef } from "react";
import { AlertCircle, Info } from "lucide-react";
import { DETAIL_SECTION_COLOR_THEMES } from "Constants/Themes/detailSectionColorThemes";
import InfoItemSkeleton from "atoms/Skeleton/InfoItemSkeleton";
import InfoItem from "components/InfoItem";
import { GRID_LAYOUTS } from "Constants/Themes/gridLayouts";

// Import constants and components

const DetailSectionCard = memo(
  forwardRef(
    (
      {
        title = "",
        items = [],
        data = {},
        className = "",
        showIcon = false,
        iconComponent = AlertCircle,
        colorScheme = "red",
        gridLayout = "balanced",
        customGridCols = null,
        isLoading = false,
        showBorder = true,
        showTitle = true,
        emptyStateMessage = "No information available",
        showEmptyState = true,
        onItemClick,
        testId,
        ...rest
      },
      ref
    ) => {
      const IconComponent = iconComponent;

      // Memoized color theme
      const colors = useMemo(
        () =>
          DETAIL_SECTION_COLOR_THEMES[colorScheme] ||
          DETAIL_SECTION_COLOR_THEMES.red,
        [colorScheme]
      );

      // Memoized grid configuration
      const gridConfig = useMemo(
        () =>
          customGridCols || GRID_LAYOUTS[gridLayout] || GRID_LAYOUTS.balanced,
        [gridLayout, customGridCols]
      );

      // Memoized grid classes
      const gridClasses = useMemo(() => {
        let classes = "grid gap-3 text-sm";

        Object.entries(gridConfig).forEach(([breakpoint, cols]) => {
          if (breakpoint === "default") {
            classes += ` grid-cols-${cols}`;
          } else {
            classes += ` ${breakpoint}:grid-cols-${cols}`;
          }
        });

        return classes;
      }, [gridConfig]);

      // Memoized visible items with proper validation
      const visibleItems = useMemo(() => {
        if (!Array.isArray(items)) return [];

        return items.filter((item) => {
          if (!item || typeof item !== "object") return false;
          if (item.showCondition === false) return false;
          if (item.type === "conditional" && !data?.[item.key]) return false;
          return true;
        });
      }, [items, data]);

      // Show loading state
      if (isLoading) {
        return (
          <div className={`mb-6 ${className}`} ref={ref}>
            {showTitle && title && (
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse" />
              </div>
            )}
            <div
              className={`${colors.bg} rounded-xl p-4 ${
                showBorder ? `border ${colors.border}` : ""
              }`}
            >
              <div className={gridClasses}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InfoItemSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        );
      }

      // Show empty state if no visible items
      if (visibleItems.length === 0) {
        if (!showEmptyState) return null;

        return (
          <div className={`mb-6 ${className}`} ref={ref}>
            {showTitle && title && (
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                {showIcon && (
                  <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                )}
                {title}
              </h3>
            )}
            <div
              className={`${colors.bg} rounded-xl p-4 ${
                showBorder ? `border ${colors.border}` : ""
              } text-center`}
            >
              <div className="py-8">
                <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{emptyStateMessage}</p>
              </div>
            </div>
          </div>
        );
      }

      // Event handler for item clicks
      const handleItemClick = (item, value) => {
        if (onItemClick) {
          onItemClick(item, value, data);
        }
      };

      return (
        <div
          className={`mb-6 ${className}`}
          ref={ref}
          data-testid={testId}
          {...rest}
        >
          {showTitle && title && (
            <h3
              className={`text-lg font-semibold ${colors.title} mb-3 flex items-center gap-2`}
            >
              {showIcon && (
                <IconComponent className={`w-5 h-5 ${colors.icon}`} />
              )}
              {title}
            </h3>
          )}
          <div
            className={`${colors.bg} rounded-xl p-4 ${
              showBorder ? `border ${colors.border}` : ""
            } transition-all duration-200`}
          >
            <div className={gridClasses}>
              {visibleItems.map((item) => (
                <InfoItem
                  key={item.key}
                  label={item.label}
                  value={data?.[item.key]}
                  type={item.type || "text"}
                  labelColor={item.labelColor}
                  valueColor={item.valueColor}
                  showCondition={item.showCondition !== false}
                  customRenderer={item.customRenderer}
                  isLoading={item.isLoading}
                  highlightValue={item.highlightValue}
                  icon={item.icon}
                  onClick={
                    onItemClick
                      ? () => handleItemClick(item, data?.[item.key])
                      : undefined
                  }
                  testId={`info-item-${item.key}`}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }
  )
);

DetailSectionCard.displayName = "DetailSectionCard";

// Default props
DetailSectionCard.defaultProps = {
  title: "",
  items: [],
  data: {},
  className: "",
  showIcon: false,
  iconComponent: AlertCircle,
  colorScheme: "red",
  gridLayout: "balanced",
  isLoading: false,
  showBorder: true,
  showTitle: true,
  emptyStateMessage: "No information available",
  showEmptyState: true,
};

export default DetailSectionCard;

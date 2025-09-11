import React, { useMemo, memo, forwardRef } from "react";
import { Clock } from "lucide-react";
import { QUICK_INFO_COLOR_THEMES } from "Constants/Themes/quickInfoColorThemes";
import { QUICK_INFO_SIZE_VARIANTS } from "Constants/Themes/quickInfoSizeVariants";
import { LAYOUT_VARIANTS } from "Constants/Themes/layoutVariants";
import LoadingSpinner from "Atoms/LoadingSpinner";
import ErrorState from "components/ErrorState";

// Import constants and components


const QuickInfoCard = memo(
  forwardRef(
    (
      {
        icon: Icon = Clock,
        label = "",
        value = "",
        colorScheme = "blue",
        size = "medium",
        layout = "horizontal",
        className = "",
        onClick,
        onHover,
        isLoading = false,
        hasError = false,
        errorMessage,
        showAnimation = false,
        showBorder = true,
        showShadow = false,
        isInteractive = false,
        ariaLabel,
        testId,
        ...rest
      },
      ref
    ) => {
      // Memoized color theme
      const colors = useMemo(
        () => QUICK_INFO_COLOR_THEMES[colorScheme] || QUICK_INFO_COLOR_THEMES.blue,
        [colorScheme]
      );

      // Memoized size configuration
      const sizeConfig = useMemo(
        () => QUICK_INFO_SIZE_VARIANTS[size] || QUICK_INFO_SIZE_VARIANTS.medium,
        [size]
      );

      // Memoized layout configuration
      const layoutConfig = useMemo(
        () => LAYOUT_VARIANTS[layout] || LAYOUT_VARIANTS.horizontal,
        [layout]
      );

      // Handle loading state
      if (isLoading) {
        return <LoadingSpinner size={size} />;
      }

      // Handle error state
      if (hasError) {
        return <ErrorState size={size} message={errorMessage} />;
      }

      // Validate required props
      if (!Icon || typeof Icon !== "function") {
        console.warn("QuickInfoCard: Invalid icon prop provided");
        return <ErrorState size={size} message="Invalid icon" />;
      }

      // Build dynamic classes
      const containerClasses = [
        colors.bg,
        "rounded-xl",
        "transition-all",
        "duration-200",
        "ease-in-out",
        sizeConfig.container,
        showBorder ? colors.border : "",
        showBorder ? "border" : "",
        showShadow ? "shadow-sm" : "",
        showAnimation ? "transform hover:scale-105" : "",
        isInteractive
          ? `cursor-pointer ${colors.shadowHover} hover:shadow-md ${colors.ringFocus} focus:outline-none focus:ring-2 focus:ring-offset-2`
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ");

      const contentClasses = ["flex", layoutConfig, sizeConfig.gap].join(" ");

      // Event handlers
      const handleClick = (e) => {
        if (onClick && isInteractive) {
          onClick(e);
        }
      };

      const handleKeyDown = (e) => {
        if (isInteractive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick(e);
        }
      };

      const handleMouseEnter = (e) => {
        if (onHover) {
          onHover(e, "enter");
        }
      };

      const handleMouseLeave = (e) => {
        if (onHover) {
          onHover(e, "leave");
        }
      };

      return (
        <div
          ref={ref}
          className={containerClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role={isInteractive ? "button" : "presentation"}
          tabIndex={isInteractive ? 0 : -1}
          aria-label={ariaLabel || `${label}: ${value}`}
          data-testid={testId}
          {...rest}
        >
          <div className={contentClasses}>
            <Icon
              className={`${sizeConfig.icon} ${colors.iconColor} flex-shrink-0`}
              aria-hidden="true"
            />
            <div className={layout === "horizontal" ? "" : "mt-1"}>
              <p
                className={`${sizeConfig.label} ${colors.labelColor} font-medium leading-tight`}
              >
                {label}
              </p>
              <p
                className={`${sizeConfig.value} font-bold ${colors.valueColor} leading-tight`}
              >
                {value}
              </p>
            </div>
          </div>
        </div>
      );
    }
  )
);

QuickInfoCard.displayName = "QuickInfoCard";

// Default props
QuickInfoCard.defaultProps = {
  icon: Clock,
  label: "",
  value: "",
  colorScheme: "blue",
  size: "medium",
  layout: "horizontal",
  className: "",
  isLoading: false,
  hasError: false,
  showAnimation: false,
  showBorder: true,
  showShadow: false,
  isInteractive: false,
};

export default QuickInfoCard;

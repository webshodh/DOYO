import React, { useMemo, memo, forwardRef } from "react";
import { Activity } from "lucide-react";
import { COLOR_THEMES } from "Constants/Themes/colorThemes";
import { SIZE_VARIANTS } from "Constants/Themes/sizeVariants";
import LoadingSpinner from "atoms/LoadingSpinner";
import ErrorState from "atoms/Messages/ErrorState";
import IconContainer from "atoms/IconContainer";
import ValueDisplay from "atoms/ValueDisplay";

// Import constants and components

// Main NutritionCard component with forwardRef
const NutritionCard = memo(
  forwardRef(
    (
      {
        icon: Icon = Activity,
        label = "",
        value = "",
        unit = "",
        colorScheme = "green",
        size = "medium",
        showLetter = false,
        letter = "",
        className = "",
        onClick,
        onHover,
        isLoading = false,
        hasError = false,
        errorMessage = "Failed to load nutrition data",
        showBorder = true,
        useGradientIcon = false,
        isInteractive = false,
        showAnimation = false,
        ariaLabel,
        testId,
        ...rest
      },
      ref
    ) => {
      // Memoized configurations
      const colors = useMemo(
        () => COLOR_THEMES[colorScheme] || COLOR_THEMES.green,
        [colorScheme]
      );

      const sizeConfig = useMemo(
        () => SIZE_VARIANTS[size] || SIZE_VARIANTS.medium,
        [size]
      );

      // Handle loading state
      if (isLoading) {
        return <LoadingSpinner size={size} colorScheme={colorScheme} />;
      }

      // Handle error state
      if (hasError) {
        return <ErrorState size={size} message={errorMessage} />;
      }

      // Validate props
      if (!label) {
        console.warn("NutritionCard: label prop is required");
      }

      if (value === "" || value === null || value === undefined) {
        console.warn("NutritionCard: value prop should not be empty");
      }

      // Build dynamic classes
      const containerClasses = [
        "bg-white",
        "rounded-lg",
        sizeConfig.container,
        "flex",
        "items-start",
        sizeConfig.gap,
        "shadow-sm",
        "transition-all",
        "duration-200",
        "ease-in-out",
        showBorder ? `border ${colors.border}` : "",
        isInteractive
          ? `cursor-pointer ${colors.hoverShadow} hover:shadow-md ${colors.focusRing} focus:outline-none focus:ring-2 focus:ring-offset-2`
          : "hover:shadow-md",
        showAnimation ? "transform hover:scale-[1.02]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ");

      // Event handlers
      const handleClick = (e) => {
        if (onClick && (isInteractive || onClick)) {
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
          role={isInteractive ? "button" : "group"}
          tabIndex={isInteractive ? 0 : -1}
          aria-label={ariaLabel || `${label}: ${value} ${unit}`.trim()}
          data-testid={testId}
          {...rest}
        >
          <IconContainer
            Icon={Icon}
            showLetter={showLetter}
            letter={letter}
            label={label}
            colors={colors}
            sizeConfig={sizeConfig}
            useGradient={useGradientIcon}
          />

          <div className="flex-1 min-w-0">
            <ValueDisplay
              value={value}
              unit={unit}
              colors={colors}
              sizeConfig={sizeConfig}
            />
            <p
              className={`${sizeConfig.labelText} ${colors.textPrimary} font-medium capitalize mt-1 leading-tight select-text`}
            >
              {label}
            </p>
          </div>
        </div>
      );
    }
  )
);

NutritionCard.displayName = "NutritionCard";

// Default props
NutritionCard.defaultProps = {
  icon: Activity,
  label: "",
  value: "",
  unit: "",
  colorScheme: "green",
  size: "medium",
  showLetter: false,
  letter: "",
  className: "",
  isLoading: false,
  hasError: false,
  errorMessage: "Failed to load nutrition data",
  showBorder: true,
  useGradientIcon: false,
  isInteractive: false,
  showAnimation: false,
};

export default NutritionCard;

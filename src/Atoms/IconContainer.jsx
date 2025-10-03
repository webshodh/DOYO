import React, { memo } from "react";

const IconContainer = memo(
  ({
    Icon,
    showLetter,
    letter,
    label,
    colors,
    sizeConfig,
    useGradient = false,
  }) => {
    const displayLetter =
      letter || (label ? label.charAt(0).toUpperCase() : "");

    return (
      <div
        className={`${sizeConfig.iconContainer} ${
          useGradient ? colors.bgGradient : colors.bg
        } rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 hover:scale-105`}
        style={{ marginTop: "15px" }}
      >
        {showLetter ? (
          <span
            className="text-white text-xs font-bold select-none"
            aria-hidden="true"
          >
            {displayLetter}
          </span>
        ) : (
          Icon && (
            <Icon
              className={`${sizeConfig.icon} text-white`}
              aria-hidden="true"
            />
          )
        )}
      </div>
    );
  },
);

IconContainer.displayName = "IconContainer";

export default IconContainer;

import React, { useState, useCallback, memo } from "react";
import { ImageIcon } from "lucide-react";
import LoadingSpinner from "../atoms/LoadingSpinner";

const MenuImage = memo(
  ({
    imageUrl,
    menuName,
    onLoad,
    isUnavailable,
    className = "w-28 sm:w-32",
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
      if (onLoad) onLoad();
    }, [onLoad]);

    const handleError = useCallback((e) => {
      setIsLoading(false);
      setHasError(true);
      e.target.src = "/dish.png";
    }, []);

    return (
      <div
        className={`flex-shrink-0 ${className} relative overflow-hidden bg-gray-100`}
      >
        {isLoading && <LoadingSpinner size="lg" text="Loading..." />}

        <img
          src={imageUrl || "/dish.png"}
          alt={menuName || "Menu item"}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
        />
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
        )}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm z-50">
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg">
              Unavailable
            </span>
          </div>
        )}
      </div>
    );
  },
);

MenuImage.displayName = "MenuImage";

export default MenuImage;

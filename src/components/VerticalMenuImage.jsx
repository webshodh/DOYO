// Enhanced MenuImage component with LoadingSpinner
import React, { useState, useCallback, useMemo, memo } from "react";
import { ImageIcon, AlertCircle } from "lucide-react";
import LoadingSpinner from "Atoms/LoadingSpinner";
const VerticalMenuImage = memo(
  ({ imageUrl, menuName, onLoad, isUnavailable }) => {
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
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {isLoading && <LoadingSpinner />}

        <img
          src={imageUrl || "/dish.png"}
          alt={menuName}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
        />

        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ImageIcon size={32} className="text-gray-400" />
          </div>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
              <span className="bg-red-500 text-white px-4 py-2 text-sm font-bold rounded-full">
                Currently Unavailable
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VerticalMenuImage.displayName = "VerticalMenuImage";

export default VerticalMenuImage
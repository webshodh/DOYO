import React, { useState, useCallback, memo } from "react";
import { ChefHat, AlertCircle, CheckCircle, ImageIcon } from "lucide-react";
import LoadingSpinner from "atoms/LoadingSpinner";

const ImageHeader = memo(
  ({ imageUrl, menuName, availability, isLoading = false }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(true);
    }, []);

    const isAvailable = availability === "Available";

    return (
      <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        {/* Image */}
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            alt={menuName}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="text-center">
                {imageError ? (
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                ) : (
                  <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                )}
                <p className="text-gray-500 text-sm">
                  {imageError ? "Image not available" : "No image"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {!imageLoaded && imageUrl && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <LoadingSpinner />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Availability badge */}
        <div className="absolute bottom-4 right-4">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-sm ${
              isAvailable
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Available
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Not Available
              </>
            )}
          </span>
        </div>
      </div>
    );
  }
);

ImageHeader.displayName = "ImageHeader";

export default ImageHeader;

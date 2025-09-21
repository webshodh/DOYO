import React, { useState, useCallback, useMemo, memo } from "react";
import { Clock, Users, Zap, AlertCircle } from "lucide-react";

// Import all the extracted components
import MenuModal from "../MenuModal";
import PriorityBadge from "atoms/Badges/PriorityBadge";
import DiscountBadge from "atoms/Badges/DiscountBadge";
import MenuImage from "components/MenuImage";
import SpiceLevelIndicator from "atoms/Badges/SpiceLevelIndicator";
import SpecialFeatures from "atoms/Badges/SpecialFeatures";
import PriceDisplay from "atoms/PriceDisplay";
import ActionButton from "atoms/Buttons/ActionButton";
import CategoryBadge from "atoms/Badges/CategoryBadge";
import SpecialBadges from "atoms/Badges/SpecialBadges";

// Utility function for text truncation
const truncateText = (text, maxLength = 12) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

// Main HorizontalMenuCard component
const HorizontalMenuCard = memo(
  ({ item, handleImageLoad, onCardClick, className = "", height = "h-44" }) => {
    const [show, setShow] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const isVeg = item.categoryType === "Veg" || item.categoryType === "veg";

    // Memoized computed values
    const isAvailable = useMemo(
      () => item?.availability === "Available",
      [item?.availability]
    );

    const truncatedName = useMemo(
      () => truncateText(item?.menuName, 20),
      [item?.menuName]
    );

    const truncatedCategory = useMemo(
      () => truncateText(item?.menuCategory, 12),
      [item?.menuCategory]
    );

    // Event handlers
    const handleShow = useCallback(
      async (menuItem) => {
        if (!isAvailable) return;

        setIsButtonLoading(true);

        try {
          // Simulate loading delay for better UX
          await new Promise((resolve) => setTimeout(resolve, 150));
          setModalData(menuItem);
          setShow(true);
          onCardClick?.(menuItem);
        } catch (error) {
          console.error("Error opening modal:", error);
        } finally {
          setIsButtonLoading(false);
        }
      },
      [isAvailable, onCardClick]
    );

    const handleClose = useCallback(() => {
      setShow(false);
      setModalData(null);
    }, []);

    const handleCardClick = useCallback(
      (e) => {
        // Prevent modal opening when clicking interactive elements
        if (e.target.closest("button") || e.target.closest("a")) {
          return;
        }
        handleShow(item);
      },
      [handleShow, item]
    );

    // Validate item prop
    if (!item || typeof item !== "object") {
      return (
        <div className={`w-full ${height} ${className}`}>
          <div className="h-full bg-gray-100 rounded-2xl p-4 text-center flex items-center justify-center">
            <div>
              <AlertCircle size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Invalid menu item</p>
            </div>
          </div>
        </div>
      );
    }
    console.log("discount", item);
    return (
      <article className={`w-full ${height} ${className}`}>
        <div
          className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100 hover:border-orange-200 cursor-pointer"
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleShow(item);
            }
          }}
          aria-label={`View details for ${item.menuName}`}
        >
          <div className="flex h-full">
            {/* Image Container */}
            <MenuImage
              imageUrl={item.imageUrl}
              menuName={item.menuName}
              onLoad={handleImageLoad}
              isUnavailable={!isAvailable}
            />

            {/* Overlay Badges on Image */}
            <PriorityBadge item={item} />
            <DiscountBadge discount={item.discount} />

            {/* Content Container */}
            <div className="flex-1 p-2 flex flex-col justify-between relative min-w-0">
              {/* Category Indicator */}
              {isVeg ? (
                <CategoryBadge
                  categoryType="veg"
                  variant="logo"
                  position="absolute"
                  size="md"
                />
              ) : (
                <CategoryBadge
                  categoryType="Non Veg"
                  variant="logo"
                  position="absolute"
                  size="md"
                />
              )}

              {/* Top Section */}
              <div className="flex-1 pr-6">
                {/* Menu Name */}
                <h3
                  className="text-base sm:text-lg font-bold text-gray-800 leading-tight mb-2 line-clamp-2"
                  title={item.menuName}
                >
                  {truncatedName}
                </h3>

                {/* Info Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Cooking Time */}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span className="font-medium">
                        {item.menuCookingTime || 15}min
                      </span>
                    </div>
                    {item.menuCategory && (
                      <span className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm border border-blue-200">
                        {truncatedCategory}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category and Features */}

                <div className="flex items-center justify-between">
                  {/* Spice Level */}
                  <SpiceLevelIndicator spiceLevel={item.spiceLevel} />

                  {item.servingSize && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3 text-blue-500" />
                      <span className="hidden sm:inline">
                        {item.servingSize}
                      </span>
                      <span className="sm:hidden">{item.servingSize}p</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="space-y-2">
                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <PriceDisplay item={item} />
                </div>

                {/* Action Button */}
                <ActionButton
                  isAvailable={isAvailable}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShow(item);
                  }}
                  isLoading={isButtonLoading}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Hover Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-transparent to-red-50 opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none" />

          {/* Animated glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none blur-sm" />
        </div>

        {/* Modal */}
        {show && modalData && (
          <MenuModal
            show={show}
            handleClose={handleClose}
            modalData={modalData}
          />
        )}
      </article>
    );
  }
);

HorizontalMenuCard.displayName = "HorizontalMenuCard";

// Default props
HorizontalMenuCard.defaultProps = {
  handleImageLoad: () => {},
  onCardClick: () => {},
  className: "",
  height: "h-44",
};

export default HorizontalMenuCard;

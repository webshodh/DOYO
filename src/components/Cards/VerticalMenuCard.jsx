import React, { useState, useCallback, useMemo, memo } from "react";
import { Clock, Users, Zap, Eye, AlertCircle } from "lucide-react";

import MenuModal from "../MenuModal";
import VerticalMenuImage from "components/VerticalMenuImage";
import PriorityBadge from "atoms/Badges/PriorityBadge";
import DiscountBadge from "atoms/Badges/DiscountBadge";
import SpecialFeatures from "atoms/Badges/SpecialFeatures";
import SpiceLevelIndicator from "atoms/Badges/SpiceLevelIndicator";
import PriceDisplay from "atoms/PriceDisplay";
import ActionButton from "atoms/Buttons/ActionButton";
import CategoryBadge from "atoms/Badges/CategoryBadge";

const VerticalMenuCard = memo(
  ({
    item,
    handleImageLoad,
    onCardClick,
    className = "",
    height = "470px",
  }) => {
    const [show, setShow] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const isVeg = item.categoryType === "Veg" || item.categoryType === "veg";

    // Memoized computed values
    const isAvailable = useMemo(
      () => item?.availability === "Available",
      [item?.availability],
    );

    const truncatedName = useMemo(
      () =>
        item?.menuName?.length > 25
          ? `${item.menuName.slice(0, 25)}...`
          : item?.menuName || "Menu Item",
      [item?.menuName],
    );

    // Event handlers
    const handleShow = useCallback(
      async (menuItem) => {
        if (!isAvailable) return;

        setIsButtonLoading(true);

        try {
          // Simulate loading delay for better UX
          await new Promise((resolve) => setTimeout(resolve, 200));
          setModalData(menuItem);
          setShow(true);
          onCardClick?.(menuItem);
        } catch (error) {
          console.error("Error opening modal:", error);
        } finally {
          setIsButtonLoading(false);
        }
      },
      [isAvailable, onCardClick],
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
      [handleShow, item],
    );

    // Validate item prop
    if (!item || typeof item !== "object") {
      return (
        <div className={`w-full max-w-sm mx-auto ${className}`}>
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Invalid menu item</p>
          </div>
        </div>
      );
    }

    return (
      <article className={`w-full max-w-sm mx-auto ${className}`}>
        <div
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden relative group border border-gray-100 cursor-pointer"
          style={{ height }}
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
          {/* Image Container */}
          <VerticalMenuImage
            imageUrl={item.imageUrl}
            menuName={item.menuName}
            onLoad={handleImageLoad}
            isUnavailable={!isAvailable}
          />

          {/* Overlay Badges */}
          <PriorityBadge item={item} />
          <DiscountBadge discount={item.discount} />
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

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Menu Name */}
            <h2 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2">
              {truncatedName}
            </h2>

            {/* Category and Special Features */}
            <div className="space-y-2">
              <div className="flex items-center flex-wrap gap-2">
                {item.menuCategory && (
                  <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                    {item.menuCategory}
                  </span>
                )}
                <SpecialFeatures item={item} maxFeatures={2} />
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  {item.menuCookingTime || 15}min
                </span>
              </div>

              <SpiceLevelIndicator spiceLevel={item.spiceLevel} />

              {item.calories && (
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs">{item.calories} kcal</span>
                </div>
              )}
            </div>

            {/* Price and Serving Info */}
            <div className="flex items-center justify-between">
              <PriceDisplay item={item} />

              {item.servingSize && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Serves {item.servingSize}</span>
                </div>
              )}
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

          {/* Hover Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-200 rounded-xl transition-colors duration-300 pointer-events-none" />
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
  },
);

VerticalMenuCard.displayName = "VerticalMenuCard";

// Default props
VerticalMenuCard.defaultProps = {
  handleImageLoad: () => {},
  onCardClick: () => {},
  className: "",
  height: "470px",
};

export default VerticalMenuCard;

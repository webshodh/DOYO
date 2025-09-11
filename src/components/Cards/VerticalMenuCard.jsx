import React, { useState, useCallback, useMemo, memo } from "react";
import { Clock, Users, Zap, Eye, AlertCircle } from "lucide-react";

import MenuModal from "../MenuModal";
import VerticalMenuImage from "components/VerticalMenuImage";
import PriorityBadge from "Atoms/PriorityBadge";
import DiscountBadge from "Atoms/DiscountBadge";
import CategoryIndicator from "components/CategoryIndicator";
import SpecialFeatures from "components/SpecialFeatures";
import SpiceLevelIndicator from "Atoms/SpiceLevelIndicator";
import PriceDisplay from "Atoms/PriceDisplay";
import ActionButton from "Atoms/ActionButton";

// Import reusable components from previous extractions

// Enhanced ActionButton for vertical layout
// const VerticalActionButton = memo(
//   ({ isAvailable, onClick, isLoading = false }) => {
//     return (
//       <button
//         onClick={onClick}
//         disabled={!isAvailable || isLoading}
//         className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//           isAvailable && !isLoading
//             ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-orange-500"
//             : "bg-gray-300 text-gray-500 cursor-not-allowed"
//         }`}
//         aria-label={
//           isAvailable ? "View menu item details" : "Item currently unavailable"
//         }
//       >
//         {isLoading ? (
//           <>
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//             Loading...
//           </>
//         ) : isAvailable ? (
//           <>
//             <Eye size={16} />
//             View Details
//           </>
//         ) : (
//           <>
//             <AlertCircle size={16} />
//             Unavailable
//           </>
//         )}
//       </button>
//     );
//   }
// );

// VerticalActionButton.displayName = "VerticalActionButton";

// Main VerticalMenuCard component
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

    // Memoized computed values
    const isAvailable = useMemo(
      () => item?.availability === "Available",
      [item?.availability]
    );

    const truncatedName = useMemo(
      () =>
        item?.menuName?.length > 25
          ? `${item.menuName.slice(0, 25)}...`
          : item?.menuName || "Menu Item",
      [item?.menuName]
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
          <CategoryIndicator categoryType={item.categoryType} />

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
  }
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

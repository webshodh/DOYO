import React, { useCallback, useMemo, memo, forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import DiscountBadge from "Atoms/DiscountBadge";
import VegIndicator from "Atoms/VegIndicator";
import PriceDisplay from "Atoms/PriceDisplay";
import QuantityControls from "Atoms/QuantityControls";
import AddToCartButton from "Atoms/AddToCartButton";
import AvailabilityOverlay from "Atoms/AvailabilityOverlay";

// Import reusable components


// Main CaptainMenuCard component
const CaptainMenuCard = memo(
  forwardRef(
    (
      {
        item,
        onAddToCart,
        quantity = 0, // Accept quantity as prop instead of calculating from cartItems
        className = "",
        showFullTitle = false,
        maxTitleLength = 20,
        currency = "₹",
        isLoading = false,
        onCardClick,
        testId,
        ...rest
      },
      ref
    ) => {
      // Memoized computations
      const isVeg = useMemo(() => {
        const categoryType = item?.categoryType?.toLowerCase();
        return categoryType === "veg" || categoryType === "vegetarian";
      }, [item?.categoryType]);

      const isAvailable = useMemo(
        () => item?.availability === "Available",
        [item?.availability]
      );

      const truncatedTitle = useMemo(() => {
        if (!item?.menuName) return "";
        if (showFullTitle || item.menuName.length <= maxTitleLength) {
          return item.menuName;
        }
        return `${item.menuName.slice(0, maxTitleLength)}...`;
      }, [item?.menuName, showFullTitle, maxTitleLength]);

      // Event handlers
      const handleAdd = useCallback(() => {
        if (onAddToCart && isAvailable) {
          onAddToCart(item, 1);
        }
      }, [onAddToCart, item, isAvailable]);

      const handleRemove = useCallback(() => {
        if (onAddToCart && isAvailable && quantity > 0) {
          onAddToCart(item, -1);
        }
      }, [onAddToCart, item, isAvailable, quantity]);

      const handleCardClick = useCallback(
        (e) => {
          // Don't trigger card click when clicking interactive elements
          if (e.target.closest("button") || e.target.closest("a")) {
            return;
          }
          if (onCardClick) {
            onCardClick(item, e);
          }
        },
        [onCardClick, item]
      );

      const handleKeyDown = useCallback(
        (e) => {
          if (onCardClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onCardClick(item, e);
          }
        },
        [onCardClick, item]
      );

      // Validate item prop
      if (!item || typeof item !== "object") {
        return (
          <div className={`w-full ${className}`}>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Invalid menu item</p>
            </div>
          </div>
        );
      }

      return (
        <article
          ref={ref}
          className={`w-full ${className}`}
          data-testid={testId}
          {...rest}
        >
          <div
            className={`bg-white rounded-lg shadow-sm hover:shadow-md p-3 transition-all duration-200 border border-gray-200 hover:border-orange-300 relative group ${
              onCardClick ? "cursor-pointer" : ""
            }`}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            role={onCardClick ? "button" : "article"}
            tabIndex={onCardClick ? 0 : -1}
            aria-label={
              onCardClick ? `View details for ${item.menuName}` : undefined
            }
          >
            {/* First Row: Menu Name, Discount Badge, and Veg/Non-Veg Symbol */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Menu Name */}
                <h3
                  className="text-sm font-semibold text-gray-800 truncate flex-1"
                  title={item.menuName}
                >
                  {truncatedTitle}
                </h3>

                {/* Discount Badge */}
                <DiscountBadge discount={item.discount} />
              </div>

              {/* Veg/Non-Veg Symbol */}
              <div className="flex-shrink-0 ml-2">
                <VegIndicator isVeg={isVeg} />
              </div>
            </div>

            {/* Second Row: Price and Add to Cart Button */}
            <div className="flex items-center justify-between">
              {/* Price Section */}
              <PriceDisplay
                originalPrice={item.menuPrice}
                finalPrice={item.finalPrice}
                discount={item.discount}
                currency={currency}
              />

              {/* Add to Cart Controls */}
              <div className="flex-shrink-0">
                {quantity > 0 ? (
                  <QuantityControls
                    quantity={quantity}
                    onIncrease={handleAdd}
                    onDecrease={handleRemove}
                    isAvailable={isAvailable}
                  />
                ) : (
                  <AddToCartButton
                    onClick={handleAdd}
                    isAvailable={isAvailable}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>

            {/* Availability Overlay */}
            <AvailabilityOverlay availability={item.availability} />

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none rounded-lg" />
          </div>
        </article>
      );
    }
  )
);

CaptainMenuCard.displayName = "CaptainMenuCard";

// Default props
CaptainMenuCard.defaultProps = {
  quantity: 0,
  className: "",
  showFullTitle: false,
  maxTitleLength: 20,
  currency: "₹",
  isLoading: false,
};

export default CaptainMenuCard;

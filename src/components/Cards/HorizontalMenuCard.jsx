// src/components/Cards/HorizontalMenuCard.jsx
import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import {
  Clock,
  Users,
  Zap,
  AlertCircle,
  Star,
  TrendingUp,
  Award,
  Flame,
  Eye,
  ShoppingCart,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

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
  ({
    item,
    handleImageLoad,
    onCardClick,
    className = "",
    height = "h-44",
    onAddToCart,
    quantity = 0,
    captainMode = false,
    showAnalytics = false,
    onQuickAdd,
  }) => {
    // ✅ NEW: Use context hooks
    const { currentUser } = useAuth();
    const { selectedHotel } = useHotelContext();

    // State management
    const [show, setShow] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [viewCount, setViewCount] = useState(item?.analytics?.views || 0);
    const [isTracking, setIsTracking] = useState(false);

    const isVeg = item.categoryType === "Veg" || item.categoryType === "veg";

    // ✅ ENHANCED: Memoized computed values with better logic
    const isAvailable = useMemo(
      () => item?.availability === "Available" && item?.stock !== 0,
      [item?.availability, item?.stock]
    );

    const truncatedName = useMemo(
      () => truncateText(item?.menuName, 20),
      [item?.menuName]
    );

    const truncatedCategory = useMemo(
      () => truncateText(item?.menuCategory, 12),
      [item?.menuCategory]
    );

    // ✅ NEW: Get special badges for the item
    const specialBadges = useMemo(() => {
      const badges = [];
      if (item.isRecommended)
        badges.push({ type: "recommended", icon: Star, color: "yellow" });
      if (item.isPopular)
        badges.push({ type: "popular", icon: TrendingUp, color: "blue" });
      if (item.isBestseller)
        badges.push({ type: "bestseller", icon: Award, color: "purple" });
      if (item.isSpicy)
        badges.push({ type: "spicy", icon: Flame, color: "red" });
      return badges;
    }, [item]);

    // ✅ NEW: Track menu item analytics
    const trackItemView = useCallback(
      async (menuItem) => {
        if (!menuItem.id || !selectedHotel?.id || isTracking) return;

        try {
          setIsTracking(true);

          const menuItemRef = doc(db, "menuItems", menuItem.id);

          // Update view count and analytics
          await updateDoc(menuItemRef, {
            "analytics.views": increment(1),
            "analytics.lastViewed": serverTimestamp(),
            "analytics.lastViewedBy": currentUser?.uid || "anonymous",
            "analytics.viewHistory": increment(1),
          });

          // ✅ NEW: Update local state
          setViewCount((prev) => prev + 1);
        } catch (error) {
          console.warn("Error tracking item view:", error);
          // Don't fail the UI for analytics
        } finally {
          setIsTracking(false);
        }
      },
      [selectedHotel?.id, currentUser?.uid, isTracking]
    );

    // ✅ ENHANCED: Event handlers with analytics
    const handleShow = useCallback(
      async (menuItem) => {
        if (!isAvailable) return;

        setIsButtonLoading(true);

        try {
          // Track item view
          await trackItemView(menuItem);

          // Simulate loading delay for better UX
          await new Promise((resolve) => setTimeout(resolve, 150));

          setModalData({
            ...menuItem,
            analytics: {
              ...menuItem.analytics,
              views: viewCount + 1,
            },
          });
          setShow(true);
          onCardClick?.(menuItem);
        } catch (error) {
          console.error("Error opening modal:", error);
        } finally {
          setIsButtonLoading(false);
        }
      },
      [isAvailable, onCardClick, trackItemView, viewCount]
    );

    const handleClose = useCallback(() => {
      setShow(false);
      setModalData(null);
    }, []);

    // ✅ NEW: Handle quick add to cart
    const handleQuickAdd = useCallback(
      async (e) => {
        e.stopPropagation();

        if (!isAvailable) return;

        try {
          if (onQuickAdd) {
            await onQuickAdd(item);
          } else if (onAddToCart) {
            await onAddToCart(item, 1);
          }

          // ✅ NEW: Track add to cart event
          if (item.id && selectedHotel?.id) {
            const menuItemRef = doc(db, "menuItems", item.id);
            await updateDoc(menuItemRef, {
              "analytics.addedToCart": increment(1),
              "analytics.lastAddedToCart": serverTimestamp(),
              "analytics.lastOrderedBy": currentUser?.uid || "anonymous",
            });
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      },
      [
        isAvailable,
        onQuickAdd,
        onAddToCart,
        item,
        selectedHotel?.id,
        currentUser?.uid,
      ]
    );

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

    // ✅ NEW: Get stock status
    const getStockStatus = () => {
      if (item.stock === 0)
        return { status: "out-of-stock", text: "Out of Stock", color: "red" };
      if (item.stock && item.stock <= 5)
        return { status: "low-stock", text: "Low Stock", color: "yellow" };
      return { status: "in-stock", text: "Available", color: "green" };
    };

    const stockStatus = getStockStatus();

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

    return (
      <article className={`w-full ${height} ${className} relative`}>
        <div
          className={`h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100 hover:border-orange-200 cursor-pointer ${
            !isAvailable ? "opacity-60" : ""
          }`}
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
            <div className="relative">
              <MenuImage
                imageUrl={item.imageUrl}
                menuName={item.menuName}
                onLoad={handleImageLoad}
                isUnavailable={!isAvailable}
                className="w-32 h-full object-cover"
              />

              {/* Overlay Badges on Image */}
              <PriorityBadge item={item} />
              <DiscountBadge discount={item.discount} />

              {/* ✅ NEW: Stock status badge */}
              {stockStatus.status !== "in-stock" && (
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                    stockStatus.color === "red"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {stockStatus.text}
                </div>
              )}

              {/* ✅ NEW: Quick action overlay on hover */}
              {isAvailable && (onAddToCart || onQuickAdd) && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={handleQuickAdd}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100"
                    title="Quick Add to Cart"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="flex-1 p-3 flex flex-col justify-between relative min-w-0">
              {/* Category Indicator */}
              <CategoryBadge
                categoryType={isVeg ? "veg" : "Non Veg"}
                variant="logo"
                position="absolute"
                size="md"
                className="top-2 right-2"
              />

              {/* Top Section */}
              <div className="flex-1 pr-8">
                {/* Menu Name */}
                <h3
                  className="text-base sm:text-lg font-bold text-gray-800 leading-tight mb-2 line-clamp-2"
                  title={item.menuName}
                >
                  {truncatedName}
                </h3>

                {/* ✅ NEW: Special badges row */}
                {specialBadges.length > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    {specialBadges.slice(0, 3).map((badge, index) => {
                      const Icon = badge.icon;
                      return (
                        <div
                          key={badge.type}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            badge.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : badge.color === "blue"
                              ? "bg-blue-100 text-blue-800"
                              : badge.color === "purple"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <Icon size={12} />
                          <span className="capitalize">{badge.type}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

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

                {/* Additional Info Row */}
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

                {/* ✅ NEW: Analytics display for captain mode */}
                {captainMode && showAnalytics && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{viewCount} views</span>
                    </div>
                    {item.analytics?.addedToCart && (
                      <div className="flex items-center gap-1">
                        <ShoppingCart size={12} />
                        <span>{item.analytics.addedToCart} orders</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Section */}
              <div className="space-y-2">
                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <PriceDisplay item={item} />

                  {/* ✅ NEW: Quantity indicator if added to cart */}
                  {quantity > 0 && (
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      {quantity} in cart
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
                  stockStatus={stockStatus}
                  quantity={quantity}
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
            onAddToCart={onAddToCart}
            quantity={quantity}
            captainMode={captainMode}
          />
        )}
      </article>
    );
  }
);

HorizontalMenuCard.displayName = "HorizontalMenuCard";

// ✅ ENHANCED: Default props with new options
HorizontalMenuCard.defaultProps = {
  handleImageLoad: () => {},
  onCardClick: () => {},
  className: "",
  height: "h-44",
  quantity: 0,
  captainMode: false,
  showAnalytics: false,
};

export default HorizontalMenuCard;

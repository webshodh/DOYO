// src/components/Cards/VerticalMenuCard.jsx
import React, { useState, useCallback, useMemo, memo } from "react";
import { 
  Clock, 
  Users, 
  Zap, 
  Eye, 
  AlertCircle, 
  Star, 
  TrendingUp, 
  Award, 
  Flame, 
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import { 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { toast } from "react-toastify";

// Components
import MenuModal from "../MenuModal";
import VerticalMenuImage from "components/VerticalMenuImage";
import PriorityBadge from "atoms/Badges/PriorityBadge";
import DiscountBadge from "atoms/Badges/DiscountBadge";
import SpecialFeatures from "atoms/Badges/SpecialFeatures";
import SpiceLevelIndicator from "atoms/Badges/SpiceLevelIndicator";
import PriceDisplay from "atoms/PriceDisplay";
import ActionButton from "atoms/Buttons/ActionButton";
import CategoryBadge from "atoms/Badges/CategoryBadge";
import LoadingSpinner from "../../atoms/LoadingSpinner";

const VerticalMenuCard = memo(
  ({
    item,
    handleImageLoad,
    onCardClick,
    className = "",
    height = "470px",
    onAddToCart,
    quantity = 0,
    captainMode = false,
    showAnalytics = false,
    showQuickActions = true,
    onFavorite,
    isFavorite = false,
    onShare,
  }) => {
    // ✅ NEW: Use context hooks
    const { currentUser } = useAuth();
    const { selectedHotel } = useHotelContext();

    // State management
    const [show, setShow] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [viewCount, setViewCount] = useState(item?.analytics?.views || 0);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isFavorited, setIsFavorited] = useState(isFavorite);

    const isVeg = item.categoryType === "Veg" || item.categoryType === "veg";

    // ✅ ENHANCED: Memoized computed values with better availability logic
    const isAvailable = useMemo(
      () => item?.availability === "Available" && item?.stock !== 0,
      [item?.availability, item?.stock]
    );

    const truncatedName = useMemo(
      () =>
        item?.menuName?.length > 25
          ? `${item.menuName.slice(0, 25)}...`
          : item?.menuName || "Menu Item",
      [item?.menuName]
    );

    // ✅ NEW: Get special badges for the item
    const specialBadges = useMemo(() => {
      const badges = [];
      if (item.isRecommended) badges.push({ type: 'recommended', icon: Star, color: 'yellow' });
      if (item.isPopular) badges.push({ type: 'popular', icon: TrendingUp, color: 'blue' });
      if (item.isBestseller) badges.push({ type: 'bestseller', icon: Award, color: 'purple' });
      if (item.isSpicy) badges.push({ type: 'spicy', icon: Flame, color: 'red' });
      return badges;
    }, [item]);

    // ✅ NEW: Get stock status with enhanced logic
    const getStockStatus = useCallback(() => {
      if (item.stock === 0) return { status: 'out-of-stock', text: 'Out of Stock', color: 'red' };
      if (item.stock && item.stock <= 5) return { status: 'low-stock', text: 'Low Stock', color: 'yellow' };
      if (item.stock && item.stock <= 10) return { status: 'limited', text: 'Limited Stock', color: 'orange' };
      return { status: 'in-stock', text: 'Available', color: 'green' };
    }, [item.stock]);

    const stockStatus = getStockStatus();

    // ✅ NEW: Track menu item analytics
    const trackItemView = useCallback(async (menuItem) => {
      if (!menuItem.id || !selectedHotel?.id || isTracking) return;

      try {
        setIsTracking(true);
        
        const menuItemRef = doc(db, 'menuItems', menuItem.id);
        
        // Update view count and analytics
        await updateDoc(menuItemRef, {
          'analytics.views': increment(1),
          'analytics.lastViewed': serverTimestamp(),
          'analytics.lastViewedBy': currentUser?.uid || 'anonymous',
          'analytics.dailyViews': increment(1),
          'analytics.viewHistory': arrayUnion({
            viewedAt: serverTimestamp(),
            viewedBy: currentUser?.uid || 'anonymous',
            source: captainMode ? 'captain_app' : 'customer_app'
          })
        });

        setViewCount(prev => prev + 1);

      } catch (error) {
        console.warn("Error tracking item view:", error);
      } finally {
        setIsTracking(false);
      }
    }, [selectedHotel?.id, currentUser?.uid, isTracking, captainMode]);

    // ✅ ENHANCED: Event handlers with analytics and cart management
    const handleShow = useCallback(
      async (menuItem) => {
        if (!isAvailable) return;

        setIsButtonLoading(true);

        try {
          // Track item view
          await trackItemView(menuItem);

          // Simulate loading delay for better UX
          await new Promise((resolve) => setTimeout(resolve, 200));
          
          setModalData({
            ...menuItem,
            analytics: {
              ...menuItem.analytics,
              views: viewCount + 1
            }
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

    // ✅ NEW: Handle add to cart with quantity management
    const handleAddToCart = useCallback(async (quantityChange = 1) => {
      if (!isAvailable || isAddingToCart) return;

      setIsAddingToCart(true);

      try {
        if (onAddToCart) {
          await onAddToCart(item, quantityChange);
        }

        // ✅ NEW: Track add to cart event
        if (item.id && selectedHotel?.id) {
          const menuItemRef = doc(db, 'menuItems', item.id);
          await updateDoc(menuItemRef, {
            'analytics.addedToCart': increment(quantityChange),
            'analytics.lastAddedToCart': serverTimestamp(),
            'analytics.lastOrderedBy': currentUser?.uid || 'anonymous',
            'analytics.cartActions': arrayUnion({
              action: quantityChange > 0 ? 'added' : 'removed',
              quantity: Math.abs(quantityChange),
              timestamp: serverTimestamp(),
              userId: currentUser?.uid || 'anonymous'
            })
          });
        }

        toast.success(
          quantityChange > 0 
            ? `Added ${item.menuName} to cart` 
            : `Removed ${item.menuName} from cart`
        );

      } catch (error) {
        console.error("Error managing cart:", error);
        toast.error("Failed to update cart");
      } finally {
        setIsAddingToCart(false);
      }
    }, [isAvailable, isAddingToCart, onAddToCart, item, selectedHotel?.id, currentUser?.uid]);

    // ✅ NEW: Handle favorite toggle
    const handleFavoriteToggle = useCallback(async (e) => {
      e.stopPropagation();

      if (!currentUser) {
        toast.error("Please login to add favorites");
        return;
      }

      try {
        setIsFavorited(!isFavorited);

        if (onFavorite) {
          await onFavorite(item, !isFavorited);
        }

        // Track favorite action
        if (item.id && selectedHotel?.id) {
          const menuItemRef = doc(db, 'menuItems', item.id);
          await updateDoc(menuItemRef, {
            'analytics.favorites': increment(isFavorited ? -1 : 1),
            'analytics.lastFavorited': serverTimestamp(),
          });
        }

        toast.success(
          isFavorited 
            ? `Removed ${item.menuName} from favorites` 
            : `Added ${item.menuName} to favorites`
        );

      } catch (error) {
        console.error("Error toggling favorite:", error);
        setIsFavorited(isFavorited); // Revert on error
        toast.error("Failed to update favorites");
      }
    }, [currentUser, isFavorited, onFavorite, item, selectedHotel?.id]);

    // ✅ NEW: Handle share
    const handleShare = useCallback(async (e) => {
      e.stopPropagation();

      try {
        const shareData = {
          title: item.menuName,
          text: `Check out ${item.menuName} at ${selectedHotel?.businessName || 'our restaurant'}!`,
          url: window.location.href,
        };

        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback: copy to clipboard
          const shareText = `${shareData.title}\n${shareData.text}`;
          await navigator.clipboard.writeText(shareText);
          toast.success('Item details copied to clipboard!');
        }

        if (onShare) {
          onShare(item);
        }

        // Track share action
        if (item.id && selectedHotel?.id) {
          const menuItemRef = doc(db, 'menuItems', item.id);
          await updateDoc(menuItemRef, {
            'analytics.shares': increment(1),
            'analytics.lastShared': serverTimestamp(),
          });
        }

      } catch (error) {
        console.error("Error sharing:", error);
      }
    }, [item, selectedHotel, onShare]);

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
      <article className={`w-full max-w-sm mx-auto ${className} relative`}>
        <div
          className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden relative group border border-gray-100 cursor-pointer ${
            !isAvailable ? 'opacity-60' : ''
          }`}
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
          <div className="relative">
            <VerticalMenuImage
              imageUrl={item.imageUrl}
              menuName={item.menuName}
              onLoad={handleImageLoad}
              isUnavailable={!isAvailable}
            />

            {/* Overlay Badges */}
            <PriorityBadge item={item} />
            <DiscountBadge discount={item.discount} />
            
            {/* ✅ NEW: Stock status badge */}
            {stockStatus.status !== 'in-stock' && (
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                stockStatus.color === 'red' 
                  ? 'bg-red-100 text-red-800' 
                  : stockStatus.color === 'yellow'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {stockStatus.text}
              </div>
            )}

            {/* Category Indicator */}
            <CategoryBadge
              categoryType={isVeg ? "veg" : "Non Veg"}
              variant="logo"
              position="absolute"
              size="md"
              className="top-2 right-2"
            />

            {/* ✅ NEW: Quick actions overlay */}
            {showQuickActions && (
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {currentUser && (
                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isFavorited 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
                    title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart size={14} fill={isFavorited ? "currentColor" : "none"} />
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-500 rounded-full transition-all duration-200"
                  title="Share item"
                >
                  <Share2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Menu Name */}
            <h2 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2">
              {truncatedName}
            </h2>

            {/* ✅ NEW: Special badges row */}
            {specialBadges.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {specialBadges.slice(0, 2).map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.type}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        badge.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        badge.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <Icon size={10} />
                      <span className="capitalize">{badge.type}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Category and Special Features */}
            <div className="space-y-2">
              <div className="flex items-center flex-wrap gap-2">
                {item.menuCategory && (
                  <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                    {item.menuCategory}
                  </span>
                )}
                <SpecialFeatures item={item} maxFeatures={1} />
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

            {/* ✅ NEW: Quantity controls if item is in cart */}
            {quantity > 0 && onAddToCart && (
              <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(-1);
                  }}
                  disabled={isAddingToCart}
                  className="p-1 bg-orange-200 hover:bg-orange-300 rounded text-orange-800 disabled:opacity-50"
                >
                  <Minus size={14} />
                </button>
                
                <span className="font-medium text-orange-800">
                  {quantity} in cart
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(1);
                  }}
                  disabled={isAddingToCart}
                  className="p-1 bg-orange-200 hover:bg-orange-300 rounded text-orange-800 disabled:opacity-50"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {/* ✅ NEW: Analytics display for captain mode */}
            {captainMode && showAnalytics && (
              <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{viewCount}</span>
                  </div>
                  {item.analytics?.addedToCart && (
                    <div className="flex items-center gap-1">
                      <ShoppingCart size={12} />
                      <span>{item.analytics.addedToCart}</span>
                    </div>
                  )}
                  {item.analytics?.favorites && (
                    <div className="flex items-center gap-1">
                      <Heart size={12} />
                      <span>{item.analytics.favorites}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            {quantity === 0 && (
              <ActionButton
                isAvailable={isAvailable}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddToCart) {
                    handleAddToCart(1);
                  } else {
                    handleShow(item);
                  }
                }}
                isLoading={isButtonLoading || isAddingToCart}
                stockStatus={stockStatus}
                text={onAddToCart ? "Add to Cart" : "View Details"}
              />
            )}
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
            onAddToCart={onAddToCart}
            quantity={quantity}
            captainMode={captainMode}
          />
        )}
      </article>
    );
  }
);

VerticalMenuCard.displayName = "VerticalMenuCard";

// ✅ ENHANCED: Default props with new options
VerticalMenuCard.defaultProps = {
  handleImageLoad: () => {},
  onCardClick: () => {},
  className: "",
  height: "470px",
  quantity: 0,
  captainMode: false,
  showAnalytics: false,
  showQuickActions: true,
  isFavorite: false,
};

export default VerticalMenuCard;

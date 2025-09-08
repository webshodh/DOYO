import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuModal from "../MenuModal";
import {
  Clock,
  Star,
  ChefHat,
  TrendingUp,
  Award,
  Heart,
  Flame,
  Users,
  Leaf,
  Shield,
  Zap,
} from "lucide-react";

const HorizontalMenuCard = ({ item, handleImageLoad }) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  // Enhanced truncation function for menu name
  const truncateTitle = (title, maxLength = 12) => {
    if (!title) return "";
    return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  const getSpiceIcon = (level) => {
    switch (level) {
      case "Mild":
        return "🟢";
      case "Medium":
        return "🟡";
      case "Hot":
        return "🟠";
      case "Extra Hot":
        return "🔴";
      default:
        return "🟡";
    }
  };

  const getPriorityBadge = () => {
    if (item.chefSpecial) {
      return {
        text: "Chef's Special",
        color: "from-purple-500 to-pink-500",
        icon: <ChefHat className="w-3 h-3" />,
      };
    }
    if (item.isMostOrdered) {
      return {
        text: "Most Ordered",
        color: "from-rose-500 to-red-500",
        icon: <TrendingUp className="w-3 h-3" />,
      };
    }
    if (item.isPopular) {
      return {
        text: "Popular",
        color: "from-yellow-500 to-orange-500",
        icon: <Star className="w-3 h-3" />,
      };
    }
    if (item.isRecommended) {
      return {
        text: "Recommended",
        color: "from-blue-500 to-indigo-500",
        icon: <Heart className="w-3 h-3" />,
      };
    }
    if (item.isLimitedEdition) {
      return {
        text: "Limited",
        color: "from-indigo-500 to-purple-500",
        icon: <Award className="w-3 h-3" />,
      };
    }
    if (item.isSeasonal) {
      return {
        text: "Seasonal",
        color: "from-amber-500 to-orange-500",
        icon: <Star className="w-3 h-3" />,
      };
    }
    return null;
  };

  const getSpecialFeatures = () => {
    const features = [];

    if (item.isVegan) {
      features.push({
        text: "Vegan",
        icon: <Leaf className="w-3 h-3" />,
        color: "bg-green-100 text-green-700",
      });
    }
    if (item.isGlutenFree) {
      features.push({
        text: "Gluten Free",
        icon: <Shield className="w-3 h-3" />,
        color: "bg-blue-100 text-blue-700",
      });
    }
    if (item.isHighProtein) {
      features.push({
        text: "High Protein",
        icon: <Zap className="w-3 h-3" />,
        color: "bg-red-100 text-red-700",
      });
    }
    if (item.isOrganic) {
      features.push({
        text: "Organic",
        icon: <Leaf className="w-3 h-3" />,
        color: "bg-emerald-100 text-emerald-700",
      });
    }
    if (item.isSugarFree) {
      features.push({
        text: "Sugar Free",
        icon: <Shield className="w-3 h-3" />,
        color: "bg-purple-100 text-purple-700",
      });
    }

    return features.slice(0, 2); // Show max 2 features to avoid overcrowding
  };

  const priorityBadge = getPriorityBadge();
  const specialFeatures = getSpecialFeatures();

  return (
    <div className="w-full h-full">
      {/* Fixed height container for consistent card dimensions */}
      <div className="h-44 bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100 hover:border-orange-200">
        <div className="flex h-full">
          {/* Image Container - Fixed width and height */}
          <div className="flex-shrink-0 w-28 sm:w-32 relative overflow-hidden">
            {/* Loading Spinner */}
            {!item.imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-6 h-6 border-4 border-t-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}

            <img
              src={item.imageUrl || "/dish.png"}
              alt={item.menuName}
              onLoad={handleImageLoad}
              onError={(e) => {
                e.target.src = "/dish.png";
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Special Badge Overlay - Top Priority */}
            {priorityBadge && (
              <div className="absolute top-2 left-2">
                <div
                  className={`bg-gradient-to-r ${priorityBadge.color} text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}
                >
                  {priorityBadge.icon}
                  {priorityBadge.text}
                </div>
              </div>
            )}

            {/* Discount Badge */}
            {item.discount > 0 && (
              <div className="absolute bottom-2 right-2">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  {item.discount}% OFF
                </div>
              </div>
            )}

            {/* Availability Overlay */}
            {item.availability !== "Available" && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
                  {item.availability}
                </span>
              </div>
            )}
          </div>

          {/* Content Container - Flexible */}
          <div className="flex-1 p-2 flex flex-col justify-between relative min-w-0">
            {/* Top Section */}
            <div className="flex-1">
              {/* Menu Category Icon */}
              <div className="absolute top-2 right-2">
                <div className="bg-white rounded-full p-1 shadow-md border border-gray-100">
                  {item.categoryType === "Veg" ||
                  item.categoryType === "veg" ? (
                    <img
                      src="/veglogo.jpeg"
                      alt={item.categoryType}
                      className="w-3 h-3"
                    />
                  ) : item.categoryType === "Non Veg" ||
                    item.categoryType === "Non-veg" ||
                    item.categoryType === "non-veg" ||
                    item.categoryType === "nonveg" ||
                    item.categoryType === "Nonveg" ? (
                    <img
                      src="/nonVeglogo.png"
                      alt={item.categoryType}
                      className="w-3 h-3"
                    />
                  ) : null}
                </div>
              </div>

              {/* Menu Name with enhanced truncation */}
              <h3
                className="text-base sm:text-lg font-bold text-gray-800 leading-tight mb-1 pr-2"
                title={item.menuName} // Show full name on hover
              >
                {truncateTitle(item.menuName, 12)}
              </h3>

              {/* Quick Info Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <div className="flex items-center gap-2">
                  {/* Cooking Time */}
                  <div className="flex items-center gap-1 mb-2">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span className="font-medium">
                      {item.menuCookingTime}min
                    </span>
                  </div>
                  {/* Menu Category */}
                  {item.menuCategory && (
                    <span className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium mb-2 shadow-sm">
                      {truncateTitle(item.menuCategory, 10)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                {/* Spice Level & Portion */}
                {item.spiceLevel && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-500" />
                      <span>
                        {getSpiceIcon(item.spiceLevel)} {item.spiceLevel}
                      </span>
                    </div>
                  </div>
                )}
                {/* Calories */}
                {item.calories ? (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>{item.calories} kcal</span>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div>
              {/* Price Section */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  {item.discount && item.discount > 0 ? (
                    <span className="line-through text-gray-400 text-sm">
                      ₹{Math.round(item.menuPrice)}
                    </span>
                  ) : (
                    ""
                  )}
                  <span className="text-orange-500 text-lg sm:text-xl font-bold">
                    ₹{item.finalPrice}
                  </span>
                  {item.discount && item.discount > 0 ? (
                    <span className="text-green-600 text-xs font-medium bg-green-50 px-1 py-0.5 rounded ml-1">
                      Save ₹{Math.round(item.menuPrice - item.finalPrice)}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg ${
                  item.availability === "Available"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl transform hover:scale-105 active:scale-95"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                }`}
                onClick={() =>
                  item.availability === "Available" && handleShow(item)
                }
                disabled={item.availability !== "Available"}
              >
                {item.availability === "Available"
                  ? "View Details"
                  : "Unavailable"}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Hover Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-transparent to-red-50 opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none"></div>

        {/* Animated glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none blur-sm"></div>
      </div>

      <MenuModal show={show} handleClose={handleClose} modalData={modalData} />
    </div>
  );
};

export default HorizontalMenuCard;

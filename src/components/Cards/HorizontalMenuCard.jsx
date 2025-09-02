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

  const truncatedContent =
    item.menuName.length > 25
      ? item.menuName.slice(0, 25) + "..."
      : item.menuName;

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
    <div className="w-full max-w-full mx-auto mb-3">
      <div className="flex bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100">
        {/* Image Container */}
        <div className="flex-shrink-0 w-32 sm:w-36 md:w-40 relative overflow-hidden">
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
            style={{ height: "220px" }}
          />

          {/* Special Badge Overlay - Top Priority */}
          {priorityBadge && (
            <div className="absolute bottom-3 left-3">
              <div
                className={`bg-gradient-to-r ${priorityBadge.color} text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}
              >
                {priorityBadge.icon}
                {priorityBadge.text}
              </div>
            </div>
          )}

          {/* Discount Badge */}
          {item.discount > 0 && (
            <div className="absolute top-2 right-2">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                {item.discount}% OFF
              </div>
            </div>
          )}

          {/* Main Category Badge - Bottom Left */}
          {/* {item.mainCategory && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium py-1 px-2 rounded-md">
                {item.mainCategory}
              </span>
            </div>
          )} */}

          {/* Availability Overlay */}
          {item.availability !== "Available" && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                {item.availability}
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 p-4 flex flex-col relative">
          {/* Menu Category Icon */}
          <div className="absolute top-3 right-3">
            <div className="bg-white rounded-full p-1.5 shadow-md border border-gray-100">
              {item.categoryType === "Veg" || item.categoryType === "veg" ? (
                <img
                  src="/veglogo.jpeg"
                  alt={item.categoryType}
                  className="w-4 h-4"
                />
              ) : item.categoryType === "Non Veg" ||
                item.categoryType === "Non-veg" ||
                item.categoryType === "non-veg" ||
                item.categoryType === "nonveg" ||
                item.categoryType === "Nonveg" ? (
                <img
                  src="/nonVeglogo.png"
                  alt={item.categoryType}
                  className="w-4 h-4"
                />
              ) : null}
            </div>
          </div>

          {/* Top Section */}
          <div className="pr-8">
            {/* Menu Name */}
            <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">
              {truncatedContent}
            </h3>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              {/* Menu Category */}
              {item.menuCategory && (
                <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                  {item.menuCategory}
                </span>
              )}

              {/* Special Features Tags */}
              {specialFeatures.length > 0 &&
                specialFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${feature.color}`}
                  >
                    {feature.icon}
                    {feature.text}
                  </span>
                ))}
            </div>

            {/* Quick Info Row */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <div className="flex items-center gap-3">
                {/* Cooking Time */}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{item.menuCookingTime}min</span>
                </div>

                {/* Serving Size */}
                {item.servingSize && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">
                      Serves {item.servingSize}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Spice Level & Portion */}
            {/* {(item.spiceLevel || item.portionSize) && (
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                {item.spiceLevel && (
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-500" />
                    <span>
                      {getSpiceIcon(item.spiceLevel)} {item.spiceLevel}
                    </span>
                  </div>
                )}
                {item.portionSize && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{item.portionSize}</span>
                  </div>
                )}
              </div>
            )} */}
          </div>

          {/* Bottom Section */}
          <div className="mt-1">
            {/* Price Section */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <i className="bi bi-currency-rupee mr-1 text-orange-500"></i>
                <div className="flex items-center gap-2">
                  {item.discount && item.discount > 0 && (
                    <span className="line-through text-gray-400 text-sm">
                      ₹{Math.round(item.menuPrice)}
                    </span>
                  )}
                  <span className="text-orange-500 text-xl font-bold">
                    ₹{item.finalPrice}
                  </span>
                  {item.discount && item.discount > 0 && (
                    <span className="text-green-600 text-xs font-medium bg-green-50 px-1.5 py-0.5 rounded">
                      Save ₹{Math.round(item.menuPrice - item.finalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Calories */}
              {item.calories && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>{item.calories} kcal</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <button
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex-1 ${
                  item.availability === "Available"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-md transform hover:scale-105"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
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

        {/* Hover Effect Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>

        {/* Animated Border on Hover */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-200 rounded-2xl transition-colors duration-300 pointer-events-none"></div>
      </div>

      <MenuModal show={show} handleClose={handleClose} modalData={modalData} />
    </div>
  );
};

export default HorizontalMenuCard;

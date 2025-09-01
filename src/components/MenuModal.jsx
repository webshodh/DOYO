import React from "react";
import {
  Clock,
  Star,
  ChefHat,
  X,
  ShoppingCart,
  Flame,
  Award,
  Utensils,
  Tag,
  Users,
  Zap,
  AlertCircle,
  Leaf,
  TrendingUp,
  Info
} from "lucide-react";

const MenuModal = ({ show, handleClose, modalData, addToCart }) => {
  if (!modalData || !show) return null;

  const hasDiscount = modalData.discount && modalData.discount > 0;
  const discountPercentage = hasDiscount ? Math.round(modalData.discount) : 0;

  const getSpiceIcon = (level) => {
    switch(level) {
      case "Mild": return "🟢";
      case "Medium": return "🟡";
      case "Hot": return "🟠";
      case "Extra Hot": return "🔴";
      default: return "🟡";
    }
  };

  const getCategoryIcon = (type) => {
    return type === "veg" ? "🥬" : "🍖";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Custom Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 flex items-center justify-center group"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>

        {/* Special Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {hasDiscount && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
              {discountPercentage}% OFF
            </div>
          )}
          {modalData.chefSpecial && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Chef's Special
            </div>
          )}
          {modalData.isPopular && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Popular
            </div>
          )}
        </div>

        {/* Header with Image */}
        <div className="relative h-64 bg-gradient-to-br from-orange-50 to-red-50">
          {modalData.imageUrl ? (
            <img
              src={modalData.imageUrl}
              className="w-full h-full object-cover"
              alt={modalData.menuName}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ChefHat className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          
          {/* Availability Badge */}
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              modalData.availability === "Available" 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            }`}>
              {modalData.availability === "Available" ? "✅ Available" : "❌ Not Available"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
                {modalData.menuName}
              </h2>
              
              {/* Category & Type */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <Tag className="w-3 h-3 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{modalData.menuCategory}</span>
                </div>
                
                {modalData.categoryType && (
                  <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    <span className="text-sm">{getCategoryIcon(modalData.categoryType)}</span>
                    <span className="text-sm font-medium text-purple-700">
                      {modalData.categoryType === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                    </span>
                  </div>
                )}

                {modalData.mealType && (
                  <div className="flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    <Utensils className="w-3 h-3 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">{modalData.mealType}</span>
                  </div>
                )}
              </div>

              {/* Special Features */}
              <div className="flex items-center gap-2 flex-wrap">
                {modalData.isVegan && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Vegan
                  </span>
                )}
                {modalData.isGlutenFree && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Gluten Free
                  </span>
                )}
              </div>
            </div>
            
            {/* Price Section */}
            <div className="text-right ml-4">
              <div className="flex items-center gap-2 mb-1">
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{Math.round(modalData.menuPrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-green-600">
                  ₹{modalData.finalPrice || modalData.menuPrice}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                  Save ₹{Math.round(modalData.menuPrice - (modalData.finalPrice || modalData.menuPrice))}
                </span>
              )}
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Cooking Time</p>
                  <p className="text-sm font-bold text-blue-800">{modalData.menuCookingTime} mins</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-xs text-orange-600 font-medium">Serves</p>
                  <p className="text-sm font-bold text-orange-800">{modalData.servingSize || 1} Person{(modalData.servingSize > 1) ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-xs text-red-600 font-medium">Spice Level</p>
                  <p className="text-sm font-bold text-red-800">
                    {getSpiceIcon(modalData.spiceLevel)} {modalData.spiceLevel || "Medium"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Portion</p>
                  <p className="text-sm font-bold text-green-800">{modalData.portionSize || "Regular"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              About This Dish
            </h3>
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl p-4 border-l-4 border-orange-500">
              <p className="text-gray-700 leading-relaxed mb-3">
                {modalData.menuContent ||
                  `Delicious ${modalData.menuName} prepared with the finest ingredients and authentic spices.`}
              </p>
              
              {modalData.ingredients && (
                <div className="border-t border-orange-200 pt-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Key Ingredients:</p>
                  <p className="text-sm text-gray-700">{modalData.ingredients}</p>
                </div>
              )}
            </div>
          </div>

          {/* Preparation Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-purple-500" />
              Preparation Details
            </h3>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Method:</span>
                  <span className="text-purple-800 font-semibold">{modalData.preparationMethod || "Fried"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Difficulty:</span>
                  <span className="text-purple-800 font-semibold">{modalData.difficulty || "Medium"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Main Category:</span>
                  <span className="text-purple-800 font-semibold">{modalData.mainCategory || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Cuisine Type:</span>
                  <span className="text-purple-800 font-semibold">{modalData.categoryType === "veg" ? "Vegetarian" : modalData.categoryType === "nonveg" ? "Non-Veg" : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Information */}
          {(modalData.calories || modalData.nutritionalInfo?.protein || modalData.nutritionalInfo?.carbs || modalData.nutritionalInfo?.fat || modalData.nutritionalInfo?.fiber) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Nutritional Information
              </h3>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {modalData.calories && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xs text-green-600 font-medium">Calories</p>
                      <p className="text-lg font-bold text-green-800">{modalData.calories}</p>
                      <p className="text-xs text-green-600">kcal</p>
                    </div>
                  )}
                  
                  {modalData.nutritionalInfo?.protein && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <p className="text-xs text-red-600 font-medium">Protein</p>
                      <p className="text-lg font-bold text-red-800">{modalData.nutritionalInfo.protein}</p>
                      <p className="text-xs text-red-600">g</p>
                    </div>
                  )}
                  
                  {modalData.nutritionalInfo?.carbs && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                      <p className="text-xs text-blue-600 font-medium">Carbs</p>
                      <p className="text-lg font-bold text-blue-800">{modalData.nutritionalInfo.carbs}</p>
                      <p className="text-xs text-blue-600">g</p>
                    </div>
                  )}
                  
                  {modalData.nutritionalInfo?.fat && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">F</span>
                      </div>
                      <p className="text-xs text-yellow-600 font-medium">Fat</p>
                      <p className="text-lg font-bold text-yellow-800">{modalData.nutritionalInfo.fat}</p>
                      <p className="text-xs text-yellow-600">g</p>
                    </div>
                  )}
                  
                  {modalData.nutritionalInfo?.fiber && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">F</span>
                      </div>
                      <p className="text-xs text-purple-600 font-medium">Fiber</p>
                      <p className="text-lg font-bold text-purple-800">{modalData.nutritionalInfo.fiber}</p>
                      <p className="text-xs text-purple-600">g</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dietary Information & Allergens */}
          {(modalData.allergens?.length > 0 || modalData.isVegan || modalData.isGlutenFree) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Dietary Information
              </h3>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                {modalData.allergens?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-700 mb-2">Contains Allergens:</p>
                    <div className="flex flex-wrap gap-2">
                      {modalData.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-300"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-600 font-medium">Vegan:</span>
                    <span className={`font-semibold ${modalData.isVegan ? "text-green-600" : "text-gray-600"}`}>
                      {modalData.isVegan ? "Yes ✓" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600 font-medium">Gluten Free:</span>
                    <span className={`font-semibold ${modalData.isGlutenFree ? "text-green-600" : "text-gray-600"}`}>
                      {modalData.isGlutenFree ? "Yes ✓" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Additional Details
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Spice Level:</span>
                  <span className="font-semibold text-gray-800">
                    {getSpiceIcon(modalData.spiceLevel)} {modalData.spiceLevel || "Medium"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Portion Size:</span>
                  <span className="font-semibold text-gray-800">{modalData.portionSize || "Regular"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Preparation:</span>
                  <span className="font-semibold text-gray-800">{modalData.preparationMethod || "Fried"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Difficulty:</span>
                  <span className="font-semibold text-gray-800">{modalData.difficulty || "Medium"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          {addToCart && modalData.availability === "Available" && (
            <button
              onClick={() => {
                addToCart(modalData);
                handleClose();
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart • ₹{modalData.finalPrice || modalData.menuPrice}
            </button>
          )}
          
          {modalData.availability !== "Available" && (
            <div className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg">
              <X className="w-5 h-5" />
              Currently Unavailable
            </div>
          )}
        </div>

        {/* Bottom Accent */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
      </div>
    </div>
  );
};

export default MenuModal;
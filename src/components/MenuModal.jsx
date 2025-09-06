import React from "react";
import {
  Clock,
  ChefHat,
  X,
  Flame,
  Users,
  Zap,
  AlertCircle,
  Info,
  FileText,
  Activity,
} from "lucide-react";
import QuickInfoCard from "./Cards/QuickInfoCard";
import NutritionCard from "./Cards/NutritionCard";
import {
  getAdditionalDetails,
  getDietaryItems,
  getPreparationItems,
} from "./Cards/DetailSectionCard";
import DetailSectionCard from "./Cards/DetailSectionCard";
import { TagsContainer } from "Atoms/Tags";
import { SimpleIngredientsDisplay } from "Atoms/IngredientTag";

const MenuModal = ({ show, handleClose, modalData, addToCart }) => {
  if (!modalData || !show) return null;

  const hasDiscount = modalData.discount && modalData.discount > 0;
  const discountPercentage = hasDiscount ? Math.round(modalData.discount) : "";

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

  const formatNutritionalInfo = (info) => {
    if (!info) return null;
    console.log("info", info);
    return Object.entries(info).filter(([key, value]) => value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Custom Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 flex items-center justify-center group"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
        </button>

        {/* Special Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {hasDiscount ? (
            <div className="bg-gradient-to-r from-green-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
              {discountPercentage}% OFF
            </div>
          ) : (
            ""
          )}

          <TagsContainer data={modalData} categories={["features"]} />
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
          <div className="absolute bottom-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                modalData.availability === "Available"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {modalData.availability === "Available"
                ? "✅ Available"
                : "❌ Not Available"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                {modalData.menuName}
              </h2>

              {/* Category & Type Tags */}
              <div >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <TagsContainer data={modalData} categories={["primary"]} />
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <TagsContainer data={modalData} categories={["dietaries"]} />
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="text-right ml-6">
              <div className="flex items-center gap-2 mb-1">
                {hasDiscount ? (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{Math.round(modalData.menuPrice)}
                  </span>
                ) : (
                  ""
                )}
                <span className="text-3xl font-bold text-green-600">
                  ₹{modalData.finalPrice || modalData.menuPrice}
                </span>
              </div>
              {hasDiscount ? (
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                  Save ₹
                  {Math.round(
                    modalData.menuPrice -
                      (modalData.finalPrice || modalData.menuPrice)
                  )}
                </span>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <QuickInfoCard
              icon={Clock}
              label="Cooking Time"
              value={`${modalData.menuCookingTime} mins`}
              colorScheme="blue"
            />

            <QuickInfoCard
              icon={Users}
              label="Serves"
              value={modalData.servingSize || 1}
              colorScheme="orange"
            />

            <QuickInfoCard
              icon={Flame}
              label="Spice Level"
              value={`${getSpiceIcon(modalData.spiceLevel)} ${
                modalData.spiceLevel || "Medium"
              }`}
              colorScheme="red"
            />

            <QuickInfoCard
              icon={Zap}
              label="Portion"
              value={modalData.portionSize || "Regular"}
              colorScheme="green"
            />
          </div>

          {/* Description Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              About This Dish
            </h3>
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl p-4 border-l-4 border-orange-500">
              <p className="text-gray-700 leading-relaxed mb-3">
                {modalData.menuContent ||
                  `Delicious ${modalData.menuName} prepared with the finest ingredients and authentic spices.`}
              </p>

              {modalData.ingredients && (
                <SimpleIngredientsDisplay ingredients={modalData.ingredients} />
              )}
            </div>
          </div>

          {/* Preparation Details */}
          {(modalData.preparationMethod ||
            modalData.cookingStyle ||
            modalData.tasteProfile ||
            modalData.texture) && (
            <div>
              <DetailSectionCard
                title="Preparation Details"
                items={getPreparationItems()}
                data={modalData}
                showIcon={true}
                iconComponent={Clock}
                iconColor="text-pink-500"
                containerBg="bg-pink-50"
                containerBorder="border-green-200"
                gridCols={{ default: 2, lg: 4 }}
              />
            </div>
          )}

          {/* Nutritional Information */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Nutritional Information
          </h3>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 mt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Calories Card */}
              {modalData.calories && (
                <NutritionCard
                  icon={Zap}
                  label="Calories"
                  value={modalData.calories}
                  unit="kcal"
                  colorScheme="green"
                />
              )}

              {/* Other Nutritional Info Cards */}
              {formatNutritionalInfo(modalData.nutritionalInfo)?.map(
                ([key, value]) => (
                  <NutritionCard
                    key={key}
                    label={key}
                    value={value}
                    unit="g"
                    colorScheme="blue"
                    showLetter={true}
                    letter={key.charAt(0).toUpperCase()}
                  />
                )
              )}
            </div>
          </div>

          {/* Dietary Information & Allergens */}
          {(modalData.isVegan ||
            modalData.isGlutenFree ||
            modalData.isSugarFree ||
            modalData.isLactoseFree ||
            modalData.isJainFriendly ||
            modalData.isOrganic ||
            modalData.isKidsFriendly) && (
            <DetailSectionCard
              title="Dietary Information & Allergens"
              items={getDietaryItems()}
              data={modalData}
              showIcon={true}
              iconComponent={AlertCircle}
              iconColor="text-red-500"
              containerBg="bg-red-50"
              containerBorder="border-red-200"
              gridCols={{ default: 2, md: 3 }}
            />
          )}

          {/* Additional Information */}
          {(modalData.menuCategory ||
            modalData.mealType ||
            modalData.cuisineType ||
            modalData.spiceLevel) && (
            <DetailSectionCard
              title="Additional Details"
              items={getAdditionalDetails()}
              data={modalData}
              showIcon={true}
              iconComponent={Info}
              iconColor="text-red-500"
              containerBg="bg-red-50"
              containerBorder="border-red-200"
              gridCols={{ default: 2, md: 3 }}
            />
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

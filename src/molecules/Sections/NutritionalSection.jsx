import React, { memo, useCallback, useMemo } from "react";
import { Activity, Flame, Zap, Heart } from "lucide-react";
import QuickInfoCard from "components/Cards/QuickInfoCard";

const NutritionalSection = memo(({ modalData, className = "" }) => {
  const formatNutritionalInfo = useCallback((info) => {
    if (!info || typeof info !== "object") return [];
    return Object.entries(info).filter(
      ([key, value]) => value && key !== "calories",
    );
  }, []);

  const nutritionalEntries = useMemo(
    () => formatNutritionalInfo(modalData.nutritionalInfo),
    [modalData.nutritionalInfo, formatNutritionalInfo],
  );

  const hasNutritionalData =
    modalData.calories || nutritionalEntries.length > 0;

  // Enhanced nutrient display with icons
  const getNutrientIcon = useCallback((key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("protein")) return { icon: Zap };
    if (lowerKey.includes("carb") || lowerKey.includes("sugar"))
      return { icon: Flame };
    if (lowerKey.includes("fat") || lowerKey.includes("fiber"))
      return { icon: Heart };
    return { icon: Activity };
  }, []);

  if (!hasNutritionalData) return null;

  return (
    <div className={`mb-6 ${className}`}>
      {/* Section Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl  ">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold  bg-clip-text text-transparent">
            Nutritional Information
          </h2>
        </div>
      </div>

      {/* Nutrition Cards Container */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-blue-50/30 to-purple-50/50 rounded-2xl -z-10" />

        {/* Cards Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calories Card - Special highlighting */}
            {modalData.calories && (
              <QuickInfoCard
                icon={Flame}
                label="Calories"
                value={`${modalData.calories} kcal`}
                colorScheme="orange"
              />
            )}

            {/* Other Nutritional Information */}
            {nutritionalEntries.map(([key, value], index) => {
              const { icon: IconComponent } = getNutrientIcon(key);
              const colorSchemes = ["blue", "green", "purple", "red", "yellow"];
              const colorScheme = colorSchemes[index % colorSchemes.length];

              return (
                <QuickInfoCard
                  key={key}
                  icon={IconComponent}
                  label={key.replace(/([A-Z])/g, " $1").trim()}
                  value={`${value}g`}
                  colorScheme={colorScheme}
                />
              );
            })}
          </div>

          {/* Bottom decoration */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-600">
                Nutritional values per serving
              </span>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

NutritionalSection.displayName = "NutritionalSection";

export default NutritionalSection;

import React, { memo, useCallback, useMemo } from "react";
import { Activity } from "lucide-react";
import NutritionPanel from "../../atoms/NutritionPanel";
import { CaloriesCard } from "components/Cards/PreConfiguredCards";
import NutritionCard from "components/Cards/NutritionCard";

const NutritionalSection = memo(({ modalData }) => {
  const formatNutritionalInfo = useCallback((info) => {
    if (!info || typeof info !== "object") return [];
    return Object.entries(info).filter(
      ([key, value]) => value && key !== "calories"
    );
  }, []);

  const nutritionalEntries = useMemo(
    () => formatNutritionalInfo(modalData.nutritionalInfo),
    [modalData.nutritionalInfo, formatNutritionalInfo]
  );

  const hasNutritionalData =
    modalData.calories || nutritionalEntries.length > 0;

  if (!hasNutritionalData) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-500" />
        Nutritional Information
      </h2>
      <NutritionPanel title="" layout="grid">
        {modalData.calories && (
          <CaloriesCard label="Calories" value={modalData.calories} />
        )}
        {nutritionalEntries.map(([key, value]) => (
          <NutritionCard
            key={key}
            label={key.replace(/([A-Z])/g, " $1").trim()}
            value={value}
            unit="g"
            colorScheme="blue"
            showLetter={true}
            letter={key.charAt(0).toUpperCase()}
          />
        ))}
      </NutritionPanel>
    </div>
  );
});

NutritionalSection.displayName = "NutritionalSection";

export default NutritionalSection;

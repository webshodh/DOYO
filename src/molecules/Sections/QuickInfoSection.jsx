import React, { memo, useCallback } from "react";
import { Zap } from "lucide-react";
import { CookingTimeCard, ServingSizeCard, SpiceLevelCard } from "components/Cards/PreConfiguredQuickInfoCards";
import QuickInfoCard from "components/Cards/QuickInfoCard";


const QuickInfoSection = memo(({ modalData }) => {
  const getSpiceIcon = useCallback((level) => {
    const icons = {
      Mild: "🟢",
      Medium: "🟡",
      Hot: "🟠",
      "Extra Hot": "🔴",
    };
    return icons[level] || "🟡";
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <CookingTimeCard
        label="Cooking Time"
        value={`${modalData.menuCookingTime || 15} mins`}
      />
      <ServingSizeCard label="Serves" value={modalData.servingSize || 1} />
      <SpiceLevelCard
        label="Spice Level"
        value={`${getSpiceIcon(modalData.spiceLevel)} ${
          modalData.spiceLevel || "Medium"
        }`}
      />
      <QuickInfoCard
        icon={Zap}
        label="Portion"
        value={modalData.portionSize || "Regular"}
        colorScheme="green"
      />
    </div>
  );
});

QuickInfoSection.displayName = "QuickInfoSection";

export default QuickInfoSection;

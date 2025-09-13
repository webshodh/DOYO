import React, { memo } from "react";
import { FileText } from "lucide-react";
import { SimpleIngredientsDisplay } from "atoms/Badges/IngredientTag";

const DescriptionSection = memo(({ modalData }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
      <FileText className="w-5 h-5 text-orange-500" />
      About This Dish
    </h2>
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
));

DescriptionSection.displayName = "DescriptionSection";

export default DescriptionSection;

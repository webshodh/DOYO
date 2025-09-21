import React, { memo } from "react";

const TitlePriceSection = memo(({ modalData }) => {
  const hasDiscount = modalData.discount && modalData.discount > 0;
  const savings = hasDiscount
    ? Math.round(
        modalData.menuPrice - (modalData.finalPrice || modalData.menuPrice)
      )
    : 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight">
          {modalData.menuName}
        </h1>
      </div>

      {/* Price Section */}
      <div className="text-left sm:text-right">
        <div className="flex items-center gap-2 mb-1 justify-start sm:justify-end">
          {hasDiscount ? (
            <span className="text-lg text-gray-400 line-through">
              ₹{Math.round(modalData.menuPrice)}
            </span>
          ):""}
          <span className="text-2xl sm:text-3xl font-bold text-green-600">
            ₹{modalData.finalPrice || modalData.menuPrice}
          </span>
        </div>
        {hasDiscount && savings > 0 ? (
          <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-200">
            Save ₹{savings}
          </span>
        ):""}
      </div>
    </div>
  );
});

TitlePriceSection.displayName = "TitlePriceSection";

export default TitlePriceSection;

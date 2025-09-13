import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { ChefHat, AlertCircle, Info, Shield } from "lucide-react";
import CloseButton from "atoms/Buttons/CloseButton";
import SpecialBadges from "atoms/Badges/SpecialBadges";
import ImageHeader from "../atoms/Headers/ImageHeader";
import TitlePriceSection from "molecules/Sections/TitlePriceSection";
import TagsSection from "molecules/Sections/TagsSection";
import QuickInfoSection from "molecules/Sections/QuickInfoSection";
import DescriptionSection from "molecules/Sections/DescriptionSection";
import NutritionalSection from "molecules/Sections/NutritionalSection";
import DetailSectionGroup from "molecules/Sections/DetailSectionGroup";
import UnavailableNotice from "atoms/Messages/UnavailableNotice";
import {
  getAdditionalDetails,
  getDietaryItems,
  getPreparationItems,
} from "Constants/itemConfigurations";

// Main MenuModal component
const MenuModal = memo(
  ({ show, handleClose, modalData, addToCart, isLoading = false }) => {
    // Handle escape key
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === "Escape" && show) {
          handleClose();
        }
      };

      if (show) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }, [show, handleClose]);

    // Memoized backdrop click handler
    const handleBackdropClick = useCallback(
      (e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      },
      [handleClose]
    );

    // Memoized sections visibility
    const sectionsVisibility = useMemo(() => {
      if (!modalData) return {};

      return {
        hasPreparationDetails: !!(
          modalData.preparationMethod ||
          modalData.cookingStyle ||
          modalData.tasteProfile ||
          modalData.texture
        ),
        hasDietaryInfo: !!(
          modalData.isVegan ||
          modalData.isGlutenFree ||
          modalData.isSugarFree ||
          modalData.isLactoseFree ||
          modalData.isJainFriendly ||
          modalData.isOrganic ||
          modalData.isKidsFriendly
        ),
        hasAdditionalDetails: !!(
          modalData.menuCategory ||
          modalData.mealType ||
          modalData.cuisineType ||
          modalData.spiceLevel
        ),
      };
    }, [modalData]);

    // Early returns
    if (!show) return null;

    if (!modalData) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600 mb-4">
              The requested item information could not be loaded.
            </p>
            <button
              onClick={handleClose}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    const isAvailable = modalData.availability === "Available";

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleBackdropClick}
          aria-label="Close modal"
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">
          {/* Close Button */}
          <CloseButton onClose={handleClose} />

          {/* Special Badges */}
          <SpecialBadges modalData={modalData} />

          {/* Header with Image */}
          <ImageHeader
            imageUrl={modalData.imageUrl}
            menuName={modalData.menuName}
            availability={modalData.availability}
            isLoading={isLoading}
          />

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Title and Price Section */}
            <TitlePriceSection modalData={modalData} />

            {/* Tags Section */}
            <TagsSection modalData={modalData} />

            {/* Quick Info Cards */}
            <QuickInfoSection modalData={modalData} />

            {/* Description Section */}
            <DescriptionSection modalData={modalData} />

            {/* Nutritional Information */}
            <NutritionalSection modalData={modalData} />

            {/* Detail Sections */}
            <DetailSectionGroup
              layout="stack"
              sections={[
                ...(sectionsVisibility.hasPreparationDetails
                  ? [
                      {
                        title: "Preparation Details",
                        items: getPreparationItems(),
                        data: modalData,
                        showIcon: true,
                        iconComponent: ChefHat,
                        colorScheme: "orange",
                        gridLayout: "balanced",
                      },
                    ]
                  : []),
                ...(sectionsVisibility.hasDietaryInfo
                  ? [
                      {
                        title: "Dietary Information & Allergens",
                        items: getDietaryItems(),
                        data: modalData,
                        showIcon: true,
                        iconComponent: Shield,
                        colorScheme: "green",
                        gridLayout: "balanced",
                      },
                    ]
                  : []),
                ...(sectionsVisibility.hasAdditionalDetails
                  ? [
                      {
                        title: "Additional Details",
                        items: getAdditionalDetails(),
                        data: modalData,
                        showIcon: true,
                        iconComponent: Info,
                        colorScheme: "blue",
                        gridLayout: "balanced",
                      },
                    ]
                  : []),
              ]}
            />

            {/* Unavailable Notice */}
            {!isAvailable && <UnavailableNotice />}
          </div>

          {/* Bottom Accent */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
        </div>
      </div>
    );
  }
);

MenuModal.displayName = "MenuModal";

// Default props
MenuModal.defaultProps = {
  show: false,
  handleClose: () => {},
  modalData: null,
  addToCart: () => {},
  isLoading: false,
};

export default MenuModal;

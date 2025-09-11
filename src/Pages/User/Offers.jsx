import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useOffersData from "../../data/useOffersData";
import CategoryTabs from "../../components/CategoryTab";
import NavBar from "components/Navbar";
import { Spinner } from "Atoms";
import ErrorMessage from "Atoms/ErrorMessage";

const Offers = () => {
  const { hotelName } = useParams();
  const navigate = useNavigate();
  const { offersData, totalOffers, offerTypes, loading, error } =
    useOffersData(hotelName);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Helper function - defined early to avoid hoisting issues
  const getOfferTypeLabel = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Create category counts for CategoryTabs
  const categoryCountsByType = {};
  offerTypes.forEach((type) => {
    categoryCountsByType[getOfferTypeLabel(type)] = offersData.filter(
      (offer) => offer.offerType === type
    ).length;
  });

  // Handle category filter
  const handleCategoryFilter = (categoryName, type) => {
    setSelectedCategory(categoryName);
  };

  // Filter offers based on selected category and status
  const filteredOffers = offersData.filter((offer) => {
    const categoryMatch =
      selectedCategory === "All" ||
      getOfferTypeLabel(offer.offerType) === selectedCategory;

    return categoryMatch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Create categories array for CategoryTabs (for offer types)
  const categoryTabsData = offerTypes.map((type) => ({
    categoryName: getOfferTypeLabel(type),
  }));

  if (loading) {
    <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  // const handleBack = () => {
  //   navigate(`/viewMenu/${hotelName}/home`);
  // };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NavBar
        hotelName={`${hotelName}`}
        title={`${hotelName}`}
        Fabar={true}
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
        home={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters using CategoryTabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter by Category
              </h3>
              <CategoryTabs
                categories={categoryTabsData}
                menuCountsByCategory={categoryCountsByType}
                handleCategoryFilter={handleCategoryFilter}
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredOffers.length} of {totalOffers} offers
          </p>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No offers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or create a new offer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.offerId}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {offer.offerName}
                      </h3>
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getOfferTypeLabel(offer.offerType)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {offer.offerDescription}
                  </p>

                  {/* Offer Details */}
                  <div className="space-y-2 mb-4">
                    {offer.minimumOrderAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Minimum Order:</span>
                        <span className="font-medium">
                          ₹{offer.minimumOrderAmount}
                        </span>
                      </div>
                    )}
                    {/* <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Usage Count:</span>
                      <span className="font-medium">
                        {offer.currentUsageCount || 0}
                      </span>
                    </div> */}
                  </div>

                  {/* Validity Period */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Valid From:</span>
                      <span className="font-medium">
                        {formatDate(offer.validFrom)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valid Until:</span>
                      <span className="font-medium">
                        {formatDate(offer.validUntil)}
                      </span>
                    </div>
                  </div>

                  {/* Terms */}
                  {offer.terms && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Terms:</span>{" "}
                        {offer.terms}
                      </p>
                    </div>
                  )}

                  {/* Created Info */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-400">
                      Created: {formatDate(offer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;

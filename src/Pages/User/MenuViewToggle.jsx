import React, { useState } from "react";
import VerticalMenuCard from "../../components/Cards/VerticalMenuCard"; // Your enhanced vertical card
import HorizontalMenuCard from "../../components/Cards/HorizontalMenuCard"; // Your enhanced horizontal card

const MenuViewToggle = ({
  filteredAndSortedItems,
  handleImageLoad,
  colors,
}) => {
  const [viewType, setViewType] = useState("grid"); // 'grid' or 'list'
  const [showOptions, setShowOptions] = useState(false);

  const handleViewChange = (type) => {
    setViewType(type);
    setShowOptions(false);
  };

  return (
    <div className="w-full relative">
      {/* View Toggle Button Only */}
      <div className="flex justify-end items-center px-4 py-2">
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
          >
            <i className="bi bi-grid-3x3-gap"></i>
            <span className="font-medium">View</span>
            <i
              className={`bi bi-chevron-down transform transition-transform duration-200 ${
                showOptions ? "rotate-180" : ""
              }`}
            ></i>
          </button>

          {/* Dropdown Options */}
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
              <button
                onClick={() => handleViewChange("grid")}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  viewType === "grid"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700"
                }`}
              >
                <i className="bi bi-grid-3x3-gap text-lg"></i>
                <div>
                  <div className="font-medium">Grid View</div>
                  <div className="text-xs text-gray-500">Cards in rows</div>
                </div>
                {viewType === "grid" && (
                  <i className="bi bi-check2 text-orange-500 ml-auto"></i>
                )}
              </button>

              <button
                onClick={() => handleViewChange("list")}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  viewType === "list"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700"
                }`}
              >
                <i className="bi bi-list-ul text-lg"></i>
                <div>
                  <div className="font-medium">List View</div>
                  <div className="text-xs text-gray-500">Detailed list</div>
                </div>
                {viewType === "list" && (
                  <i className="bi bi-check2 text-orange-500 ml-auto"></i>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Container */}
      <div
        className="px-4 ml-2"
        style={{
          height: "calc(100vh - 240px)", // Back to original height
          overflowY: "auto",
          background: colors.LightGrey,
        }}
      >
        {viewType === "grid" ? (
          // Grid View - VerticalMenuCard
          // Mobile: 1 card | Tablet: 3 cards | Laptop: 4 cards | Desktop: 5 cards | Large: 6 cards
          <div className="grid gap-4 py-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredAndSortedItems.map((item) => (
              <div key={item.id} className="flex justify-center">
                <VerticalMenuCard
                  item={item}
                  handleImageLoad={handleImageLoad}
                />
              </div>
            ))}
          </div>
        ) : (
          // List View - HorizontalMenuCard
          // Mobile: 1 card | Tablet: 1 card | Laptop: 2 cards | Desktop: 2 cards | Large: 3 cards
          <div className="grid gap-3 py-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredAndSortedItems.map((item) => (
              <div key={item.id}>
                <HorizontalMenuCard
                  item={item}
                  handleImageLoad={handleImageLoad}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <i className="bi bi-search text-4xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        ></div>
      )}
    </div>
  );
};

export default MenuViewToggle;

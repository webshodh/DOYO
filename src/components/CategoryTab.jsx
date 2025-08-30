import React, { useState } from "react";
import MenuTab from "./MenuTab"; // Adjust the path if necessary
import "../styles/CategoryTabs.css";
import { colors } from "theme/theme";

const CategoryTabs = ({
  categories,
  menuCountsByCategory,
  handleCategoryFilter,
  specialCategories = [], // New prop for special categories
  mainCategories = [], // New prop for main categories
  menuCountsBySpecialCategory = {}, // New prop for special category counts
  menuCountsByMainCategory = {}, // New prop for main category counts
}) => {
  const [activeTab, setActiveTab] = useState("All");

  // Calculate total count for "All" tab
  const totalCount =
    Object.values(menuCountsByCategory).reduce((a, b) => a + b, 0) +
    Object.values(menuCountsBySpecialCategory).reduce((a, b) => a + b, 0) +
    Object.values(menuCountsByMainCategory).reduce((a, b) => a + b, 0);

  const tabs = [
    {
      label: `All (${totalCount})`,
      content: (
        <div>{/* Content for 'All' category can be displayed here */}</div>
      ),
      type: "all",
    },
    // Main categories first (if provided)
    ...mainCategories
      .filter((item) => menuCountsByMainCategory[item.categoryName] > 0)
      .map((item) => ({
        label: `${item.categoryName} (${
          menuCountsByMainCategory[item.categoryName]
        })`,
        content: <div>{/* Content for main category */}</div>,
        type: "main",
      })),
    // Special categories second (if provided)
    ...specialCategories
      .filter((item) => menuCountsBySpecialCategory[item.categoryName] > 0)
      .map((item) => ({
        label: `${item.categoryName} (${
          menuCountsBySpecialCategory[item.categoryName]
        })`,
        content: <div>{/* Content for special category */}</div>,
        type: "special",
      })),
    // Regular categories last
    ...categories
      .filter((item) => menuCountsByCategory[item.categoryName] > 0)
      .map((item) => ({
        label: `${item.categoryName} (${
          menuCountsByCategory[item.categoryName]
        })`,
        content: <div>{/* Content for regular category */}</div>,
        type: "regular",
      })),
  ];

  const handleSelect = (label, type) => {
    const selectedCategory = label.startsWith("All")
      ? "All"
      : label.split(" (")[0]; // Extract category name

    setActiveTab(selectedCategory); // Set active tab

    // Call the filter function with category type information
    if (selectedCategory === "All") {
      handleCategoryFilter("", "all");
    } else {
      handleCategoryFilter(selectedCategory, type);
    }
  };

  // Function to get button styling based on category type
  const getButtonStyling = (tab, isActive) => {
    const baseClasses =
      "flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition duration-300 ease-in-out rounded-full mr-2";

    if (isActive) {
      switch (tab.type) {
        case "main":
          return `${baseClasses} bg-blue-500 text-white border-b-2 border-blue-500`;
        case "special":
          return `${baseClasses} bg-purple-500 text-white border-b-2 border-purple-500`;
        case "all":
          return `${baseClasses} bg-orange-500 text-white border-b-2 border-orange-500`;
        default:
          return `${baseClasses} bg-orange-500 text-white border-b-2 border-orange-500`;
      }
    } else {
      switch (tab.type) {
        case "main":
          return `${baseClasses} bg-white border border-blue-500 text-black hover:bg-blue-500 hover:text-white`;
        case "special":
          return `${baseClasses} bg-white border border-purple-500 text-black hover:bg-purple-500 hover:text-white`;
        case "all":
          return `${baseClasses} bg-white border border-orange-500 text-black hover:bg-orange-500 hover:text-white`;
        default:
          return `${baseClasses} bg-white border border-orange-500 text-black hover:bg-orange-500 hover:text-white`;
      }
    }
  };

  return (
    <div
      className="w-full rounded-lg overflow-hidden"
      style={{ background: colors.LightGrey }}
    >
      {/* Wrapper for custom scrollbar styles */}
      <div className="flex overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={`${tab.type}-${tab.label}`}
            className={getButtonStyling(
              tab,
              activeTab === tab.label.split(" (")[0]
            )}
            onClick={() => handleSelect(tab.label, tab.type)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content Display */}
      <div>
        {tabs.map(
          (tab) =>
            activeTab === tab.label.split(" (")[0] && (
              <div key={`${tab.type}-${tab.label}`}>{tab.content}</div>
            )
        )}
      </div>
    </div>
  );
};

export default CategoryTabs;

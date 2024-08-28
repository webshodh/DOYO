import React, { useState } from "react";
import MenuTab from "./MenuTab"; // Adjust the path if necessary
import '../styles/CategoryTabs.css'
const CategoryTabs = ({ categories, menuCountsByCategory, handleCategoryFilter }) => {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = [
    {
      label: `All (${Object.values(menuCountsByCategory).reduce((a, b) => a + b, 0)})`,
      content: (
        <div>
          {/* Content for 'All' category can be displayed here */}
        </div>
      ),
    },
    ...categories
      .filter((item) => menuCountsByCategory[item.categoryName] > 0)
      .map((item) => ({
        label: `${item.categoryName} (${menuCountsByCategory[item.categoryName]})`,
        content: (
          <div>
            {/* Content for this category, if needed */}
          </div>
        ),
      })),
  ];

  const handleSelect = (label) => {
    const selectedCategory = label.startsWith("All") ? "All" : label.split(" (")[0]; // Extract category name
    setActiveTab(selectedCategory); // Set active tab
    handleCategoryFilter(selectedCategory === "All" ? "" : selectedCategory); // Call the filter function
  };

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex overflow-x-auto border-b border-gray-200 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`flex-1 px-4 py-2 text-sm font-medium text-gray-600 whitespace-nowrap transition duration-300 ease-in-out hover:bg-gray-100 hover:text-orange-500 
              ${
                activeTab === tab.label.split(" (")[0]
                  ? "bg-orange-500 text-white border-b-2 border-orange-500"
                  : ""
              }
            `}
            onClick={() => handleSelect(tab.label)}
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
              <div key={tab.label}>{tab.content}</div>
            )
        )}
      </div>
    </div>
  );
};

export default CategoryTabs;

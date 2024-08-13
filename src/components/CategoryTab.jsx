import React from "react";
import MenuTab from "./MenuTab"; // Adjust the path if necessary

const CategoryTabs = ({ categories, menuCountsByCategory, handleCategoryFilter }) => {
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
    const selectedCategory = label.startsWith("All") ? "" : label.split(" (")[0]; // Extract category name
    handleCategoryFilter(selectedCategory); // Call the filter function with the selected category
  };

  return (
    <MenuTab
      tabs={tabs}
      width="100%" // Set width to 100% for full-width tabs
      onTabSelect={handleSelect} // Pass the function to handle tab selection
    />
  );
};

export default CategoryTabs;

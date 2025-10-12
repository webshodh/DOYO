import React, { useState, useMemo, useCallback, memo } from "react";
import TabButton from "atoms/Buttons/TabButton";
import { Filter } from "lucide-react";

const CategoryTabs = memo(
  ({
    categories = [],
    menuCountsByCategory = {},
    specialCategories = [],
    menuCountsBySpecialCategory = {},
    mainCategories = [],
    menuCountsByMainCategory = {},

    handleCategoryFilter,
    onTabChange,

    hideAllTab = false,
    initialActiveTab = "All",

    layout = "horizontal",
    size = "md",
    className = "",
    tabsClassName = "",

    allowMultiSelect = false,
    maxSelections = 3,

    loading = false,
    emptyMessage = "No categories available",

    ariaLabel = "Category navigation",
    ...rest
  }) => {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    const [selectedTabs, setSelectedTabs] = useState(
      new Set([initialActiveTab])
    );

    // Debug logs
    console.log("CategoryTabs - Categories:", categories);
    console.log("CategoryTabs - menuCountsByCategory:", menuCountsByCategory);
    console.log("CategoryTabs - specialCategories:", specialCategories);
    console.log("CategoryTabs - mainCategories:", mainCategories);

    // Calculate total count for "All"
    const totalCount = useMemo(() => {
      const regularCount = Object.values(menuCountsByCategory).reduce(
        (a, b) => a + b,
        0
      );
      const specialCount = Object.values(menuCountsBySpecialCategory).reduce(
        (a, b) => a + b,
        0
      );
      const mainCount = Object.values(menuCountsByMainCategory).reduce(
        (a, b) => a + b,
        0
      );
      return regularCount + specialCount + mainCount;
    }, [
      menuCountsByCategory,
      menuCountsBySpecialCategory,
      menuCountsByMainCategory,
    ]);

    // FIXED: Build tabs list with proper filtering
    const tabs = useMemo(() => {
      const tabList = [];

      // Add "All" tab
      if (!hideAllTab) {
        tabList.push({
          id: "All",
          label: "All",
          count: totalCount,
          type: "all",
        });
      }

      // Add main categories (if any)
      if (Array.isArray(mainCategories) && mainCategories.length > 0) {
        mainCategories.forEach((item) => {
          const name = item.mainCategoryName || item.name;
          const count =
            menuCountsByMainCategory[name] ||
            menuCountsByMainCategory[item.id] ||
            0;

          if (count > 0) {
            tabList.push({
              id: name,
              label: name,
              count: count,
              type: "main",
            });
          }
        });
      }

      // Add special categories (if any)
      if (Array.isArray(specialCategories) && specialCategories.length > 0) {
        specialCategories.forEach((item) => {
          const name = item.specialCategoryName || item.name;
          const count =
            menuCountsBySpecialCategory[name] ||
            menuCountsBySpecialCategory[item.id] ||
            0;

          if (count > 0) {
            tabList.push({
              id: name,
              label: name,
              count: count,
              type: "special",
            });
          }
        });
      }

      // Add regular categories - FIXED: Check both name and id
      if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach((item) => {
          const name = item.categoryName || item.name;
          const itemId = item.id || item._id;

          // Try to get count by name first, then by id, then use item.count
          const count =
            menuCountsByCategory[name] ||
            menuCountsByCategory[itemId] ||
            item.count ||
            0;

          console.log(`Category: ${name}, ID: ${itemId}, Count: ${count}`);

          // Only add if count > 0
          if (count > 0) {
            tabList.push({
              id: name,
              label: name,
              count: count,
              type: "regular",
            });
          }
        });
      }

      console.log("Built tabs:", tabList);
      return tabList;
    }, [
      hideAllTab,
      totalCount,
      mainCategories,
      menuCountsByMainCategory,
      specialCategories,
      menuCountsBySpecialCategory,
      categories,
      menuCountsByCategory,
    ]);

    const handleTabSelect = useCallback(
      (tab) => {
        if (allowMultiSelect) {
          const newSelected = new Set(selectedTabs);
          if (newSelected.has(tab.id)) {
            newSelected.delete(tab.id);
          } else if (newSelected.size < maxSelections) {
            newSelected.add(tab.id);
          }
          setSelectedTabs(newSelected);

          if (handleCategoryFilter) {
            handleCategoryFilter(Array.from(newSelected), "multi");
          }
        } else {
          setActiveTab(tab.id);
          if (handleCategoryFilter) {
            handleCategoryFilter(tab.id === "All" ? "" : tab.id, tab.type);
          }
        }
        onTabChange?.(tab);
      },
      [
        allowMultiSelect,
        selectedTabs,
        maxSelections,
        handleCategoryFilter,
        onTabChange,
      ]
    );

    // Size classes
    const sizeClasses = useMemo(() => {
      switch (size) {
        case "sm":
          return "text-xs px-3 py-2";
        case "lg":
          return "text-base px-6 py-4";
        default:
          return "text-sm px-4 py-2.5";
      }
    }, [size]);

    if (loading) {
      return (
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (
      tabs.length === 0 ||
      (tabs.length === 1 && tabs[0].id === "All" && tabs[0].count === 0)
    ) {
      return (
        <div className="text-center py-6 text-gray-500">
          <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">{emptyMessage}</p>
          <p className="text-xs text-gray-400 mt-1">
            Categories will appear here once you add menu items
          </p>
        </div>
      );
    }

    return (
      <div
        className={`w-full ${className}`}
        role="tablist"
        aria-label={ariaLabel}
        {...rest}
      >
        <div
          id="category-tabs-container"
          className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-2"
        >
          {tabs.map((tab) => {
            const isSelected = allowMultiSelect
              ? selectedTabs.has(tab.id)
              : activeTab === tab.id;
            return (
              <TabButton
                key={tab.id}
                label={tab.label}
                count={tab.count}
                isActive={isSelected}
                onClick={() => handleTabSelect(tab)}
                type={tab.type}
                className={sizeClasses}
              />
            );
          })}
        </div>

        {allowMultiSelect && selectedTabs.size > 0 && (
          <div className="px-2 py-1 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {selectedTabs.size} selected
              </div>
              <button
                onClick={() => setSelectedTabs(new Set())}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CategoryTabs.displayName = "CategoryTabs";

export default CategoryTabs;

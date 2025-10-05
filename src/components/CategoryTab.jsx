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

    layout = "horizontal", // horizontal, vertical, grid
    size = "md", // sm, md, lg
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
      new Set([initialActiveTab]),
    );

    // Calculate total count for "All"
    const totalCount = useMemo(() => {
      const regularCount = Object.values(menuCountsByCategory).reduce(
        (a, b) => a + b,
        0,
      );
      const specialCount = Object.values(menuCountsBySpecialCategory).reduce(
        (a, b) => a + b,
        0,
      );
      const mainCount = Object.values(menuCountsByMainCategory).reduce(
        (a, b) => a + b,
        0,
      );
      return regularCount + specialCount + mainCount;
    }, [
      menuCountsByCategory,
      menuCountsBySpecialCategory,
      menuCountsByMainCategory,
    ]);

    // Build tabs list
    const tabs = useMemo(() => {
      const tabList = [];
      if (!hideAllTab) {
        tabList.push({
          id: "All",
          label: "All",
          count: totalCount,
          type: "all",
        });
      }

      mainCategories
        .filter((item) => menuCountsByMainCategory[item.name] > 0)
        .forEach((item) =>
          tabList.push({
            id: item.name,
            label: item.name,
            count: menuCountsByMainCategory[item.name],
            type: "main",
          }),
        );

      specialCategories
        .filter((item) => menuCountsBySpecialCategory[item.name] > 0)
        .forEach((item) =>
          tabList.push({
            id: item.name,
            label: item.name,
            count: menuCountsBySpecialCategory[item.name],
            type: "special",
          }),
        );

      categories
        .filter((item) => menuCountsByCategory[item.name] > 0)
        .forEach((item) =>
          tabList.push({
            id: item.name,
            label: item.name,
            count: menuCountsByCategory[item.name],
            type: "regular",
          }),
        );

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
      ],
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
            <div key={i} className="h-9 w-20 bg-gray-200 rounded-full" />
          ))}
        </div>
      );
    }

    if (tabs.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <Filter className="w-6 h-6 mx-auto mb-1 text-gray-300" />
          <p>{emptyMessage}</p>
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
  },
);

CategoryTabs.displayName = "CategoryTabs";

export default CategoryTabs;

import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
  Grid3x3,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Check,
} from "lucide-react";

// Tab button component with enhanced styling
const TabButton = memo(
  ({
    label,
    count,
    isActive,
    onClick,
    type,
    disabled = false,
    className = "",
  }) => {
    // Theme configuration for different tab types
    const themes = {
      all: {
        active:
          "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400",
        icon: Grid3x3,
      },
      main: {
        active:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400",
        icon: Star,
      },
      special: {
        active:
          "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400",
        icon: Zap,
      },
      regular: {
        active:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg",
        inactive:
          "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
        icon: Filter,
      },
    };

    const theme = themes[type] || themes.regular;
    const IconComponent = theme.icon;

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
        relative flex items-center gap-2 px-2 py-3 min-w-max font-medium text-sm
        rounded-full transition-all duration-300 ease-in-out transform
        ${isActive ? theme.active : theme.inactive}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-105 active:scale-95"
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
        ${className}
      `}
        aria-pressed={isActive}
        aria-label={`${label} category with ${count} items`}
      >
        
        <span className="font-semibold">{label}</span>
        {count !== undefined && (
          <span
            className={`
          px-2 py-0.5 rounded-full text-xs font-bold
          ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}
        `}
          >
            {count}
          </span>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full opacity-90" />
        )}
      </button>
    );
  }
);

TabButton.displayName = "TabButton";

// Scroll navigation buttons
const ScrollButton = memo(
  ({ direction, onClick, disabled, className = "" }) => {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
        flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md
        border border-gray-200 hover:bg-gray-50 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed ${className}
      `}
        aria-label={`Scroll ${direction}`}
      >
        <Icon className="w-4 h-4 text-gray-600" />
      </button>
    );
  }
);

ScrollButton.displayName = "ScrollButton";

// Enhanced CategoryTabs component
const CategoryTabs = memo(
  ({
    // Category data
    categories = [],
    menuCountsByCategory = {},

    // Special categories
    specialCategories = [],
    menuCountsBySpecialCategory = {},

    // Main categories
    mainCategories = [],
    menuCountsByMainCategory = {},

    // Event handlers
    handleCategoryFilter,
    onTabChange,

    // Configuration
    hideAllTab = false,
    initialActiveTab = "All",
    showScrollButtons = true,
    showIcons = true,

    // Layout & Styling
    layout = "horizontal", // horizontal, vertical, grid
    size = "md", // sm, md, lg
    className = "",
    tabsClassName = "",
    contentClassName = "",

    // Advanced features
    allowMultiSelect = false,
    maxSelections = 3,
    searchable = false,

    // Loading & Empty states
    loading = false,
    emptyMessage = "No categories available",

    // Accessibility
    ariaLabel = "Category navigation",

    ...rest
  }) => {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    const [selectedTabs, setSelectedTabs] = useState(
      new Set([initialActiveTab])
    );
    const [scrollPosition, setScrollPosition] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Calculate total count for "All" tab
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

    // Build tabs array
    const tabs = useMemo(() => {
      const tabList = [];

      // All tab (if not hidden)
      if (!hideAllTab) {
        tabList.push({
          id: "All",
          label: "All",
          count: totalCount,
          type: "all",
        });
      }

      // Main categories
      mainCategories
        .filter((item) => menuCountsByMainCategory[item.categoryName] > 0)
        .forEach((item) => {
          tabList.push({
            id: item.categoryName,
            label: item.categoryName,
            count: menuCountsByMainCategory[item.categoryName],
            type: "main",
            data: item,
          });
        });

      // Special categories
      specialCategories
        .filter((item) => menuCountsBySpecialCategory[item.categoryName] > 0)
        .forEach((item) => {
          tabList.push({
            id: item.categoryName,
            label: item.categoryName,
            count: menuCountsBySpecialCategory[item.categoryName],
            type: "special",
            data: item,
          });
        });

      // Regular categories
      categories
        .filter((item) => menuCountsByCategory[item.categoryName] > 0)
        .forEach((item) => {
          tabList.push({
            id: item.categoryName,
            label: item.categoryName,
            count: menuCountsByCategory[item.categoryName],
            type: "regular",
            data: item,
          });
        });

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

    // Handle tab selection
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
            const categories = Array.from(newSelected);
            handleCategoryFilter(categories, "multi");
          }
        } else {
          setActiveTab(tab.id);

          if (handleCategoryFilter) {
            if (tab.id === "All") {
              handleCategoryFilter("", tab.type);
            } else {
              handleCategoryFilter(tab.id, tab.type);
            }
          }
        }

        if (onTabChange) {
          onTabChange(tab);
        }
      },
      [
        allowMultiSelect,
        selectedTabs,
        maxSelections,
        handleCategoryFilter,
        onTabChange,
      ]
    );

    // Scroll functionality
    const scrollTabs = useCallback(
      (direction) => {
        const container = document.getElementById("category-tabs-container");
        if (!container) return;

        const scrollAmount = 200;
        const newPosition =
          direction === "left"
            ? scrollPosition - scrollAmount
            : scrollPosition + scrollAmount;

        container.scrollTo({ left: newPosition, behavior: "smooth" });
        setScrollPosition(newPosition);
      },
      [scrollPosition]
    );

    // Check scroll availability
    const checkScrollButtons = useCallback(() => {
      const container = document.getElementById("category-tabs-container");
      if (!container) return;

      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }, []);

    // Effect for scroll checking
    useEffect(() => {
      const container = document.getElementById("category-tabs-container");
      if (!container) return;

      const handleScroll = () => {
        setScrollPosition(container.scrollLeft);
        checkScrollButtons();
      };

      container.addEventListener("scroll", handleScroll);
      checkScrollButtons(); // Initial check

      return () => container.removeEventListener("scroll", handleScroll);
    }, [checkScrollButtons]);

    // Layout classes
    const layoutClasses = useMemo(() => {
      switch (layout) {
        case "vertical":
          return "flex-col space-y-2";
        case "grid":
          return "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2";
        default:
          return "flex space-x-3";
      }
    }, [layout]);

    // Size classes
    const sizeClasses = useMemo(() => {
      switch (size) {
        case "sm":
          return "text-xs px-3 py-2";
        case "lg":
          return "text-base px-6 py-4";
        default:
          return "text-sm px-4 py-3";
      }
    }, [size]);

    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="flex space-x-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded-full w-24" />
            ))}
          </div>
        </div>
      );
    }

    if (tabs.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div
        className={`w-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ${className}`}
        role="tablist"
        aria-label={ariaLabel}
        {...rest}
      >
        {/* Tab Navigation */}
        <div className="relative">
          {showScrollButtons && canScrollLeft && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
              <ScrollButton
                direction="left"
                onClick={() => scrollTabs("left")}
                disabled={!canScrollLeft}
              />
            </div>
          )}

          <div
            id="category-tabs-container"
            className={`
            overflow-x-auto scrollbar-hide p-4
            ${layout === "horizontal" ? "pb-2" : ""}
            ${showScrollButtons ? "px-12" : "px-4"}
          `}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className={layoutClasses}>
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
          </div>

          {showScrollButtons && canScrollRight && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
              <ScrollButton
                direction="right"
                onClick={() => scrollTabs("right")}
                disabled={!canScrollRight}
              />
            </div>
          )}
        </div>

        {/* Multi-select summary */}
        {allowMultiSelect && selectedTabs.size > 0 && (
          <div className="px-4 pb-2 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedTabs.size} categories selected
                </span>
                <div className="flex gap-1">
                  {Array.from(selectedTabs)
                    .slice(0, 3)
                    .map((tabId) => {
                      const tab = tabs.find((t) => t.id === tabId);
                      return tab ? (
                        <span
                          key={tabId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                        >
                          {tab.label}
                          <button
                            onClick={() => {
                              const newSelected = new Set(selectedTabs);
                              newSelected.delete(tabId);
                              setSelectedTabs(newSelected);
                            }}
                            className="hover:bg-orange-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  {selectedTabs.size > 3 && (
                    <span className="text-xs text-gray-500">
                      +{selectedTabs.size - 3} more
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedTabs(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700"
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

// Default props
CategoryTabs.defaultProps = {
  categories: [],
  menuCountsByCategory: {},
  specialCategories: [],
  menuCountsBySpecialCategory: {},
  mainCategories: [],
  menuCountsByMainCategory: {},
  hideAllTab: false,
  initialActiveTab: "All",
  showScrollButtons: true,
  showIcons: true,
  layout: "horizontal",
  size: "md",
  allowMultiSelect: false,
  maxSelections: 3,
  searchable: false,
  loading: false,
  emptyMessage: "No categories available",
  ariaLabel: "Category navigation",
};

export default CategoryTabs;

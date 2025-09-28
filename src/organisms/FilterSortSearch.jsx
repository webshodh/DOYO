import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Search, SortAsc, SortDesc, X, Check } from "lucide-react";
import useOutsideClick from "hooks/useOutsideClick";
import SearchInput from "atoms/SearchInput";

import SortModal from "../components/SortModal";

// Main FilterSortSearch component
const FilterSortSearch = memo(
  ({
    // Search props
    searchTerm = "",
    handleSearch,
    searchPlaceholder = "What are you looking for?",

    // Sort props
    handleSort,
    currentSort = "default",

    // State props
    disabled = false,
    loading = false,

    // Styling props
    className = "",
    searchClassName = "",

    ...rest
  }) => {
    const [showSortModal, setShowSortModal] = useState(false);

    const hasActiveSort = useMemo(() => {
      return currentSort !== "default";
    }, [currentSort]);

    const getSortIcon = useMemo(() => {
      switch (currentSort) {
        case "lowToHigh":
          return SortAsc;
        case "highToLow":
          return SortDesc;
        default:
          return SortAsc;
      }
    }, [currentSort]);

    const getSortLabel = useMemo(() => {
      return currentSort === "default" ? "Sort" : null;
    }, [currentSort]);

    return (
      <>
        <div
          className={`flex flex-row sm:flex-row sm:items-center gap-3 w-full ${className}`}
          {...rest}
        >
          {/* Search Input */}
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className={searchClassName}
          />

          {/* Sort Button */}
          <button
            onClick={() => setShowSortModal(true)}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative ${
              disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : hasActiveSort
                ? "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-sm hover:shadow-md"
                : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm hover:shadow-md"
            }`}
          >
            {React.createElement(getSortIcon, {
              className: "w-4 h-4 flex-shrink-0",
            })}
            {getSortLabel && (
              <span className="hidden sm:inline">{getSortLabel}</span>
            )}
            {hasActiveSort && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                •
              </span>
            )}
          </button>
        </div>

        {/* Sort Modal */}
        <SortModal
          isOpen={showSortModal}
          onClose={() => setShowSortModal(false)}
          currentSort={currentSort}
          onSort={handleSort}
        />
      </>
    );
  }
);

FilterSortSearch.displayName = "FilterSortSearch";

// Default props
FilterSortSearch.defaultProps = {
  searchTerm: "",
  searchPlaceholder: "What are you looking for?",
  currentSort: "default",
  disabled: false,
  loading: false,
};

export default FilterSortSearch;

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Search, SortAsc, SortDesc, X, Check } from "lucide-react";

// Custom hook for outside click detection
const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// Search input component
const SearchInput = memo(
  ({
    searchTerm,
    onSearchChange,
    placeholder,
    disabled = false,
    className = "",
  }) => {
    const [localValue, setLocalValue] = useState(searchTerm || "");

    useEffect(() => {
      setLocalValue(searchTerm || "");
    }, [searchTerm]);

    const handleChange = useCallback(
      (e) => {
        const value = e.target.value;
        setLocalValue(value);
        if (onSearchChange) {
          onSearchChange(e);
        }
      },
      [onSearchChange]
    );

    const handleClear = useCallback(() => {
      setLocalValue("");
      if (onSearchChange) {
        const syntheticEvent = { target: { value: "" } };
        onSearchChange(syntheticEvent);
      }
    }, [onSearchChange]);

    return (
      <div className={`relative flex-1 min-w-0 ${className}`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={localValue}
            onChange={handleChange}
            disabled={disabled}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-200 text-sm ${
              disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                : "bg-white border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 hover:border-gray-400"
            } focus:outline-none`}
            aria-label={placeholder}
          />
          {localValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

// Sort Modal Component
const SortModal = memo(({ isOpen, onClose, currentSort, onSort }) => {
  const modalRef = useRef(null);

  useOutsideClick(modalRef, onClose);

  const sortOptions = useMemo(
    () => [
      { key: "default", label: "Default", icon: null },
      { key: "lowToHigh", label: "Price: Low to High", icon: SortAsc },
      { key: "highToLow", label: "Price: High to Low", icon: SortDesc },
    ],
    []
  );

  const handleSortSelect = useCallback(
    (sortKey) => {
      if (onSort) {
        onSort(sortKey);
      }
      onClose();
    },
    [onSort, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>

        <div
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full mt-5"
        >
          <div className="bg-white px-4 pt-8 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Sort By Price
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSortSelect(option.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                    currentSort === option.key
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && <option.icon className="w-4 h-4" />}
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {currentSort === option.key && (
                    <Check className="w-4 h-4 text-orange-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SortModal.displayName = "SortModal";

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

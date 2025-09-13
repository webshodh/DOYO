import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Home,
  X,
  ChevronDown,
  Check,
  Grid,
  List,
} from "lucide-react";

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

// Dropdown component
const Dropdown = memo(
  ({
    isOpen,
    onToggle,
    onClose,
    trigger,
    children,
    className = "",
    position = "right",
  }) => {
    const dropdownRef = useRef(null);

    useOutsideClick(dropdownRef, onClose);

    const positionClasses = {
      left: "left-0",
      right: "right-0",
      center: "left-1/2 transform -translate-x-1/2",
    };

    return (
      <div className="relative" ref={dropdownRef}>
        {React.cloneElement(trigger, {
          onClick: onToggle,
          "aria-expanded": isOpen,
          "aria-haspopup": true,
        })}

        {isOpen && (
          <div
            className={`absolute ${positionClasses[position]} mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in slide-in-from-top-2 duration-200 ${className}`}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";

// Dropdown item component
const DropdownItem = memo(
  ({
    children,
    onClick,
    selected = false,
    disabled = false,
    className = "",
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
        disabled
          ? "text-gray-400 cursor-not-allowed"
          : selected
          ? "bg-orange-50 text-orange-700"
          : "text-gray-700 hover:bg-gray-50"
      } ${className}`}
      role="menuitem"
    >
      <span>{children}</span>
      {selected && <Check className="w-4 h-4 text-orange-600" />}
    </button>
  )
);

DropdownItem.displayName = "DropdownItem";

// Sort dropdown component
const SortDropdown = memo(({ onSort, currentSort, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = useMemo(
    () => [
      { key: "default", label: "Default", icon: null },
      { key: "lowToHigh", label: "Price: Low to High", icon: SortAsc },
      { key: "highToLow", label: "Price: High to Low", icon: SortDesc },
    ],
    []
  );

  const handleSort = useCallback(
    (sortKey) => {
      if (onSort) {
        onSort(sortKey);
      }
      setIsOpen(false);
    },
    [onSort]
  );

  const currentSortOption =
    sortOptions.find((option) => option.key === currentSort) || sortOptions[0];

  const trigger = (
    <button
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-sm hover:shadow-md"
      }`}
    >
      <SortAsc className="w-4 h-4" />
      <span className="hidden sm:inline">Sort</span>
      <ChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );

  return (
    <Dropdown
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onClose={() => setIsOpen(false)}
      trigger={trigger}
    >
      {sortOptions.map((option) => (
        <DropdownItem
          key={option.key}
          onClick={() => handleSort(option.key)}
          selected={currentSort === option.key}
        >
          <div className="flex items-center gap-2">
            {option.icon && <option.icon className="w-4 h-4" />}
            {option.label}
          </div>
        </DropdownItem>
      ))}
    </Dropdown>
  );
});

SortDropdown.displayName = "SortDropdown";

// Category filter dropdown component
const CategoryFilterDropdown = memo(
  ({
    categories = [],
    onCategoryFilter,
    selectedCategory,
    disabled = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleCategorySelect = useCallback(
      (category) => {
        if (onCategoryFilter) {
          onCategoryFilter(category);
        }
        setIsOpen(false);
      },
      [onCategoryFilter]
    );

    const trigger = (
      <button
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm hover:shadow-md"
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filter</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    );

    return (
      <Dropdown
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onClose={() => setIsOpen(false)}
        trigger={trigger}
        className="max-h-64 overflow-y-auto"
      >
        <DropdownItem
          onClick={() => handleCategorySelect(null)}
          selected={!selectedCategory}
        >
          All Categories
        </DropdownItem>
        {categories.length > 0 ? (
          categories.map((category) => (
            <DropdownItem
              key={category.id || category.name}
              onClick={() => handleCategorySelect(category)}
              selected={
                selectedCategory?.id === category.id ||
                selectedCategory?.name === category.name
              }
            >
              {category.name}
              {category.count && (
                <span className="text-xs text-gray-500 ml-2">
                  ({category.count})
                </span>
              )}
            </DropdownItem>
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No categories available
          </div>
        )}
      </Dropdown>
    );
  }
);

CategoryFilterDropdown.displayName = "CategoryFilterDropdown";

// Action button component
const ActionButton = memo(
  ({
    to,
    onClick,
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    disabled = false,
    className = "",
  }) => {
    const variants = {
      primary:
        "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500",
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500",
      danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const baseClasses = `inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`;

    const content = (
      <>
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </>
    );

    if (to) {
      return (
        <Link to={to} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button onClick={onClick} disabled={disabled} className={baseClasses}>
        {content}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";

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

    // Category filter props
    handleCategoryFilter,
    categories = [],
    selectedCategory = null,

    // Layout props
    layout = "horizontal", // horizontal, vertical, compact
    showHomeButton = true,
    homeButtonProps = {},

    // State props
    disabled = false,
    loading = false,

    // Styling props
    className = "",
    searchClassName = "",
    controlsClassName = "",

    // Additional props
    onReset,
    showReset = false,

    ...rest
  }) => {
    // Handle reset functionality
    const handleReset = useCallback(() => {
      if (onReset) {
        onReset();
      }
    }, [onReset]);

    // Layout classes
    const layoutClasses = useMemo(() => {
      switch (layout) {
        case "vertical":
          return "flex-col gap-4";
        case "compact":
          return "flex-row items-center gap-2";
        default:
          return "flex-col sm:flex-row sm:items-center gap-3";
      }
    }, [layout]);

    return (
      <div className={`flex ${layoutClasses} w-full ${className}`} {...rest}>
        {/* Search Input */}
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          placeholder={searchPlaceholder}
          disabled={disabled}
          className={searchClassName}
        />

        {/* Controls */}
        <div
          className={`flex items-center gap-3 flex-wrap ${controlsClassName}`}
        >
          {/* Sort Dropdown */}
          {handleSort && (
            <SortDropdown
              onSort={handleSort}
              currentSort={currentSort}
              disabled={disabled}
            />
          )}

          {/* Category Filter Dropdown */}
          {handleCategoryFilter && (
            <CategoryFilterDropdown
              categories={categories}
              onCategoryFilter={handleCategoryFilter}
              selectedCategory={selectedCategory}
              disabled={disabled}
            />
          )}

          {/* Reset Button */}
          {showReset && onReset && (
            <ActionButton
              onClick={handleReset}
              variant="secondary"
              size="md"
              disabled={disabled}
              icon={X}
            >
              Reset
            </ActionButton>
          )}
c        </div>
      </div>
    );
  }
);

FilterSortSearch.displayName = "FilterSortSearch";

// Default props
FilterSortSearch.defaultProps = {
  searchTerm: "",
  searchPlaceholder: "What are you looking for?",
  categories: [],
  currentSort: "default",
  selectedCategory: null,
  layout: "horizontal",
  showHomeButton: true,
  disabled: false,
  loading: false,
  showReset: false,
};

export default FilterSortSearch;

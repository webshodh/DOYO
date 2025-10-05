import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Plus, Search, X, Loader, ArrowRight, Filter } from "lucide-react";

// Enhanced search input component
const SearchInput = memo(
  ({
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    disabled,
    error,
    showSearchIcon = true,
    showClearButton = true,
    onClear,
    className = "",
  }) => {
    return (
      <div className={`relative flex-1 ${className}`}>
        {/* Search icon */}
        {showSearchIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${showSearchIcon ? "pl-10" : "pl-4"} ${
            showClearButton && value ? "pr-10" : "pr-4"
          } py-3 border rounded-lg transition-all duration-200 text-sm ${
            error
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                : "border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 hover:border-gray-400"
          } focus:outline-none`}
          aria-label={placeholder}
        />

        {/* Clear button */}
        {showClearButton && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

// Action button component
const ActionButton = memo(
  ({
    onClick,
    disabled,
    loading,
    variant = "primary",
    size = "md",
    icon: Icon = Plus,
    children,
    ariaLabel,
    className = "",
  }) => {
    const variants = {
      primary:
        "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 focus:ring-orange-500",
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 focus:ring-gray-500",
      success:
        "bg-green-500 hover:bg-green-600 text-white border-green-500 focus:ring-green-500",
      danger:
        "bg-red-500 hover:bg-red-600 text-white border-red-500 focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`inline-flex items-center gap-2 border font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        aria-label={ariaLabel}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        {children}
      </button>
    );
  },
);

ActionButton.displayName = "ActionButton";

// Main SearchWithButton component
const SearchWithButton = memo(
  ({
    // Search props
    searchTerm = "",
    onSearchChange,
    onSearchSubmit,
    placeholder = "What are you looking for?",

    // Button props
    buttonText = "",
    onButtonClick,
    buttonVariant = "primary",
    buttonIcon = Plus,
    buttonSize = "md",

    // Layout props
    layout = "horizontal", // horizontal, vertical, inline
    width = "full",
    gap = "gap-3",

    // State props
    disabled = false,
    loading = false,
    onlyView = false,

    // Styling props
    className = "",
    searchClassName = "",
    buttonClassName = "",

    // Enhanced features
    showSearchIcon = true,
    showClearButton = true,
    autoFocus = false,
    debounceMs = 300,
    error = "",

    // Event handlers
    onFocus,
    onBlur,
    onClear,

    ...rest
  }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [isFocused, setIsFocused] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    // Sync with external searchTerm prop
    useEffect(() => {
      setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Debounced search change handler
    const handleSearchChange = useCallback(
      (e) => {
        const value = e.target.value;
        setLocalSearchTerm(value);

        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        if (onSearchChange) {
          if (debounceMs > 0) {
            const timer = setTimeout(() => {
              onSearchChange(e);
            }, debounceMs);
            setDebounceTimer(timer);
          } else {
            onSearchChange(e);
          }
        }
      },
      [onSearchChange, debounceMs, debounceTimer],
    );

    // Handle search submit (Enter key)
    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" && onSearchSubmit) {
          e.preventDefault();
          onSearchSubmit(localSearchTerm, e);
        }
      },
      [localSearchTerm, onSearchSubmit],
    );

    // Handle clear
    const handleClear = useCallback(() => {
      setLocalSearchTerm("");
      if (onClear) {
        onClear();
      }
      if (onSearchChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        };
        onSearchChange(syntheticEvent);
      }
    }, [onClear, onSearchChange]);

    // Handle focus/blur
    const handleFocus = useCallback(
      (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
      },
      [onBlur],
    );

    // Handle button click
    const handleButtonClick = useCallback(
      (e) => {
        if (onButtonClick) {
          onButtonClick(localSearchTerm, e);
        }
      },
      [localSearchTerm, onButtonClick],
    );

    // Layout classes
    const layoutClasses = useMemo(() => {
      switch (layout) {
        case "vertical":
          return "flex-col items-stretch";
        case "inline":
          return "flex-row items-center";
        default:
          return "flex-col sm:flex-row sm:items-center";
      }
    }, [layout]);

    // Width classes
    const widthClasses = useMemo(() => {
      if (typeof width === "string") {
        return width === "full" ? "w-full" : `w-${width}`;
      }
      return "w-full";
    }, [width]);

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      };
    }, [debounceTimer]);

    return (
      <div
        className={`flex ${layoutClasses} ${gap} ${widthClasses} ${className}`}
        {...rest}
      >
        {/* Search Input */}
        <div className={`flex-1 ${searchClassName}`}>
          <SearchInput
            value={localSearchTerm}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            showSearchIcon={showSearchIcon}
            showClearButton={showClearButton}
            onClear={handleClear}
            autoFocus={autoFocus}
          />

          {/* Error message */}
          {error && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <X className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>

        {/* Action Button */}
        {!onlyView && (
          <div className="flex-shrink-0">
            <ActionButton
              onClick={handleButtonClick}
              disabled={disabled}
              loading={loading}
              variant={buttonVariant}
              size={buttonSize}
              icon={buttonIcon}
              ariaLabel={buttonText || "Add item"}
              className={buttonClassName}
            >
              {buttonText && (
                <span className="hidden sm:inline">{buttonText}</span>
              )}
            </ActionButton>
          </div>
        )}
      </div>
    );
  },
);

SearchWithButton.displayName = "SearchWithButton";

// Pre-configured variants
export const SearchWithAdd = memo((props) => (
  <SearchWithButton
    buttonIcon={Plus}
    buttonText="Add"
    buttonVariant="primary"
    placeholder="Search to add items..."
    {...props}
  />
));

export const SearchWithFilter = memo((props) => (
  <SearchWithButton
    buttonIcon={Filter}
    buttonText="Filter"
    buttonVariant="secondary"
    placeholder="Search and filter results..."
    {...props}
  />
));

export const SearchWithSubmit = memo((props) => (
  <SearchWithButton
    buttonIcon={ArrowRight}
    buttonText="Search"
    buttonVariant="primary"
    placeholder="Enter your search query..."
    {...props}
  />
));

// Default props
SearchWithButton.defaultProps = {
  searchTerm: "",
  placeholder: "What are you looking for?",
  buttonText: "",
  buttonVariant: "primary",
  buttonIcon: Plus,
  buttonSize: "md",
  layout: "horizontal",
  width: "full",
  gap: "gap-3",
  disabled: false,
  loading: false,
  onlyView: false,
  showSearchIcon: true,
  showClearButton: true,
  autoFocus: false,
  debounceMs: 300,
  error: "",
};

// Display names for variants
SearchWithAdd.displayName = "SearchWithAdd";
SearchWithFilter.displayName = "SearchWithFilter";
SearchWithSubmit.displayName = "SearchWithSubmit";

export default SearchWithButton;

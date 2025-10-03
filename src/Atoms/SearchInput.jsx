import { Search, X } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

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
      [onSearchChange],
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
  },
);

SearchInput.displayName = "SearchInput";
export default SearchInput;

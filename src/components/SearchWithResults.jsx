import React from "react";

const SearchWithResults = ({
  // Search props
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  searchComponent: SearchComponent,
  searchProps = {},

  // Results props
  totalCount = 0,
  filteredCount = 0,

  // Clear functionality
  onClearSearch,
  clearButtonText = "Clear",

  // Add button props
  onAdd,
  addButtonText = "Add",
  addButtonLoading = false,
  showAddButton = true,

  // Styling
  className = "",
  containerClassName = "bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6",

  // Labels
  totalLabel = "total",
  showingLabel = "Showing",
  ofLabel = "of",

  // Additional content
  children,
  rightContent,
}) => {
  const hasActiveSearch = searchTerm && searchTerm.trim().length > 0;
  const displayFilteredCount = hasActiveSearch ? filteredCount : totalCount;

  return (
    <div className={containerClassName}>
      <div className="flex flex-row items-center gap-3 w-full">
        {/* Search Section */}
        <div className="flex-1">
          {SearchComponent ? (
            <SearchComponent
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              placeholder={placeholder}
              className="w-full"
              {...searchProps}
            />
          ) : (
            <input
              type="text"
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}
        </div>

        {/* Add Button */}
        {showAddButton && onAdd && (
          <button
            onClick={onAdd}
            disabled={addButtonLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 font-medium whitespace-nowrap"
          >
            {addButtonLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>{addButtonText}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Results Counter, Clear Button, and Add Button */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          {hasActiveSearch ? (
            <>
              <span>
                {showingLabel} {displayFilteredCount} {ofLabel} {totalCount}
              </span>
              {onClearSearch && (
                <button
                  onClick={onClearSearch}
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  {clearButtonText}
                </button>
              )}
            </>
          ) : (
            <span>
              {totalCount} {totalLabel}
            </span>
          )}
          {rightContent}
        </div>
      </div>

      {children}
    </div>
  );
};
export default SearchWithResults;

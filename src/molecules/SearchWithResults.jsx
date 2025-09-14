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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Section */}
        <div className="flex-1 min-w-0">
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
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${className}`}
            />
          )}
        </div>

        {/* Results Counter and Clear Button */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
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

import React, { useState } from "react";
import { FaSortAmountUp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { colors } from "theme/theme";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
const FilterSortSearch = ({
  searchTerm,
  handleSearch,
  handleSort,
  handleCategoryFilter,
  categories,
}) => {
  // State to manage the dropdown visibility
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Function to toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex flex-wrap items-center ml-2">
      {/* Search */}
      <div className="flex-grow mb-1">
        <input
          type="text"
          placeholder="What are you looking for?"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full border border-orange-500 rounded-full py-2 px-4 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Sort by Price */}
      {handleSort && (
        <div className="relative mb-1 ml-2">
          <button
            onClick={toggleDropdown}
            className="bg-orange-500 text-white rounded-full py-2 px-4 flex items-center justify-center hover:bg-orange-600 focus:outline-none"
            id="dropdownSortButton"
          >
            <FaSortAmountUp />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-1000">
              <button
                onClick={() => {
                  handleSort("lowToHigh");
                  toggleDropdown(); // Close dropdown after selecting an option
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Low to High
              </button>
              <button
                onClick={() => {
                  handleSort("highToLow");
                  toggleDropdown(); // Close dropdown after selecting an option
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                High to Low
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter by Category */}
      {handleCategoryFilter && (
        <>
          <div className="relative mb-1 ml-2">
            <button
              className="bg-red-500 text-white rounded-full py-2 px-4 hover:bg-red-600 focus:outline-none"
              id="dropdownCategoryFilterButton"
            >
              Filter by Category
            </button>
            {/* Category dropdown similar to the sort dropdown */}
          </div>
          <Link
            to="/"
            className="bg-green-500 text-white rounded-full py-2 px-6 ml-4 hover:bg-green-600 focus:outline-none"
          >
            Home
          </Link>
        </>
      )}
    </div>
  );
};

export default FilterSortSearch;

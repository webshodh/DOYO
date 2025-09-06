import React from "react";
import { PlusIcon } from '@heroicons/react/24/outline';

const SearchWithButton = ({
  searchTerm,
  onSearchChange,
  buttonText,
  onButtonClick,
  placeholder = "What are you looking for?",
  inputWidth = "80%",
  buttonColor = "bg-orange-500",
  onlyView=false
}) => {
  return (
    <div className="d-flex" style={{ width: "100%" }}>
      {/* Search Bar */}
      <div
        className="relative"
        style={{ width: inputWidth, marginRight: "10px" }}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full border border-orange-500 rounded-full py-2 px-4 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      {/* Button */}
      {!onlyView &&
      <div>
        <button
          onClick={onButtonClick}
          className={`px-2 py-2 mr-2 text-white ${buttonColor} rounded-md mt-2`}
        >
          {/* {buttonText} */}
          <PlusIcon className="h-6 w-6 text-white-500" />
        </button>
      </div>
}
    </div>
  );
};

export default SearchWithButton;

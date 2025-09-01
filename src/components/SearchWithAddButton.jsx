import React from "react";

const SearchWithButton = ({
  searchTerm,
  onSearchChange,
  buttonText,
  onButtonClick,
  placeholder = "What are you looking for?",
  inputWidth = "80%",
  buttonColor = "bg-orange-500",
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
      <div>
        <button
          onClick={onButtonClick}
          className={`px-4 py-2 mr-2 text-white ${buttonColor} rounded-md mt-2`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SearchWithButton;

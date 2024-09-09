import React from "react";

const FilterButtons = ({ filterType, setFilterType }) => {
  return (
    <div className="flex justify-end mt-5 mb-4" style={{ width: '100%' }}>
      <div className="flex space-x-4 border-b border-gray-300">
        {["Daily", "Weekly", "Monthly"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 text-lg font-medium rounded-t-lg transition-all duration-300 ${
              filterType === type
                ? "text-orange-500 border-b-2 border-orange-500 bg-white shadow"
                : "text-gray-700 hover:text-orange-500 hover:border-b-2 hover:border-orange-500"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtons;

import React from "react";
import { colors } from "../../theme/theme";

const ImgCard = ({ count, label, type, src }) => {
  // Define the badge color based on the type prop
  const badgeColor = '#00C000'; // You can modify this based on the type if needed

  return (
    <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
      <div
        className={`relative flex flex-col items-center text-center p-4 rounded-lg bg-white shadow-md ${type}`}
      >
        {src && (
          <div className="mb-2">
            <img
              src={src}
              alt={label}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="mb-2">
          <span className="text-base text-gray-600">{label}</span>
        </div>
        <div
          className="absolute top-2 right-2 w-10 h-10 bg-green-500 text-white flex items-center justify-center rounded-full text-base font-bold"
          style={{ backgroundColor: badgeColor }}
        >
          {count}
        </div>
      </div>
    </div>
  );
};

export default ImgCard;

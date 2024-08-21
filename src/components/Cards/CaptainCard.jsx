import React from "react";
import { colors } from "../../theme/theme"; // If you need custom colors

const CaptainCard = ({
  fullName,
  imageUrl,
  upiId,
  selectedCaptain,
  setSelectedCaptain,
  isSelected,
}) => {
  const handleSelect = () => {
    setSelectedCaptain(fullName, imageUrl, upiId);
  };

  return (
    <div
      onClick={handleSelect}
      className={`flex bg-white text-black rounded-lg shadow-md overflow-hidden m-2 cursor-pointer transition-colors duration-300 
        ${selectedCaptain?.fullName === fullName ? 'border-4 border-orange-500' : ''} 
        hover:bg-orange-500 hover:text-white active:bg-orange-500 active:text-white`}
    >
      <div className="flex-shrink-0 w-24 h-24 overflow-hidden">
        <img
          src={imageUrl || "/captain.png"} // Placeholder image for captain
          alt={fullName}
          className="w-full h-full object-cover rounded-l-lg"
        />
      </div>
      <div className="flex-1 p-2 flex flex-col justify-center max-w-xs">
        <div className="mb-2 break-words">{fullName}</div>
        <div className="flex">
          <div className="break-words">{upiId}</div>
        </div>
      </div>
    </div>
  );
};

export default CaptainCard;

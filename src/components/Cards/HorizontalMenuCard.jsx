import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuModal from "../MenuModal";

const HorizontalMenuCard = ({ item, handleImageLoad }) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const truncatedContent =
    item.menuName.length > 12
      ? item.menuName.slice(0, 12) + "..."
      : item.menuName;

  return (
    <div className="w-full max-w-full mx-auto mb-1">
      <div className="flex bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100">
        {/* Image Container */}
        <div className="flex-shrink-0 w-28 sm:w-32 md:w-36 relative overflow-hidden">
          {/* Loading Spinner */}
          {!item.imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-6 h-6 border-4 border-t-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          )}

          <img
            src={item.imageUrl || "/dish.png"}
            alt={item.menuName}
            onLoad={handleImageLoad}
            onError={(e) => {
              e.target.src = "/dish.png";
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ height: "151px" }}
          />

          {/* Discount Badge */}
          {item.discount > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <span className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-1.5 px-2 text-center shadow-lg">
                🔥 {item.discount}% OFF
              </span>
            </div>
          )}

          {/* Main Category Badge */}
          {item.mainCategory && (
            <div className="absolute top-2 left-2">
              <span className="bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-md shadow-md">
                {item.mainCategory}
              </span>
            </div>
          )}

          {/* Availability Overlay */}
          {item.availability !== "Available" && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                {item.availability}
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 p-4 flex flex-col justify-between relative min-h-[120px]">
          {/* Menu Category Icon */}
          <div className="absolute top-3 right-3">
            <div className="bg-white rounded-full p-1.5 shadow-md border border-gray-100">
              {item.categoryType === "Veg" || item.categoryType === "veg" ? (
                <img
                  src="/veglogo.jpeg"
                  alt={item.categoryType}
                  className="w-4 h-4"
                />
              ) : item.categoryType === "Non Veg" ||
                item.categoryType === "Non-veg" ||
                item.categoryType === "non-veg" ||
                item.categoryType === "Nonveg" ? (
                <img
                  src="/nonVeglogo.png"
                  alt={item.categoryType}
                  className="w-4 h-4"
                />
              ) : null}
            </div>
          </div>

          {/* Top Section */}
          <div className="pr-8">
            {/* Menu Name */}
            <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">
              {truncatedContent}
            </h3>

            {/* Cooking Time & Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <i className="bi bi-stopwatch-fill mr-1 text-orange-500"></i>
                <span className="text-sm font-medium">
                  {item.menuCookingTime} min
                </span>
              </div>

              <div className="flex items-center">
                <i className="bi bi-currency-rupee mr-1 text-orange-500"></i>
                <div className="flex items-center">
                  {item.discount && item.discount > 0 && (
                    <span className="line-through text-red-400 text-sm mr-2">
                      ₹{Math.round(item.menuPrice)}
                    </span>
                  )}
                  <span className="text-orange-500 text-xl font-bold">
                    ₹{item.finalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
            <button
              className={`text-sm font-semibold transition-all duration-200 ${
                item.availability === "Available"
                  ? "text-orange-500 hover:text-orange-600 hover:underline cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={() =>
                item.availability === "Available" && handleShow(item)
              }
              disabled={item.availability !== "Available"}
            >
              {item.availability === "Available"
                ? "View Details"
                : "Unavailable"}
            </button>
          </div>
        </div>

        {/* Hover Effect Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      <MenuModal show={show} handleClose={handleClose} modalData={modalData} />
    </div>
  );
};

export default HorizontalMenuCard;

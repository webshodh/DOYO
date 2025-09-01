import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuModal from "../MenuModal";

const VerticalMenuCard = ({ item, handleImageLoad }) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const truncatedContent =
    item.menuName.length > 20
      ? item.menuName.slice(0, 20) + "..."
      : item.menuName;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden relative group">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          {/* Loading Spinner */}
          {!item.imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Main Image */}
          <img
            src={item.imageUrl || "/dish.png"}
            alt={item.menuName}
            onLoad={handleImageLoad}
            onError={(e) => {
              e.target.src = "/dish.png";
            }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {item.discount > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg animate-pulse">
                {item.discount}% OFF
              </span>
            </div>
          )}

          {/* Main Category Badge */}
          {item.mainCategory && (
            <div className="absolute top-3 right-3">
              <span className="bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-md shadow-md">
                {item.mainCategory}
              </span>
            </div>
          )}

          {/* Availability Badge */}
          {item.availability !== "Available" && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 text-sm font-bold rounded-full">
                {item.availability}
              </span>
            </div>
          )}

          {/* Menu Category Icon */}
          <div className="absolute bottom-3 right-3 bg-white rounded-full p-1.5 shadow-md">
            {item.categoryType === "Veg" ||
            item.categoryType === "veg" ? (
              <img src="/veglogo.jpeg" alt="Veg" className="w-5 h-5" />
            ) : item.categoryType === "Nonveg" ||
              item.categoryType === "Non Veg" ? (
              <img src="/nonVeglogo.png" alt="Nonveg" className="w-5 h-5" />
            ) : null}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Restaurant Name */}
          <h5 className="text-gray-500 text-sm font-medium mb-1 truncate">
            {item.restaurantName}
          </h5>

          {/* Menu Name */}
          <h2 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
            {truncatedContent}
          </h2>

          {/* Price and Time Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-600">
              <i className="bi bi-stopwatch-fill mr-1 text-orange-500"></i>
              <span className="text-sm">{item.menuCookingTime} min</span>
            </div>

            <div className="flex items-center">
              <i className="bi bi-currency-rupee mr-1 text-orange-500"></i>
              <div className="flex items-center">
                {item.discount && item.discount > 0 && (
                  <span className="line-through text-red-500 text-sm mr-2">
                    ₹{Math.round(item.menuPrice)}
                  </span>
                )}
                <span className="text-orange-500 text-xl font-bold">
                  ₹{item.finalPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                item.availability === "Available"
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-orange-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 pointer-events-none"></div>
      </div>

      {/* Modal */}
      <MenuModal show={show} handleClose={handleClose} modalData={modalData} />
    </div>
  );
};

export default VerticalMenuCard;

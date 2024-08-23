import React, { useState } from "react";
import MenuModal from "../MenuModal";

const Veg = "../..";
const Nonveg = "../../nonVeglogo.png";

const MenuCard = ({ item, handleImageLoad, showDetail, addToCart }) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const discountPercentage = item.originalPrice
    ? Math.round(
        ((item.originalPrice - item.menuPrice) / item.originalPrice) * 100
      )
    : null;

  return (
    <>
      <div
        className="flex flex-col border rounded-lg shadow-lg m-2 cursor-pointer relative transition-transform duration-300 ease-in-out transform hover:scale-105"
        style={{ width: "200px" }}
      >
        {/* Discount Badge */}
        {/* {discountPercentage > 0 && ( */}
        <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs rounded">
          {discountPercentage}% OFF
        </span>
        {/* )} */}

        {/* Availability Badge */}
        {item.availability !== "Available" && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
            {item.availability}
          </span>
        )}

        {/* Loading Spinner */}
        {!item.imageUrl && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Image */}
        <img
          src={item.imageUrl}
          alt={item.menuName}
          onLoad={handleImageLoad}
          className="w-full h-40 object-cover rounded-t-lg"
        />

        {/* Content */}
        <div className="p-2 text-left w-full">
          <h5 className="text-gray-600 font-semibold text-sm">
            {item.restaurantName}
          </h5>
          <h2 className="text-lg font-bold text-gray-800">
            {item.menuName}{" "}
            {item.menuCategory === "Veg" ||
            item.menuCategory === "Dosas & Uttapam" ? (
              <img
                className="inline w-5 h-5 ml-1"
                src={"/veglogo.jpeg"}
                alt="Veg"
              />
            ) : item.menuCategory === "Nonveg" ? (
              <img
                className="inline w-5 h-5 ml-1"
                src={"/nonVeglogo.png"}
                alt="Nonveg"
              />
            ) : null}
          </h2>

          <div className="flex items-center text-sm text-gray-600 my-2">
            <img className="w-5 h-5 mr-1" src="/time.png" alt="Cooking Time" />
            {item.menuCookingTime} min
            <span className="mx-2">|</span>
            <img className="w-5 h-5 mr-1" src="/rupee.png" alt="Menu Price" />
            <span className="text-gray-400 line-through mr-2">
              {item.originalPrice && `₹${item.originalPrice}`}
            </span>
            <span className="text-red-600 font-bold">{`₹${item.menuPrice}`}</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="w-full flex justify-between items-center px-2 py-1">
          <button
            className={`text-orange-500 hover:underline ${
              item.availability === "Available"
                ? "cursor-pointer"
                : "cursor-not-allowed"
            }`}
            onClick={() =>
              item.availability === "Available" && handleShow(item)
            }
          >
            Read More
          </button>
          <div className="relative">
            <button
              style={{ width: "30px", height: "30px" }}
              className={`bg-orange-500 text-white rounded-full shadow ${
                item.availability === "Available"
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              }`}
              onClick={() => addToCart(item.uuid)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Modal Data */}
      <MenuModal
        show={show}
        handleClose={handleClose}
        modalData={modalData}
        addToCart={addToCart}
      />
    </>
  );
};

export default MenuCard;

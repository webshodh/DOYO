import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import MenuModal from "../MenuModal";

const Veg = "../../veglogo.jpeg";
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

  return (
    <>
      <div className="flex flex-col items-center p-4 border rounded-lg shadow-lg m-4 cursor-pointer relative transition-transform duration-300 ease-in-out transform hover:scale-105">
        {item.availability !== "Available" && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
            {item.availability}
          </span>
        )}
        {!item.imageUrl && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        )}
        <img
          src={item.imageUrl}
          alt={item.menuName}
          onLoad={handleImageLoad}
          className="w-full h-40 object-cover rounded-t-lg"
        />
        <div className="p-2 text-left w-full">
          <h5 className="text-lg font-semibold">{item.menuName}</h5>
          <div className="flex items-center my-2">
            {item.menuCategory === "Veg" || item.menuCategory === "Dosas & Uttapam" ? (
              <img className="w-6 h-6" src={Veg} alt="Veg" />
            ) : item.menuCategory === "Nonveg" ? (
              <img className="w-6 h-6" src={Nonveg} alt="Nonveg" />
            ) : null}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <img className="w-5 h-5 mr-1" src="/time.png" alt="Cooking Time" />
            {item.menuCookingTime} min
            <span className="mx-2">|</span>
            <img className="w-5 h-5 mr-1" src="/rupee.png" alt="Menu Price" />
            {item.menuPrice}
          </div>
        </div>
        <div className="w-full flex justify-between px-2 py-1">
          <button
            className={`text-orange-500 hover:underline ${item.availability === "Available" ? "cursor-pointer" : "cursor-not-allowed"}`}
            onClick={() => item.availability === "Available" && handleShow(item)}
          >
            Read More
          </button>
          <button
            className={`bg-orange-500 text-white py-1 px-3 rounded ${item.availability === "Available" ? "cursor-pointer" : "cursor-not-allowed"}`}
            onClick={() => addToCart(item.uuid)}
          >
            Add to Cart
          </button>
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

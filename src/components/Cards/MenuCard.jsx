import React, { useState } from "react";
import MenuModal from "../MenuModal";
import Button from "react-bootstrap/Button";

const Veg = "../..";
const Nonveg = "../../nonVeglogo.png";

const MenuCard = ({ item, handleImageLoad, showDetail, addToCart, onAddQuantity,
  onRemoveQuantity, }) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(item.uuid, quantity);
    setIsAdded(true);
    setQuantity(1);
  };
  const handleIncreaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
    onAddQuantity(item.uuid);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 0));
    onRemoveQuantity(item.uuid);
  };
  const discountPercentage = item.originalPrice
    ? Math.round(
        ((item.originalPrice - item.menuPrice) / item.originalPrice) * 100
      )
    : null;

  return (
    <>
    
      <div
      className="flex flex-col border rounded-lg shadow-lg m-2 cursor-pointer relative transition-transform duration-300 ease-in-out "
      style={{ width: "200px" }}
    >
     
     {/* Discount Badge */}
     {item.discount > 0 && (
        <span className="absolute left-0 w-full bg-orange-500 text-white text-xs font-bold py-1 px-2" style={{bottom:'125px'}}>
          {item.discount}% OFF
        </span>
     )}
      {/* Orange Strip for Main Category */}
      {item.mainCategory && (
        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold py-1 px-2">
          {item.mainCategory}
        </div>
      )}
    
      {/* Availability Badge */}
      {item.availability !== "Available" && (
        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
          {item.availability}
        </span>
      )}
    
      {/* Loading Spinner */}
      {!item.imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    
      {/* Image */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.menuName}
          onLoad={handleImageLoad}
          onError={(e) => {
            e.target.src = "/default-image.png"; // Fallback image if loading fails
          }}
          className="w-full h-40 object-cover rounded-t-lg"
        />
      )}
       
    
      {/* Content */}
      <div className="p-2 text-left w-full">
        <h5 className="text-gray-600 font-semibold text-sm">{item.restaurantName}</h5>
        <h2 className="text-lg font-bold text-gray-800">
          {item.menuName}{" "}
          {item.menuCategory === "Veg" || item.menuCategory === "Dosas & Uttapam" ? (
            <img
              className="inline w-5 h-5 ml-1"
              src="/veglogo.jpeg"
              alt="Veg"
            />
          ) : item.menuCategory === "Nonveg" ? (
            <img
              className="inline w-5 h-5 ml-1"
              src="/nonVeglogo.png"
              alt="Nonveg"
            />
          ) : null}
        </h2>
    
        <div className="flex items-center text-sm text-gray-600 my-2">
          <img className="w-5 h-5 mr-1" src="/time.png" alt="Cooking Time" />
          {item.menuCookingTime} min
          <span className="mx-2">|</span>
          <img className="w-5 h-5 mr-1" src="/rupee.png" alt="Menu Price" />
          <span>
            {item.discount > 0 && (
              <span className="line-through mr-1 text-red-500">
                ₹{Math.round(item.menuPrice)}
              </span>
            )}
            ₹{item.finalPrice}
          </span>
        </div>
      </div>
    
      {/* Footer Buttons */}
      <div className="w-full flex justify-between items-center px-2 py-1">
        <button
          className={`text-orange-500 hover:underline ${
            item.availability === "Available" ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          onClick={() => item.availability === "Available" && handleShow(item)}
          disabled={item.availability !== "Available"}
        >
          Read More
        </button>
        <div className="relative">
        <span>
            {!isAdded ? (
              <i
                className="bi bi-plus-circle-fill text-orange-500 text-xl cursor-pointer"
                onClick={handleAddToCart}
              ></i>
            ) : (
              <div className="flex items-center space-x-1">
                {quantity > 0 && (
                  <>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDecreaseQuantity}
                    >
                      -
                    </Button>
                    <span className="text-sm">{quantity}</span>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={handleIncreaseQuantity}
                    >
                      +
                    </Button>
                  </>
                )}
                {quantity === 0 && (
                  <i
                    className="bi bi-plus-circle-fill text-orange-400 text-xl cursor-pointer"
                    onClick={handleAddToCart}
                  ></i>
                )}
              </div>
            )}
          </span>
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

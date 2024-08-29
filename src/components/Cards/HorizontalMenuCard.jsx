import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import MenuModal from "../MenuModal";
import { colors } from "theme/theme";

const HorizontalMenuCard = ({
  item,
  handleImageLoad,
  addToCart,
  onAddQuantity,
  onRemoveQuantity,
}) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  const handleClose = () => setShow(false);

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

  const truncatedContent =
    item.menuName.length > 12
      ? item.menuName.slice(0, 12) + "..."
      : item.menuName;

  return (
    <div className="flex bg-white rounded-lg shadow-sm overflow-hidden m-1 cursor-pointer max-w-xs relative">
      <div className="flex-shrink-0 w-24 h-24 overflow-hidden">
        <img
          src={item.imageUrl || "/dish.png"}
          alt={item.menuName}
          onLoad={handleImageLoad}
          className="w-full h-full object-cover rounded-l-lg"
        />
        {/* Discount Badge */}
        {item.discount > 0 && (
          <span className="absolute bottom-0 left-0 w-24 bg-orange-500 text-white text-xs font-bold py-1 px-2 transform origin-bottom">
            {item.discount}% OFF
          </span>
        )}
        {/* Orange Strip */}
        {item.mainCategory && (
          <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold py-1 px-2 transform origin-bottom">
            {item.mainCategory}
          </div>
        )}
      </div>
      <div className="flex-1 p-2 flex flex-col justify-between relative">
        <div>
          <div className="d-flex justify-between">
            <h4 className="text-lg font-semibold truncate">
              {truncatedContent}
            </h4>
            {/* Menu Category */}
            <span className="absolute top-0 right-0 bg-white text-gray-700 text-xs font-bold py-1 px-2 rounded-bl-lg">
              {item.menuCategory === "Veg" ? (
                <img
                  src="/veglogo.jpeg"
                  alt={item.menuCategory}
                  width={"18px"}
                  height={"18px"}
                />
              ) : item.menuCategory === "Non Veg" ? (
                <img
                  src="/nonVeglogo.png"
                  alt={item.menuCategory}
                  width={"18px"}
                  height={"18px"}
                />
              ) : (
                ""
              )}
            </span>
          </div>
          <div className="flex text-gray-600 mt-1 text-xs">
            <i className="bi bi-stopwatch-fill mr-1 text-orange-500"></i>
            <span>{item.menuCookingTime} min</span>
            <span className="mx-1">|</span>
            <i className="bi bi-currency-rupee ml-1 mr-1 text-orange-500"></i>
            <span>
              {item.discount && (
                <span className="line-through mr-1 text-red-500">
                  {Math.round(item.menuPrice)}
                </span>
              )}
              {item.finalPrice}
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span
            className="text-red-500 underline cursor-pointer text-xs"
            onClick={() => handleShow(item)}
          >
            Read More
          </span>
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
                    <i
                      class="bi bi-dash-circle"
                      className="bi bi-dash-circle text-orange-500 text-xl cursor-pointer"
                      onClick={handleDecreaseQuantity}
                    ></i>
                    <span className="text-sm">{quantity}</span>
                    <i
                      className="bi bi-plus-circle-fill text-orange-500 text-xl cursor-pointer"
                      onClick={handleIncreaseQuantity}
                    ></i>
                  </>
                )}
                {quantity === 0 && (
                  <i
                    className="bi bi-plus-circle-fill text-orange-500 text-xl cursor-pointer"
                    onClick={handleAddToCart}
                  ></i>
                )}
              </div>
            )}
          </span>
        </div>
      </div>

      <MenuModal
        show={show}
        handleClose={handleClose}
        modalData={modalData}
        addToCart={addToCart}
      />
    </div>
  );
};

export default HorizontalMenuCard;

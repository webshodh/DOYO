import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { colors } from "../../theme/theme";
import MenuModal from "../MenuModal";

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
    item.menuName.length > 25
      ? item.menuName.slice(0, 25) + "..."
      : item.menuName;

  return (
    <div className="flex bg-white rounded-lg shadow-lg overflow-hidden m-2 cursor-pointer">
      <div className="flex-shrink-0 w-32 h-40 overflow-hidden">
        <img
          src={item.imageUrl || "/dish.png"}
          alt={item.menuName}
          onLoad={handleImageLoad}
          className="w-full h-full object-cover rounded-l-lg"
        />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold truncate">{truncatedContent}</h3>
          <div className="flex text-gray-600 mt-1 text-sm">
            <i className="bi bi-stopwatch-fill mr-2 text-orange-500"></i>
            <span>{item.menuCookingTime} min</span>
            <span className="mx-2">|</span>
            <i className="bi bi-currency-rupee ml-1 mr-2 text-orange-500"></i>
            <span>{item.menuPrice}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span
            className="text-red-500 underline cursor-pointer"
            onClick={() => handleShow(item)}
          >
            Read More
          </span>
          <span>
            {!isAdded ? (
              <i
                className="bi bi-plus-circle-fill text-orange-500 text-3xl cursor-pointer"
                onClick={handleAddToCart}
              ></i>
            ) : (
              <div className="flex items-center">
                {quantity > 0 && (
                  <>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDecreaseQuantity}
                    >
                      -
                    </Button>
                    <span className="mx-2">{quantity}</span>
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
                    className="bi bi-plus-circle-fill text-orange-500 text-3xl cursor-pointer"
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

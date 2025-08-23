import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuModal from "../MenuModal";

const HorizontalMenuCard = ({
  item,
  handleImageLoad,
  
}) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);
  

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  const handleClose = () => setShow(false);

 

  const truncatedContent =
    item.menuName.length > 16
      ? item.menuName.slice(0, 16) + "..."
      : item.menuName;

  return (
    <div className="flex bg-white rounded-lg shadow-sm overflow-hidden m-1 cursor-pointer max-w-xs relative">
      <div className="flex-shrink-0 w-24  overflow-hidden">
        <img
          src={item.imageUrl || "/dish.png"}
          alt={item.menuName}
          onLoad={handleImageLoad}
          className="w-full h-full object-cover rounded-l-lg"
          style={{ height: "110px" }}
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
            <span className="text-lg  truncate">{truncatedContent}</span>
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
            {/* <i className="bi bi-stopwatch-fill mr-1 text-orange-500"></i>
            <span>{item.menuCookingTime} min</span>
            <span className="mx-1">|</span> */}
            <i className="bi bi-currency-rupee ml-1 mr-1 text-orange-500 pt-2"></i>
            <span>
              {item.discount && item.discount > 0 && (
                <span className="line-through mr-1 text-orange-500">
                  {Math.round(item.menuPrice)}
                </span>
              )}
              <b>
                <span className="text-black text-lg text-orange-500">
                  {item.finalPrice}
                </span>
              </b>
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
          
        </div>
      </div>

      <MenuModal
        show={show}
        handleClose={handleClose}
        modalData={modalData}
        
      />
    </div>
  );
};

export default HorizontalMenuCard;

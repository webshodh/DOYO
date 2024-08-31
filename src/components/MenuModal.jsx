import React from "react";
import { Modal, Button } from "react-bootstrap";
import styled from "styled-components";

const AddToCartButton = styled(Button)`
  background-color: #28a745;
  border: none;

  &:hover {
    background-color: #218838;
  }
`;

const MenuModal = ({ show, handleClose, modalData, addToCart }) => {
  if (!modalData) return null;

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{modalData.menuName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img
          src={modalData.imageUrl}
          style={{ width: "100%", height: "250px", objectFit: "contain" }}
          alt={modalData.menuName}
        />
        <b>Cooking Time: </b>
        {modalData.menuCookingTime} min
        <br />
        <b>Price: </b>
        <span>
              {modalData.discount && (
                <span className="line-through mr-1 text-red-500">
                  {Math.round(modalData.menuPrice)}₹
                </span>
              )}
              {modalData.finalPrice}
            </span> ₹
        <br />
        <b>Description: </b>
        {modalData.menuContent ? modalData.menuContent : modalData.menuName}
      </Modal.Body>
      <Modal.Footer>
        {/* <AddToCartButton
          onClick={() => {
            addToCart(modalData.uuid);
            handleClose();
          }}
        >
          Add to Cart
        </AddToCartButton> */}
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  
  );
};

export default MenuModal;

import React, { useState } from "react";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { colors } from "../../theme/theme";

// Styled Components
const CardWrapper = styled.div`
  display: flex;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  margin: 10px;
  cursor: pointer; // Added cursor pointer
`;

const ImageSection = styled.div`
  flex: 0 0 120px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 120px;
  height: 125px;
  border-radius: 10px 0 0 10px;
`;

const TextSection = styled.div`
  flex: 1;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 300px;
`;

const InfoText = styled.div`
  margin: 5px 10px 5px 0;
  word-wrap: break-word;
`;

const QuantitySection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

const HorizontalMenuCard = ({
  item,
  handleImageLoad,
  addToCart,
  onAddQuantity,
  onRemoveQuantity,
}) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isAdded, setIsAdded] = useState(false); // State to track if item is added
  const [quantity, setQuantity] = useState(0); // Local state for quantity

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
    setIsAdded(true); // Mark the item as added
    setQuantity(1)
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
    onAddQuantity(item.uuid); // Call the parent function to update the quantity
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 0));
    onRemoveQuantity(item.uuid); // Call the parent function to update the quantity
  };

  // Truncate menuContent if it's longer than 25 characters
  const truncatedContent =
    item.menuName.length > 25
      ? item.menuName.slice(0, 25) + "..."
      : item.menuName;

  return (
    <CardWrapper onClick={() => handleShow(item)}>
      <ImageSection>
        <Image
          src={item.imageUrl || "/dish.png"}
          alt={item.menuName}
          onLoad={handleImageLoad}
        />
      </ImageSection>
      <TextSection>
        <InfoText>{truncatedContent}</InfoText>
        <div className="d-flex">
          <InfoText>
            <i
              className="bi bi-stopwatch-fill"
              style={{ color: `${colors.Orange}`, fontSize: "18px" }}
            ></i>
            {item.menuCookingTime} min
          </InfoText>
          <InfoText>
            <i
              className="bi bi-currency-rupee"
              style={{ color: `${colors.Orange}`, fontSize: "18px" }}
            ></i>
            {item.menuPrice}
          </InfoText>
        </div>
        <div className="d-flex justify-content-between">
          <InfoText
            style={{
              color: "red",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => handleShow(item)}
          >
            Read More
          </InfoText>
          <span onClick={(e) => e.stopPropagation()}>
            {!isAdded && quantity === 0 ? (
              <i
                className="bi bi-plus-circle-fill"
                style={{ color: `${colors.Orange}`, fontSize: "30px" }}
                onClick={handleAddToCart}
              ></i>
            ) : (
              <QuantitySection>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDecreaseQuantity}
                >
                  -
                </Button>

                <span style={{ margin: "0 10px" }}>{quantity}</span>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={handleIncreaseQuantity}
                >
                  +
                </Button>
              </QuantitySection>
            )}
          </span>
        </div>
      </TextSection>

      {/* Modal Data */}
      {modalData && (
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
            {modalData.menuPrice} ₹
            <br />
            <b>Description: </b>
            {modalData.menuContent ? modalData.menuContent : modalData.menuName}
            <b>Nutritional Info: </b>
            {modalData.nutritionalInfo}

          </Modal.Body>
          <Modal.Footer>
            <Button
              style={{
                background: `${colors.Orange}`,
                border: `1px solid ${colors.Orange}`,
              }}
              onClick={handleClose}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </CardWrapper>
  );
};

export default HorizontalMenuCard;

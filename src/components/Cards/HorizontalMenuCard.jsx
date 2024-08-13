import React, { useState } from "react";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

// Styled Components
const CardWrapper = styled.div`
  display: flex;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Prevent overflow of content */
  position: relative;
  margin: 10px;
`;

const ImageSection = styled.div`
  flex: 0 0150px; /* Fixed width for the image section */
  overflow: hidden;
`;

const Image = styled.img`
  width: 150px;
  height: 120px;
  border-radius: 10px 0 0 10px; /* Rounded corners for the image */
`;

const TextSection = styled.div`
  flex: 1;
  padding: 5px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 300px; /* Control the max width to allow text wrapping */
`;

const InfoText = styled.div`
  margin: 5px 10px 5px 0px;
  word-wrap: break-word; /* Allow text to wrap */
`;

const ButtonSection = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 10px; /* Fixed position from the right */
  top: 15px; /* Fixed position from the top */
`;

const AddToCart = styled(Button)`
  background: red;
  color: white;
  border-radius: 5px;
  margin-top: 10px;
`;

const HorizontalMenuCard = ({ item, handleImageLoad, addToCart }) => {
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleShow = (item) => {
    setModalData(item);
    setShow(true);
  };

  // Truncate menuContent if it's longer than 25 characters
  const truncatedContent =
    item.menuContent.length > 15
      ? item.menuContent.slice(0, 15) + "..."
      : item.menuContent;

  const handleClose = () => setShow(false);

  return (
    <CardWrapper onClick={() => handleShow(item)}>
      <ImageSection>
        <Image
          src={item.imageUrl}
          alt={item.menuName}
          onLoad={handleImageLoad}
        />
      </ImageSection>
      <TextSection>
        <InfoText>{item.menuName}</InfoText>
        <div className="d-flex">
          <InfoText>
            <img
              src="/time.png"
              alt="Cooking Time"
              width="18"
              height="18"
              style={{ marginRight: "5px", marginBottom: "2px" }}
            />
            {item.menuCookingTime} min
          </InfoText>
          <InfoText>
            <img
              src="/rupee.png"
              alt="Menu Price"
              width="18"
              height="18"
              style={{ marginRight: "5px", marginBottom: "5px" }}
            />
            {item.menuPrice}
          </InfoText>
        </div>
        {/* <InfoText>{truncatedContent}</InfoText> */}
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
          <span onClick={() => addToCart(item.uuid)}>
            <i
              className="bi bi-cart-plus-fill"
              style={{ color: "red", fontSize: "24px" }}
            ></i>
          </span>
        </div>
      </TextSection>
      <ButtonSection></ButtonSection>

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
              alt={modalData.alt}
            />
            <b>Cooking Time: </b>
            {modalData.menuCookingTime} min
            <br />
            <b>Price: </b>
            {modalData.menuPrice} ₹
            <br />
            <b>Description: </b>
            {modalData.menuContent ? modalData.menuContent : modalData.menuName}
          </Modal.Body>
          <Modal.Footer>
            <AddToCart
              onClick={() => {
                addToCart(modalData.uuid);
                handleClose();
              }}
            >
              Add to Cart
            </AddToCart>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </CardWrapper>
  );
};

export default HorizontalMenuCard;

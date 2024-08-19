import React, { useState } from "react";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { colors } from "../../theme/theme";
import MenuModal from "../MenuModal";

const CardWrapper = styled.div`
  display: flex;
  padding: 0 !important;
  border-radius: 16px !important;
  width: 10rem !important;
  margin: 25px 5px 0px 5px !important;
  height: auto;
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
  opacity: ${({ availability }) => (availability === "Available" ? 1 : 0.4)};

  &:hover {
    transform: scale(1.05);
  }
`;

const Spinner = styled.div`
  position: absolute;
  top: 20%;
  left: 40%;
`;

const CardImage = styled.img`
  border-radius: 16px 16px 0 0 !important;
  width: 100%;
  height: 150px !important;
  object-fit: cover;
`;

const CardBody = styled.div`
  text-align: left;
`;

const CardTitle = styled.h5`
  font-size: 14px;
`;

const CardText = styled.div`
  display: flex;
  font-size: 12px;
  margin-right: 10px;
`;

const TimeImg = styled.img`
  width: 18px !important;
  height: 18px !important;
  margin: -1px 2px 0 0;
`;

const MoneyImg = styled.img`
  width: 18px !important;
  height: 18px !important;
  margin: 0 2px 0 10px;
`;

const Logo = styled.img`
  position: absolute;
  top: 10%;
  left: 90%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
`;

const CardFooter = styled.div`
  display: block;
  text-align: center;
  cursor: ${({ availability }) =>
    availability === "Available" ? "pointer" : "not-allowed"};
`;

const ReadMore = styled(CardFooter)`
  color: ${colors.Orange};
`;

const AddToCart = styled(CardFooter)`
  background: ${(props) => `${colors.Orange}`};
  color: white;
  border-radius: 5px;
  cursor: pointer;
  padding: 7px;
`;

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
    setShow(false)
    console.log('handleCloseMenu', show)
  };

  return (
    <>
      <div className="column flex-container">
        <CardWrapper className="card" availability={item.availability}>
          {item.availability !== "Available" && (
            <span className="text-overlay">{item.availability}</span>
          )}
          {!item.imageUrl && (
            <Spinner className="spinner-border text-danger" role="status" />
          )}
          <CardImage
            src={item.imageUrl}
            alt={item.menuName}
            onLoad={handleImageLoad}
          />
          <CardBody className="card-body">
            <CardTitle className="card-title">{item.menuName}</CardTitle>
            <div className="container">
              {item.menuCategory === "Veg" ||
              item.menuCategory === "Dosas & Uttapam" ? (
                <Logo className="logo" src={Veg} alt="Veg" />
              ) : item.menuCategory === "Nonveg" ? (
                <Logo className="logo" src={Nonveg} alt="Nonveg" />
              ) : null}
            </div>
            <CardText className="card-text">
              <TimeImg src="/time.png" alt="Cooking Time" />
              {item.menuCookingTime} min
              <br />
              <MoneyImg src="/rupee.png" alt="Menu Price" />
              {item.menuPrice}
            </CardText>
          </CardBody>
          <ReadMore
            className="card-footer read-more"
            availability={item.availability}
            onClick={() =>
              item.availability === "Available" && handleShow(item)
            }
          >
            Read More
          </ReadMore>
          <AddToCart
            className="card-footer add-to-cart"
            onClick={() => addToCart(item.uuid)}
          >
            Add to Cart
          </AddToCart>
        </CardWrapper>
      </div>

      {/* Modal Data */}
      <MenuModal
        show={show}
        handleClose={handleClose}
        modalData={modalData}
        addToCart={addToCart}
      />
      {/* {modalData && (
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
          </Modal.Body>
          <Modal.Footer>
            <AddToCart
              className="card-footer add-to-cart"
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
      )} */}
    </>
  );
};

export default MenuCard;

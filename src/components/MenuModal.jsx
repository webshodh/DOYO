import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const MenuModal = ({ show, handleClose, modeldata }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{modeldata.menuName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img
          src={modeldata.imageUrl}
          style={{ width: '100%', height: '250px', objectFit: 'contain' }}
          alt={modeldata.alt}
        />
        <b>Cooking Time: </b>
        {modeldata.menuCookingTime} min
        <br />
        <b>Price: </b>
        {modeldata.menuPrice} ₹
        <br />
        <b>Description: </b>
        {modeldata.menuContent ? modeldata.menuContent : modeldata.menuName}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MenuModal;

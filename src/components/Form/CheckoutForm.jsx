
// CheckoutForm.js
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

function CheckoutForm({ cartItems, onCheckout }) {
  const [name, setName] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const handleCheckout = () => {
    if (name && tableNo) {
      onCheckout({ name, tableNo, cartItems, mobileNo });
    } else {
      // Handle validation or display an error message
      alert("Please fill in the name and table number.");
    }
  };

  return (
    <Form>
      <Form.Group className="mb-3" controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formMobileNo">
        <Form.Label>Mobile Number</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Mobile number"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formTableNo">
        <Form.Label>Table Number</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter table number"
          value={tableNo}
          onChange={(e) => setTableNo(e.target.value)}
        />
      </Form.Group>

      <Button variant="success" onClick={handleCheckout} style={{width:'100%'}}>
        Place Order
      </Button>
    </Form>
  );
}

export default CheckoutForm;
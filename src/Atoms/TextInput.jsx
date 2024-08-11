import React from 'react';
import { Form } from 'react-bootstrap';

function TextInput({ id, value, onChange, placeholder }) {
  return (
    <Form.Group controlId={id}>
      <Form.Control
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </Form.Group>
  );
}

export default TextInput;

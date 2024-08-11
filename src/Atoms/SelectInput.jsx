import React from 'react';
import { Form } from 'react-bootstrap';

function SelectInput({ id, value, onChange, options, placeholder }) {
  return (
    <Form.Group controlId={id}>
      <Form.Control
        as="select"
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  );
}

export default SelectInput;

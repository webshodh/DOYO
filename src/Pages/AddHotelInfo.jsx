import React from 'react';
import { TextInput } from '../Atoms';
import { Form } from 'react-bootstrap';

const AddHotelInfo = () => {
  return (
    <div className="add-hotel-info">
      <Form>
        <div className="row">
          <div className="col">
            <TextInput
              id="firstName"
              placeholder="First name"
            />
          </div>
          <div className="col">
            <TextInput
              id="lastName"
              placeholder="Last name"
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default AddHotelInfo;

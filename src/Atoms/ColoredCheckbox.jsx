import React from "react";
import styled from "styled-components";

// Styled component for the checkbox label
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-right: 15px;

  input[type="checkbox"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid ${(props) => props.color || "#000"};
    background-color: ${(props) => props.color || "#000"};
    cursor: pointer;
    margin-right: 10px;
    position: relative;

    &:checked {
      background-color: ${(props) => props.color || "#000"};
      border-color: ${(props) => props.color || "#000"};

      &::after {
        content: "✓";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
      }
    }
  }
`;

// ColoredCheckbox component
const ColoredCheckbox = ({ label, color }) => {
  return (
    <CheckboxLabel color={color}>
      <input
        type="checkbox"
        // checked={checked}
        // onChange={onChange}
      />
      <div style={{marginBottom:'10px'}}>{label}</div>
      
    </CheckboxLabel>
  );
};

export default ColoredCheckbox;

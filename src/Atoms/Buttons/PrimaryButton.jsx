import React from "react";
import styled from "styled-components";

const Button = styled.button`
  background-color: white;
  color: #0000; 
  border-radius: 50px; 
  padding: 12px 24px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); 
  border: 2px solid #007bff; 
  font-size: 1.25rem; 
  cursor: pointer;
  transition: all 0.3s ease; 

  &:hover {
    background-color: #f8f9fa; 
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15); 
  }

  &:focus {
    outline: none;
  }
`;

const PrimaryButton = ({ text, onClick }) => {
  return <Button onClick={onClick}>{text}</Button>;
};

export default PrimaryButton;

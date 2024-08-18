import React from "react";
import { colors } from "../theme/theme";
import styled from "styled-components";
const PrimaryButton = ({ btnText, onClick}) => {
  const Button = styled.button`
    padding: 5px 10px;
    border-radius: 20px;
    margin-right: 10px;
    border: 1px solid  ${props => ( `${colors.Orange}`)}; ;
    color: ${props => ( `${colors.Orange}`)}; 
    background: ${props => ( `${colors.White}`)}; 
    cursor: pointer;

    &:hover,
    &:active {
      background-color: ${props => ( `${colors.Orange}`)}; 
      color: ${props => ( `${colors.White}`)}; 
    }
  `;
  return (
    <>
      <Button onClick={onClick}>{btnText}</Button>
    </>
  );
};

export default PrimaryButton;

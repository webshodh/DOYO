import React from "react";
import styled from "styled-components";

const StyledCardTitle = styled.h3`
  color: black;
`;

const CardTitle = ({ title }) => {
  return <StyledCardTitle>{title}</StyledCardTitle>;
};

export default CardTitle;

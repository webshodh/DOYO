import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Styled components
const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr;
  gap: 5px;
`;

const StyledButton = styled.button`
  &.btn-warning {
    background-color: #ffc107;
    border: none;
    color: white;
  }

  &.btn-secondary {
    background-color: #6c757d;
    border: none;
    color: white;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: white;
`;

const NavButtons = () => {
  return (
    <CardContainer>
      <StyledButton type="button" className="btn btn-warning">
        <StyledLink to="/addHotel">Add Hotel</StyledLink>
      </StyledButton>
      <StyledButton type="button" className="btn btn-secondary">
        <StyledLink to="/viewHotel">View Hotel</StyledLink>
      </StyledButton>

      {/* <StyledButton type="button" className="btn btn-warning">
        <StyledLink to="/">Home</StyledLink>
      </StyledButton> */}
    </CardContainer>
  );
};

export default NavButtons;

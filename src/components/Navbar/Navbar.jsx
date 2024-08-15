import React from "react";
import styled from "styled-components";
import { colors } from "../../theme/theme";
// Styled components
const NavbarContainer = styled.div`
  background: #FE724C;
  color: white;
  padding: 10px 10px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  margin: 0;
`;

const Navbar = ({ title }) => {
  return (
    <NavbarContainer>
      <Title>{title}</Title>
    </NavbarContainer>
  );
};

export default Navbar;

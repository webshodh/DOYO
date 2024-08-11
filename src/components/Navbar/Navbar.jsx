import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Styled components
const NavbarContainer = styled.div`
  background: #dc3545;
  color: white;
  padding: 10px 10px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  margin: 0;
`;

const UserIcon = styled.img`
  width: 25px;
  height: 25px;
  margin-top: 5px;
`;

const Navbar = ({ title }) => {
  return (
    <NavbarContainer>
      <Title>{title}</Title>
      <Link to="/dashboard">
        <UserIcon src="user.png" alt="User Icon" />
      </Link>
    </NavbarContainer>
  );
};

export default Navbar;

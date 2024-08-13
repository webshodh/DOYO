import React from "react";
import styled from "styled-components";
import Nav from "./Navbar/Nav";
import { colors } from "../theme/theme";
import { useHotelContext } from "../Context/HotelContext";
// Styled components
const StyledHeader = styled.header`
  transition: all 0.5s;
  z-index: 997;
  height: 60px;
  box-shadow: 0px 2px 20px rgba(1, 41, 112, 0.1);
  background-color: ${colors.White};
  padding-left: 20px;
`;

const Logo = styled.div`
  line-height: 1;

  @media (min-width: 1200px) {
    width: 280px;
  }

  img {
    max-height: 26px;
    margin-right: 6px;
  }

  span {
    font-size: 26px;
    font-weight: 700;
    color: #012970;
    font-family: "Nunito", sans-serif;
  }
`;

const Header = () => {
  const handleToggleSideBar = () => {
    document.body.classList.toggle("toggle-sidebar");
  };
  const { hotelName } = useHotelContext();
  return (
    <StyledHeader className="fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <Logo>
          <span>{hotelName} Dashboard</span>
        </Logo>
        <i
          className="bi bi-list toggle-sidebar-btn"
          onClick={handleToggleSideBar}
        ></i>
      </div>
      <Nav />
    </StyledHeader>
  );
};

export default Header;

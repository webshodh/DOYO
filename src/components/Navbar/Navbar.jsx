import React, { useState } from "react";
import styled from "styled-components";
import { FaBars } from "react-icons/fa"; // Import the hamburger icon
import { colors } from "../../theme/theme";
import { Link } from "react-router-dom";

// Styled components
const NavbarContainer = styled.div`
  background: ${colors.Orange}; /* Use a color from your theme */
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  position: relative; /* Ensure the sidebar can be positioned absolutely */
`;

const Title = styled.h3`
  margin: 0;
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 250px;
  background: ${colors.White};
  color: ${colors.Black};
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
  transform: ${({ isOpen }) =>
    isOpen ? "translateX(0)" : "translateX(-100%)"};
  transition: transform 0.3s ease;
  padding: 20px;
  z-index: 1000;
`;

const SidebarCloseButton = styled.div`
  cursor: pointer;
  font-size: 24px;
  color: ${colors.Black};
  margin-bottom: 20px;
`;

const Navbar = ({ title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const hotelName = "Atithi";
  return (
    <>
      <NavbarContainer>
        <FaBars
          onClick={toggleSidebar}
          style={{ cursor: "pointer", fontSize: "24px" }}
        />
        <Title>{title}</Title>
      </NavbarContainer>

      <Sidebar isOpen={isSidebarOpen}>
        <SidebarCloseButton onClick={toggleSidebar}>×</SidebarCloseButton>

        <ul className="sidebar-nav" id="sidebar-nav" style={{colors:colors.Orange}}>
          <li className="nav-item">
            <Link className="nav-link" to={`/viewMenu/${hotelName}`}>
              <i className="bi bi-house"></i>
              <span>Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/viewMenu/${hotelName}`}>
            <i class="bi bi-cart-check-fill"></i>
              <span>My Cart</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/viewMenu/${hotelName}`}>
            <i class="bi bi-clock-history"></i>
              <span>My Orders</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/viewMenu/${hotelName}`}>
            <i class="bi bi-currency-rupee"></i>
              <span>Tip</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/viewMenu/${hotelName}`}>
              <i className="bi bi-house"></i>
              <span>FeedBack</span>
            </Link>
          </li>
        </ul>

        {/* Add your sidebar content here */}
      </Sidebar>
    </>
  );
};

export default Navbar;

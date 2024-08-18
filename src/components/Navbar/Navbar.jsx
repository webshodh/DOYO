import React, { useState } from "react";
import styled from "styled-components";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { colors } from "../../theme/theme";

// Styled components
const NavbarContainer = styled.div`
  background: ${colors.Orange};
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
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

const ProfileContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${colors.Orange};
  color: ${colors.White};
  margin: 0 auto 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

const ProfileName = styled.h4`
  margin: 5px 0;
`;

const ProfileEmail = styled.p`
  margin: 5px 0;
  color: ${colors.GrayDark};
  font-size: 14px;
`;

const ProfileOrderCount = styled.p`
  margin: 5px 0;
  color: ${colors.GrayDark};
  font-size: 14px;
`;

const UpdateProfileButton = styled.button`
  background: ${colors.Orange};
  color: ${colors.White};
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
`;

const Navbar = ({ title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const hotelName = "Atithi";
  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    totalOrders: 25,
    initial: "J", // This will be used as a placeholder in the profile image
  };

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

        <ProfileContainer>
          <ProfileImage>{userProfile.initial}</ProfileImage>
          <ProfileName>{userProfile.name}</ProfileName>
          <ProfileEmail>{userProfile.email}</ProfileEmail>
          <ProfileOrderCount>Total Orders: {userProfile.totalOrders}</ProfileOrderCount>
          <UpdateProfileButton>Update Profile</UpdateProfileButton>
        </ProfileContainer>

        <ul className="sidebar-nav" id="sidebar-nav" style={{ color: colors.Orange }}>
          <li className="nav-item">
            <Link className="nav-link" to={`/viewMenu/${hotelName}`}>
              <i className="bi bi-house"></i>
              <span>Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/${hotelName}/cart/cart-details`}>
              <i className="bi bi-cart-check-fill"></i>
              <span>My Cart</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/${hotelName}/orders/track-orders`}>
              <i className="bi bi-clock-history"></i>
              <span>My Orders</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/${hotelName}/orders/captain-tip`}>
              <i className="bi bi-currency-rupee"></i>
              <span>Tip</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/${hotelName}/feedback`}>
              <i className="bi bi-house"></i>
              <span>Feedback</span>
            </Link>
          </li>
        </ul>
      </Sidebar>
    </>
  );
};

export default Navbar;

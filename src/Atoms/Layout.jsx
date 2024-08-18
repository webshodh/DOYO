import React from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import { colors } from "../theme/theme";

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${colors.LightBlue};
`;

const LayoutContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`;

const SidebarContainer = styled.div`
  height: 100%;
  background: ${colors.LightGray}; /* Optional: Adds a background color to the sidebar */
  width: 250px; /* Default width for large screens */

  @media (max-width: 991.98px) {
    width: 80px; /* Narrower width for smaller screens */
  }

  @media (max-width: 767.98px) {
    width: 60px; /* Even narrower width for mobile screens */
  }

  @media (max-width: 575.98px) {
    display: none; /* Hide sidebar on very small screens */
  }
`;

const MainContent = styled.div`
  flex: 1; /* Take up the remaining space */
  padding: 20px; /* Add padding for content */
  background: ${colors.White}; /* Optional: Adds a background color to the main content */

  @media (max-width: 575.98px) {
    padding: 10px; /* Adjust padding for smaller screens */
  }
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <LayoutContent>
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>
        <MainContent id="main">{children}</MainContent>
      </LayoutContent>
    </LayoutContainer>
  );
};

export default Layout;

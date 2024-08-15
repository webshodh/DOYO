import React from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import { colors } from "../theme/theme";
// Styled components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${colors.LightBlue};
`;

const LayoutContent = styled.div`
  display: flex;
  flex: 1;
`;

const SidebarContainer = styled.div`
  height: 100vh;
  @media (min-width: 992px) {
    /* Large screens (≥992px) */
    width: 250px; /* Adjust based on sidebar width */
  }

  @media (max-width: 991.98px) {
    /* Tablets and below (<992px) */
    margin-left: 0px; /* Remove margin for smaller screens */
  }
`;

const MainContent = styled.div`
  @media (min-width: 992px) {
    /* Large screens (≥992px) */
    margin-left: 150px; /* Adjust based on sidebar width */
  }

  @media (max-width: 991.98px) {
    /* Tablets and below (<992px) */
    margin-left: 0px; /* Remove margin for smaller screens */
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

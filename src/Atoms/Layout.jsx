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
  width: 250px;
  height: 100vh;
`;

const MainContent = styled.div`
  margin-left: 150px; /* Adjust based on sidebar width */
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <LayoutContent>
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>
        <MainContent id="main">
          {children}
        </MainContent>
      </LayoutContent>
    </LayoutContainer>
  );
};

export default Layout;

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import { colors } from "../theme/theme";
import Footer from "srcV2/components/footer/FooterAuthDefault";
import { useLocation } from "react-router-dom";

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${colors.Grey};
`;

const LayoutContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`;

const SidebarContainer = styled.div`
  height: 100%;
  background: ${colors.Grey}; /* Optional: Adds a background color to the sidebar */
  width: 300px; /* Default width for large screens */

  @media (max-width: 1000px) {
    width: 0px; /* Narrower width for smaller screens */
    display: none; /* Hide sidebar on very small screens */
  }

  @media (max-width: 767.98px) {
    width: 0px; /* Even narrower width for mobile screens */
    display: none; /* Hide sidebar on very small screens */
  }

  @media (max-width: 575.98px) {
    display: none; /* Hide sidebar on very small screens */
  }
`;

const MainContent = styled.div`
  flex: 1; /* Take up the remaining space */
  padding: 20px; /* Add padding for content */
  background: ${colors.Grey}; /* Optional: Adds a background color to the main content */

  @media (max-width: 575.98px) {
    padding: 10px; /* Adjust padding for smaller screens */
  }
`;

const Layout = ({ children }) => {
  const location = useLocation();
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 3];
    setHotelName(hotelNameFromPath);
  }, []);
  const excludeSidebarRoutes = [
    `/viewMenu/${hotelName}/admin/POS`, // Add the route you want to exclude the sidebar for
  ];

  const shouldRenderSidebar = !excludeSidebarRoutes.includes(location.pathname);

  return (
    <LayoutContainer>
      <Header />
      <LayoutContent>
        {/* {shouldRenderSidebar && (
          <SidebarContainer>
            <Sidebar />
          </SidebarContainer>
        )} */}
        <MainContent id="main">
          {children}
          <Footer />
        </MainContent>
      </LayoutContent>
    </LayoutContainer>
  );
};

export default Layout;

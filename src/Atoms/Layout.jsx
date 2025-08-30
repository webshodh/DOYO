import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/SideBarComponent";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import { colors } from "theme/theme";
import NavBarComponent from "../components/NavBarComponent"
const Layout = ({ children }) => {
  const location = useLocation();
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 3];
    setHotelName(hotelNameFromPath);
  }, []);

  // Exclude sidebar for specific routes
  const excludeSidebarRoutes = [
    `/viewMenu/${hotelName}/admin/POS`, // Update this as necessary
  ];

  const shouldRenderSidebar = !excludeSidebarRoutes.includes(location.pathname);

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    document.body.classList.toggle("toggle-sidebar");
  };

  return (
    <div className="flex flex-col " style={{ background: colors.LightGrey }}>
      {/* <Header /> */}
      {/* Sidebar toggle button */}
      <NavBarComponent/>
      <div className="flex flex-1 flex-row h-screen">
        {/* Sidebar: Only render if allowed by route and if screen width is medium or larger */}
        
          <div className="hidden md:block w-64 lg:w-80" style={{ background: colors.LightGrey }}>
            <Sidebar />
          </div>
        
        {/* Main content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8" style={{ background: colors.LightGrey }}>
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;

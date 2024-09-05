import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import Footer from "srcV2/components/footer/FooterAuthDefault";
import { useLocation } from "react-router-dom";
import { colors } from "theme/theme";

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
    <div className="flex flex-col h-screen" style={{background:colors.LightGrey}}>
      <Header />
      <div className="flex flex-1 flex-row">
        {shouldRenderSidebar && (
          <div className="hidden md:block w-64 lg:w-80" style={{background:colors.LightGrey}}>
            <Sidebar />
          </div>
        )}
        <div className="flex-1 p-4 md:p-6 lg:p-8" style={{background:colors.LightGrey}}>
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;

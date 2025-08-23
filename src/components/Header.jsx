import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "./Navbar/Nav";
import { useAuthContext } from "Context/AuthContext";
import useAdminData from "data/useAdminData";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false); // State to control sidebar visibility
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { currentAdminId } = useAuthContext();
  const { data } = useAdminData(`/admins/${currentAdminId}`);
  const adminData = data;
  const { hotelName } = useParams();

  const handleToggleSideBar = () => {
    setShowSidebar(!showSidebar); // Toggle sidebar visibility state
  };

  const handleClick = () => {
    navigate(`/viewMenu/${hotelName}/home`);
    setShow(true);
  };

  const handleBack = () => {
    navigate(`/${hotelName}/admin/admin-dashboard`);
    setShow(false);
  };

  // Inline styles for the sidebar
  const sidebarStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "250px",
    backgroundColor: "#fff",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
    overflowY: "auto",
    transform: showSidebar ? "translateX(0)" : "translateX(-100%)", // Slide in/out
    transition: "transform 0.3s ease",
    zIndex: 1000,
  };

  // Inline styles for the overlay
  const overlayStyles = {
    content: "",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 900,
    transition: "opacity 0.3s ease",
    opacity: showSidebar ? 1 : 0,
    pointerEvents: showSidebar ? "auto" : "none",
  };

  return (
    <>
      {/* Sidebar */}
      <div style={sidebarStyles}>
        {/* Add your sidebar content here */}
        {/* <SideBar /> */}
      </div>

      {/* Overlay */}
      {showSidebar && (
        <div style={overlayStyles} onClick={handleToggleSideBar} />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 shadow-md bg-white flex items-center px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between w-full">
          {/* Left Side: Logo and Toggle Button */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              {/* Sidebar Toggle Button */}
              <button
                className="text-2xl md:hidden"
                onClick={handleToggleSideBar}
                aria-label="Toggle Sidebar"
              >
                <i className="bi bi-list"></i>
              </button>
              {/* Back Button */}
              {show ? (
                <i
                  className="bi bi-arrow-left-square-fill text-orange-500 cursor-pointer"
                  onClick={handleBack}
                ></i>
              ) : null}
              {/* Hotel Name */}
              <span
                className="text-xl font-bold lg:text-2xl text-orange-500 cursor-pointer"
                onClick={handleClick}
              >
                {adminData?.role === "admin" ? `${hotelName}` : ""}
              </span>
            </div>
          </div>
          {/* Right Side: Navigation */}
          <Nav />
        </div>
      </header>
    </>
  );
};

export default Header;

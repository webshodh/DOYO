import React, { useState } from "react";
import { useHotelContext } from "../Context/HotelContext";
import Nav from "./Navbar/Nav";
import { colors } from "theme/theme";
import { useAuthContext } from "Context/AuthContext";
import useAdminData from "data/useAdminData";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [show, setShow] = useState(false);
  const handleToggleSideBar = () => {
    document.body.classList.toggle("toggle-sidebar");
  };
  const navigate = useNavigate();
  const { currentAdminId } = useAuthContext();
  const { data } = useAdminData(`/admins/${currentAdminId}`);
  const adminData = data;
  const { hotelName } = useHotelContext();

  const handleClick = () => {
    navigate(`/viewMenu/${hotelName}/home`);
    setShow(true);
  };

  const handleBack = () => {
    navigate(`/${hotelName}/admin/admin-dashboard`);
    setShow(false);
  };

  return (
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

  );
};

export default Header;

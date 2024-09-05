import React from "react";
import { useHotelContext } from "../Context/HotelContext";
import Nav from "./Navbar/Nav";
import { colors } from "theme/theme";
import { useAuthContext } from "Context/AuthContext";
import useAdminData from "data/useAdminData";

const Header = () => {
  const handleToggleSideBar = () => {
    document.body.classList.toggle("toggle-sidebar");
  };

  const { currentAdminId } = useAuthContext();
  const { data } = useAdminData(`/admins/${currentAdminId}`);
  const adminData = data;
  const { hotelName } = useHotelContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 shadow-md bg-white flex items-center px-4 md:px-8 lg:px-16">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <button
              className="text-2xl md:hidden"
              onClick={handleToggleSideBar}
              aria-label="Toggle Sidebar"
            >
              {/* Ensure you use proper icons (replace 'bi bi-list' with a working icon, e.g., from Font Awesome or similar) */}
              <i className="bi bi-list"></i>
            </button>

            <span
              className="text-xl font-bold lg:text-2xl"
              style={{ color: colors.Orange }}
            >
              {adminData?.role === "admin" ? `${hotelName}` : ""}
            </span>
          </div>
        </div>
        <Nav />
      </div>
    </header>
  );
};

export default Header;

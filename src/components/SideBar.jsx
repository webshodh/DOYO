import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import FreeCard from "../components/Cards/FreeCard";
import useAdminData from "data/useAdminData";
import { useAuthContext } from "Context/AuthContext";
import {sidebarMenus} from "../Constants/SideBarMenu";

function SideBar() {
  const { hotelName } = useParams();
  const { currentAdminId } = useAuthContext();
  const { data } = useAdminData(`/admins/${currentAdminId}`);
  const location = useLocation();

  // Determine which menu to show based on admin role
  const getCurrentMenus = () => {
    return data?.role === "admin"
      ? sidebarMenus.admin
      : sidebarMenus.superAdmin;
  };

  // Check if current path matches menu item
  const isActiveMenuItem = (pathMatch) => {
    return location.pathname.includes(pathMatch);
  };

  // Get link classes for menu item
  const getLinkClasses = (pathMatch) => {
    const baseClasses = "flex items-center p-2 rounded-lg";
    const activeClasses = "bg-orange-500 text-white";
    const inactiveClasses =
      "text-gray-700 hover:bg-orange-500 hover:text-white";

    return `${baseClasses} ${
      isActiveMenuItem(pathMatch) ? activeClasses : inactiveClasses
    }`;
  };

  const currentMenus = getCurrentMenus();

  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-2 space-y-4 lg:w-72"
      style={{ marginTop: "20px" }}
    >
      <ul>
        {currentMenus.map((menuItem, index) => (
          <li
            key={menuItem.id}
            style={index === 0 ? { marginTop: "50px" } : {}}
          >
            <Link
              style={{ textDecoration: "none" }}
              className={getLinkClasses(menuItem.pathMatch)}
              to={menuItem.path(hotelName)}
            >
              <i className={`${menuItem.icon} text-lg mr-2`}></i>
              <span>{menuItem.label}</span>
            </Link>
          </li>
        ))}

        {/* <FreeCard /> */}
      </ul>
    </aside>
  );
}

export default SideBar;

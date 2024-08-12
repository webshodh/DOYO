import React, { useState } from "react";
import "../styles/sideBar.css";
import { Link } from "react-router-dom";
import { useHotelContext } from "../Context/HotelContext";

function SideBar() {
  const { hotelName } = useHotelContext(); // Get hotelName from context
  console.log("hotelNamehotelName", hotelName);
  const [admin, setAdmin] = useState(true);
  const handleClick = () => {
    setAdmin(!admin);
  };
  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        {admin ? (
          <>
            <li className="nav-item">
              <Link className="nav-link" to={`/viewMenu/${hotelName}`}>
                <i className="bi bi-house"></i>
                <span>Home</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/admin/dashboard`}>
                <i className="bi bi-grid"></i>
                <span>Admin Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/admin`}>
                <i class="bi bi-currency-rupee"></i>
                <span>Revenue Managment</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/order-dashboard`}>
                <i class="bi bi-cart-check-fill"></i>
                <span>Orders Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/admin/menu`}>
                <i className="bi bi-speedometer2"></i>
                <span>Menu Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to={`/${hotelName}/admin/staffDashboard`}
              >
                <i class="bi bi-person-fill"></i>
                <span>Staff Management</span>
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/orders`}>
                <i className="bi bi-speedometer2"></i>
                <span>Inventory Management</span>
              </Link>
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/admin/customers`}>
                <i class="bi bi-person-heart"></i>
                <span>Customers Management</span>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link className="nav-link" to={`/super-admin/dashboard`}>
                <i className="bi bi-grid"></i>
                <span>Super Admin Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to={`/${hotelName}/super-admin/revenue`}
              >
                <i className="bi bi-grid"></i>
                <span>Revenue Managment</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/hotels/admin/add-hotel`}>
                <i class="bi bi-building"></i>
                <span>Hotels Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/super-admin/cafes`}>
                <i className="bi bi-speedometer2"></i>
                <span>Restaurant Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/super-admin/cafes`}>
                <i className="bi bi-speedometer2"></i>
                <span>Cafe Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to={`/${hotelName}/super-admin/order-dashboard`}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Bar Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/${hotelName}/super-admin/staff`}>
                <i className="bi bi-speedometer2"></i>
                <span>Staff Management</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to={`/${hotelName}/super-admin/customers`}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Customers Management</span>
              </Link>
            </li>
          </>
        )}
        <button onClick={handleClick}>
          {!admin ? "Admin" : "Super Admin"}
        </button>
        <li>
          <footer className="bottom">
            <div className="copyright">
              &copy; Copyright{" "}
              <strong>
                <span className="company-name">DOYO</span>
              </strong>
              <br />
              All Rights Reserved @2024
            </div>
            <div className="credits">
              Designed by <a href="/home">DOYO</a>
            </div>
          </footer>
        </li>
      </ul>
    </aside>
  );
}

export default SideBar;

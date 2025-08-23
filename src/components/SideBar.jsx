import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import FreeCard from "../components/Cards/FreeCard";
import useAdminData from "data/useAdminData";
import { useAuthContext } from "Context/AuthContext";

function SideBar() {
  const { hotelName } = useParams(); // Get hotelName from context
  const { currentAdminId } = useAuthContext();
  const { data } = useAdminData(`/admins/${currentAdminId}`);
  const adminData = data;

  const location = useLocation();

  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-2 space-y-4 lg:w-72"
      style={{ marginTop: "20px" }}
    >
      <ul>
        {adminData?.role === "admin" ? (
          <>
            <li style={{ marginTop: "50px" }}>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes(`/viewMenu/${hotelName}`)
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/viewMenu/${hotelName}/admin/POS`}
              >
                <i className="bi bi-house text-lg mr-2"></i>
                <span>POS</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/admin/admin-dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/admin/admin-dashboard`}
              >
                <i className="bi bi-grid text-lg mr-2"></i>
                <span>Admin Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes(
                    "/forecasting/forecasting-dashboard"
                  )
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/admin/forecasting/forecasting-dashboard`}
              >
                <i className="bi bi-currency-rupee text-lg mr-2"></i>
                <span>Prediction</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/order/order-dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/admin/order/order-dashboard`}
              >
                <i className="bi bi-cart-check-fill text-lg mr-2"></i>
                <span>Orders Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/menu/menu-dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/admin/menu/menu-dashboard`}
              >
                <i className="bi bi-speedometer2 text-lg mr-2"></i>
                <span>Menu Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/table/table-dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/admin/table/table-dashboard`}
              >
                <i className="bi bi-speedometer2 text-lg mr-2"></i>
                <span>Table Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/staff/staff-dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/admin/staff/staff-dashboard`}
              >
                <i className="bi bi-person-fill text-lg mr-2"></i>
                <span>Staff Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/customers/customer-dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/admin/customers/customer-dashboard`}
              >
                <i className="bi bi-person-heart text-lg mr-2"></i>
                <span>Customers Management</span>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li style={{ marginTop: "50px" }}>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/super-admin/dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/super-admin/dashboard`}
              >
                <i className="bi bi-grid text-lg mr-2"></i>
                <span>Super Admin Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/super-admin/revenue")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/super-admin/revenue`}
              >
                <i className="bi bi-grid text-lg mr-2"></i>
                <span>Revenue Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/hotels/admin/add-hotel")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/hotels/admin/add-hotel`}
              >
                <i className="bi bi-building text-lg mr-2"></i>
                <span>Hotels Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/super-admin/cafes")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/super-admin/cafes`}
              >
                <i className="bi bi-speedometer2 text-lg mr-2"></i>
                <span>Restaurant Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/super-admin/order-dashboard")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/super-admin/order-dashboard`}
              >
                <i className="bi bi-speedometer2 text-lg mr-2"></i>
                <span>Bar Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/super-admin/staff")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/super-admin/staff`}
              >
                <i className="bi bi-speedometer2 text-lg mr-2"></i>
                <span>Staff Management</span>
              </Link>
            </li>

            <li>
              <Link
                style={{ textDecoration: "none" }}
                className={`flex items-center p-2 rounded-lg ${
                  location.pathname.includes("/super-admin/customers")
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-500 hover:text-white"
                }`}
                to={`/${hotelName}/super-admin/customers`}
              >
                <i className="bi bi-speedometer2 text-lg mr-2"></i>
                <span>Customers Management</span>
              </Link>
            </li>
          </>
        )}
        {/* <button
          onClick={handleClick}
          className="w-full py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {!admin ? "Admin" : "Super Admin"}
        </button> */}

        <FreeCard />
      </ul>
    </aside>
  );
}

export default SideBar;

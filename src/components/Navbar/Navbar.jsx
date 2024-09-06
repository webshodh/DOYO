import { UserContext } from "Context/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { colors } from "theme/theme";
// import { UserAuthContext } from "../../Context/UserAuthContext";

const Navbar = ({ title, isBack = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hotelName, setHotelName] = useState("");
  // const { currentUser, loading } = useContext(UserAuthContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 2];
    setHotelName(hotelNameFromPath);
  }, []);

  if (!user) {
    navigate(`/viewMenu/${hotelName}/login/user-login`);
  }
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase(); // Return the first initial if only one name part
    }
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[1].charAt(0).toUpperCase()
    ); // Return initials from first and last name
  };
  const userProfile = {
    name: user.name || "User",
    mobile: user.mobile || "No mobile provided",
    totalOrders: 25,
    initial: getInitials(user.name),
  };

  // if (loading) {
  //   return <div className="text-center">Loading...</div>;
  // }

  if (!user) {
    navigate(`/viewMenu/${hotelName}/login`);
  }

  const handleBack = () => {
    navigate(`/viewMenu/${hotelName}/home`);
  };
  return (
    <>
      <div
        className="text-black p-2 flex justify-between items-center sticky"
        style={{ background: colors.White }}
      >
        {!isBack ? (
          <FaBars onClick={toggleSidebar} className="cursor-pointer text-2xl" />
        ) : (
          <i
            class="bi bi-arrow-left-square-fill"
            onClick={handleBack}
            style={{ color: colors.Orange, fontSize: "30px" }}
          ></i>
        )}
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <div
          className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mb-2"
          style={{ fontSize: "15px", background: colors.Orange }}
        >
          {userProfile.initial}
        </div>
      </div>
      {/* <div>
        Hi, <span className="text-lg font-semibold">{userProfile.name}</span>
        <p>What do you want to eat today?</p>
        </div> */}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out p-4 z-50`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-2xl text-gray-600"
        >
          <FaTimes />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl mb-2">
            {userProfile.initial}
          </div>
          <h4 className="text-lg font-semibold">{userProfile.name}</h4>
          <p className="text-gray-600 text-sm">{userProfile.mobile}</p>
          <p className="text-gray-600 text-sm">
            Total Orders: {userProfile.totalOrders}
          </p>
          <button className="bg-orange-500 text-white px-4 py-2 rounded mt-4">
            Update Profile
          </button>
        </div>

        <ul className="space-y-2">
          <li>
            <Link
              style={{ textDecoration: "none" }}
              className="flex items-center p-2 text-orange-500 hover:text-orange-700"
              to={`/viewMenu/${hotelName}/home`}
            >
              <i className="bi bi-house mr-2"></i>
              <span>Home</span>
            </Link>
          </li>
          {/* <li>
            <Link style={{textDecoration:'none'}} className="flex p-2 items-center text-orange-500 hover:text-orange-700" to={`/${hotelName}/cart/cart-details`}>
              <i className="bi bi-cart-check-fill mr-2"></i>
              <span>My Cart</span>
            </Link>
          </li> */}
          <li>
            <Link
              style={{ textDecoration: "none" }}
              className="flex p-2 items-center text-orange-500 hover:text-orange-700"
              to={`/${hotelName}/track-orders`}
            >
              <i className="bi bi-clock-history mr-2"></i>
              <span>My Orders</span>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              className="flex p-2 items-center text-orange-500 hover:text-orange-700"
              to={`/${hotelName}/captain-tip`}
            >
              <i className="bi bi-currency-rupee mr-2"></i>
              <span>Tip</span>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              className="flex p-2 items-center text-orange-500 hover:text-orange-700"
              to={`/${hotelName}/feedback`}
            >
              <i className="bi bi-house mr-2"></i>
              <span>Feedback</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;

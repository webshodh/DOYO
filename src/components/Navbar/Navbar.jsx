import React, { useContext, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { UserAuthContext } from "../../Context/UserAuthContext";

const Navbar = ({ title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, loading } = useContext(UserAuthContext);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const hotelName = "Atithi";

  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase(); // Return the first initial if only one name part
    }
    return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase(); // Return initials from first and last name
  };
  
  const userProfile = {
    name: currentUser.displayName || 'User',
    email: currentUser.email || 'No email provided',
    totalOrders: 25,
    initial: getInitials(currentUser.displayName) 
  };
  
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="text-center">Please log in</div>;
  }
  
  return (
    <>
      <div className="bg-orange-500 text-white p-2 flex justify-between items-center relative">
        <FaBars
          onClick={toggleSidebar}
          className="cursor-pointer text-2xl"
        />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

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
          <p className="text-gray-600 text-sm">{userProfile.email}</p>
          <p className="text-gray-600 text-sm">Total Orders: {userProfile.totalOrders}</p>
          <button className="bg-orange-500 text-white px-4 py-2 rounded mt-4">Update Profile</button>
        </div>

        <ul className="space-y-2">
          <li>
            <Link style={{textDecoration:'none'}} className="flex items-center p-2 text-orange-500 hover:text-orange-700" to={`/viewMenu/${hotelName}`}>
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
            <Link style={{textDecoration:'none'}} className="flex p-2 items-center text-orange-500 hover:text-orange-700" to={`/${hotelName}/orders/track-orders`}>
              <i className="bi bi-clock-history mr-2"></i>
              <span>My Orders</span>
            </Link>
          </li>
          <li>
            <Link style={{textDecoration:'none'}} className="flex p-2 items-center text-orange-500 hover:text-orange-700" to={`/${hotelName}/orders/captain-tip`}>
              <i className="bi bi-currency-rupee mr-2"></i>
              <span>Tip</span>
            </Link>
          </li>
          <li>
            <Link style={{textDecoration:'none'}} className="flex p-2 items-center text-orange-500 hover:text-orange-700" to={`/${hotelName}/feedback`}>
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

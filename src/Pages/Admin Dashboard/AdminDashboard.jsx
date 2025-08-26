// import React, { useState } from "react";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "../../styles/AdminDashboard.css";
// import { useMenuData, useCategoriesData } from "../../data";

// import { getAuth } from "firebase/auth";
// import { useParams } from "react-router-dom";
// import { IoMdHome } from "react-icons/io";
// import Widget from "../../components/Cards/Widget";
// import { MdBarChart } from "react-icons/md";
// import { MenuDashboard } from "Pages";
// import useMainCategoriesData from "data/useMainCategoriesData";

// function AdminDashboard() {
//   const auth = getAuth();
//   const currentAdminId = auth.currentUser?.uid;

//   const { hotelName } = useParams();

//   const {
//     menuData,
//     totalMenus,
//     loading: menuLoading,
//     error: menuError,
//   } = useMenuData(hotelName);

//   const {
//     categoriesData,
//     totalCategories,
//     loading: categoriesLoading,
//     error: categoriesError,
//   } = useCategoriesData(hotelName);

//   const {
//     mainCategoriesData,
//     totalMainCategories,
//     // loading: categoriesLoading,
//     // error: categoriesError,
//   } = useMainCategoriesData(hotelName);

//   if (menuLoading || categoriesLoading) return <div>Loading...</div>;
//   if (menuError || categoriesError)
//     return <div>Error: {menuError?.message || categoriesError?.message}</div>;

//   return (
//     <div className="container mx-auto px-4" style={{marginTop:'100px'}}>
//       {/* Widgets Section */}
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
//         <Widget
//           icon={<MdBarChart className="h-7 w-7" />}
//           title={"Total Menus"}
//           subtitle={totalMenus}
//         />
//         <Widget
//           icon={<IoMdHome className="h-6 w-6" />}
//           title={"Total Categories"}
//           subtitle={totalCategories}
//         />
//         <Widget
//           icon={<IoMdHome className="h-6 w-6" />}
//           title={"Total Special Categories"}
//           subtitle={totalMainCategories}
//         />
//       </div>
//       {/* <MenuDashboard /> */}

//       <ToastContainer />
//     </div>
//   );
// }

// export default AdminDashboard;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHotelSelection } from "../../Context/HotelSelectionContext";
import Navbar from "../../components/NavBarComponent";
import Sidebar from "../../components/SideBarComponent";

const AdminDashboard = () => {
  const { hotelId } = useParams();
  const { selectedHotel } = useHotelSelection();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    totalBookings: 0,
    revenue: 0,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Mock data - replace with real API calls
  useEffect(() => {
    if (selectedHotel) {
      // Simulate API call based on selected hotel
      const mockStats = {
        totalRooms: Math.floor(Math.random() * 100) + 50,
        occupiedRooms: Math.floor(Math.random() * 60) + 20,
        totalBookings: Math.floor(Math.random() * 200) + 100,
        revenue: Math.floor(Math.random() * 50000) + 25000,
      };
      setStats(mockStats);
    }
  }, [selectedHotel]);

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`text-sm ${
                change.positive ? "text-green-600" : "text-red-600"
              } mt-1`}
            >
              <span
                className={`inline-flex items-center text-xs ${
                  change.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                {change.positive ? "↗" : "↘"} {change.value}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const occupancyRate =
    stats.totalRooms > 0
      ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
      : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Navbar */}
        <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening at{" "}
                {selectedHotel?.name || "your hotel"} today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Rooms"
                value={stats.totalRooms}
                change={{ positive: true, value: 5.2 }}
                color="bg-blue-100"
                icon={
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                }
              />

              <StatCard
                title="Occupancy Rate"
                value={`${occupancyRate}%`}
                change={{ positive: true, value: 12.5 }}
                color="bg-green-100"
                icon={
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
              />

              <StatCard
                title="Total Bookings"
                value={stats.totalBookings}
                change={{ positive: false, value: 3.1 }}
                color="bg-orange-100"
                icon={
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />

              <StatCard
                title="Revenue"
                value={`$${stats.revenue.toLocaleString()}`}
                change={{ positive: true, value: 8.2 }}
                color="bg-purple-100"
                icon={
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                }
              />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-left">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">
                        New Booking
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">
                        Manage Rooms
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-left">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">
                        View Reports
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        action: "New booking received",
                        details: "Room 101 - John Doe",
                        time: "2 minutes ago",
                        type: "booking",
                      },
                      {
                        action: "Room status updated",
                        details: "Room 205 marked as clean",
                        time: "15 minutes ago",
                        type: "room",
                      },
                      {
                        action: "Guest checked out",
                        details: "Room 303 - Jane Smith",
                        time: "1 hour ago",
                        type: "checkout",
                      },
                      {
                        action: "Payment received",
                        details: "Booking #12345 - $299",
                        time: "2 hours ago",
                        type: "payment",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === "booking"
                              ? "bg-orange-100"
                              : activity.type === "room"
                              ? "bg-blue-100"
                              : activity.type === "checkout"
                              ? "bg-green-100"
                              : "bg-purple-100"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              activity.type === "booking"
                                ? "bg-orange-500"
                                : activity.type === "room"
                                ? "bg-blue-500"
                                : activity.type === "checkout"
                                ? "bg-green-500"
                                : "bg-purple-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.details}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

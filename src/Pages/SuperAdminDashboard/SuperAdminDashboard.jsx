import React, { useEffect, useState } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref, remove } from "firebase/database";
import Navbar from "../../components/NavBarComponent";
import Sidebar from "../../components/SideBarComponent";
import useData from "../../data/useData";
import { AdminList } from "Pages";
import AddHotelWithAdmins from "./AddHotel";

const SuperAdminDashboard = () => {
  const [hotelCount, setHotelCount] = useState(0);
  const [hotelCountsByState, setHotelCountsByState] = useState({});
  const [hotelCountsByDistrict, setHotelCountsByDistrict] = useState({});
  const [hotels, setHotels] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data, loading, error } = useData("/");
  console.log("data", data);

  const adminName = "WebShodh";

  useEffect(() => {
    const hotelsRef = ref(db, "/");
    onValue(hotelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setHotelCount(Object.keys(data).length);
        setHotels(Object.values(data));
      }
    });
  }, []);

  useEffect(() => {
    const hotelsRef = ref(db, "/");
    onValue(hotelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const countsByState = {};
        const countsByDistrict = {};

        Object.values(data).forEach((hotel) => {
          const state = hotel.state || "Unknown State";
          const district = hotel.district || "Unknown District";

          countsByState[state] = (countsByState[state] || 0) + 1;
          countsByDistrict[district] = (countsByDistrict[district] || 0) + 1;
        });

        setHotelCountsByState(countsByState);
        setHotelCountsByDistrict(countsByDistrict);
      }
    });
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
          {change && (
            <p
              className={`text-sm ${
                change > 0 ? "text-green-600" : "text-red-600"
              } mt-1`}
            >
              {change > 0 ? "+" : ""}
              {change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const QuickActionCard = ({
    title,
    description,
    buttonText,
    onClick,
    icon,
    color,
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          <button
            onClick={onClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {/* <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} /> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Navbar */}
        {/* <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} /> */}

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {adminName}! Manage all hotels and properties from
                here.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Hotels"
                value={hotelCount}
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
                title="Total Cafes"
                value={hotels.filter((hotel) => hotel.type === "cafe").length}
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
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                }
              />

              <StatCard
                title="Total Bars"
                value={hotels.filter((hotel) => hotel.type === "bar").length}
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
                      d="M7 8h10l4 8H3l4-8z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"
                    />
                  </svg>
                }
              />

              <StatCard
                title="Active States"
                value={Object.keys(hotelCountsByState).length}
                color="bg-indigo-100"
                icon={
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickActionCard
                  title="Add New Hotel"
                  description="Register a new hotel, cafe, or bar with admin accounts"
                  buttonText="Add Hotel"
                  onClick={() => {
                    /* Handle add hotel */
                  }}
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  }
                />

                <QuickActionCard
                  title="Manage Admins"
                  description="View and manage all admin accounts across properties"
                  buttonText="View Admins"
                  onClick={() => {
                    /* Handle view admins */
                  }}
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Add Hotel Component */}
            <div className="mb-8">
              <AddHotelWithAdmins />
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Hotels by State */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hotels by State
                </h3>
                <div className="space-y-3">
                  {Object.entries(hotelCountsByState)
                    .slice(0, 5)
                    .map(([state, count]) => (
                      <div
                        key={state}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">{state}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (count /
                                    Math.max(
                                      ...Object.values(hotelCountsByState)
                                    )) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Hotels by District */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hotels by District
                </h3>
                <div className="space-y-3">
                  {Object.entries(hotelCountsByDistrict)
                    .slice(0, 5)
                    .map(([district, count]) => (
                      <div
                        key={district}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          {district}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (count /
                                    Math.max(
                                      ...Object.values(hotelCountsByDistrict)
                                    )) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Admin List */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Hotel Administrators
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage all admin accounts across your properties
                </p>
              </div>
              <div className="p-6">
                <AdminList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

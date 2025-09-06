import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useHotelSelection } from "../../Context/HotelSelectionContext";
import Navbar from "../../components/NavBarComponent";
import Sidebar from "../../components/SideBarComponent";
import AddMenu from "./AddMenu";
import { useCategoriesData, useMainCategoriesData, useMenuData } from "data";
import StatCard from "Atoms/StatCard";
import useOptionsData from "data/useOptionsData";
import { simplifyOptions } from "utility/ConvertOptions";

const AdminDashboard = () => {
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    menuData,
    totalMenus,
    loading: menuLoading,
    error: menuError,
  } = useMenuData(hotelName);

  const {
    categoriesData,
    totalCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesData(hotelName);

  const { optionsData, totalOptionsCount, categories, optionTypes, error } =
    useOptionsData(hotelName);

  console.log("categories1231", categories);
  const optionsCategoryCount = categories.length

  const {
    mainCategoriesData,
    totalMainCategories,
    // loading: categoriesLoading,
    // error: categoriesError,
  } = useMainCategoriesData(hotelName);
  console.log("mainCategoriesData_____", mainCategoriesData)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} admin={true} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Navbar */}
        <Navbar
          onMenuToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          admin={true}
        />

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
                title="Total Menu"
                value={totalMenus}
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
                title="Total Categories"
                value={totalCategories}
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
                title="Total MainCategories"
                value={totalMainCategories}
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
                title="Total Options Category"
                value={optionsCategoryCount}
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
              
            </div>
            <AddMenu />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

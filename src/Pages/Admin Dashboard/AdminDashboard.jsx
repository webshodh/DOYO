import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHotelSelection } from "../../Context/HotelSelectionContext";
import AdminDashboardLayout from "../AdminDashboardLayout";
import AddMenu from "./AddMenu";
import { useCategoriesData, useMainCategoriesData, useMenuData } from "data";
import StatCard from "Atoms/StatCard";
import useOptionsData from "data/useOptionsData";
import { simplifyOptions } from "utility/ConvertOptions";
import { Spinner } from "Atoms";

const AdminDashboard = () => {
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();

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

  console.log("categories1231", totalOptionsCount);
  const optionsCategoryCount = categories.length;

  const { mainCategoriesData, totalMainCategories } =
    useMainCategoriesData(hotelName);
  console.log("mainCategoriesData_____", mainCategoriesData);

  return (
    <AdminDashboardLayout>
      {/* Dashboard Content - Now properly contained within layout */}
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3">
              Dashboard Overview
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
              Welcome back! Here's what's happening at{" "}
              <span className="font-semibold text-orange-600">
                {selectedHotel?.name || "your hotel"}
              </span>{" "}
              today.
            </p>
          </div>
        </div>

        {/* Stats Grid - Enhanced Responsive Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Menu Items"
              value={totalMenus || 0}
              color="bg-gradient-to-br from-blue-50 to-blue-100"
              icon={
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Categories"
              value={totalCategories || 0}
              color="bg-gradient-to-br from-green-50 to-green-100"
              icon={
                <div className="p-2 bg-green-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Options Categories"
              value={optionsCategoryCount || 0}
              color="bg-gradient-to-br from-purple-50 to-purple-100"
              icon={
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Options for Options Categories"
              value={totalOptionsCount || 0}
              color="bg-gradient-to-br from-orange-50 to-orange-100"
              icon={
                <div className="p-2 bg-orange-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                </div>
              }
            />
          </div>
        </div>

        {/* Loading States */}
        {(menuLoading || categoriesLoading) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <Spinner />
            </div>
          </div>
        )}

        {/* Error States */}
        {(menuError || categoriesError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold mb-1">
                  Error Loading Data
                </h3>
                <p className="text-red-600 text-sm">
                  {menuError ||
                    categoriesError ||
                    error ||
                    "An unexpected error occurred. Please try again."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AddMenu Component - Enhanced Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="p-0">
            <AddMenu onlyView={true} />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;

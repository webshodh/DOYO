import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHotelSelection } from "../../Context/HotelSelectionContext";
import StatCard from "Atoms/StatCard";
import { Spinner } from "Atoms";
import SuperAdminDashboardLayout from "Pages/SuperAdminDashboardLayout";
import useHotelData from "../../data/useHotelData"; // Import the hook
import {
  FaHotel,
  FaCoffee,
  FaWineGlass,
  FaMapMarkerAlt,
  FaChartBar,
  FaAccessibleIcon,
  FaUsers,
  FaCity,
  FaGlobe,
  FaUtensils,
  FaGlassCheers,
  FaBuilding,
} from "react-icons/fa";
import ErrorMessage from "Atoms/ErrorMessage";

const SuperAdminDashboard = () => {
  // Use the custom hook to get hotel data
  const {
    hotelData,
    loading,
    error,
    stats,
    hotelsByType,
    hotelsByState,
    hotelsByDistrict,
    hotelsByCity,
    totalHotels,
  } = useHotelData("/hotels");
  console.log("hotelData+hotelDatahotelData", hotelData);

  // Calculate additional statistics from the data
  const calculateStats = () => {
    if (!hotelData || Object.keys(hotelData).length === 0) {
      return {
        totalHotels: 0,
        totalCafes: 0,
        totalRestaurants: 0,
        totalBars: 0,
        totalDhaba: 0,
        totalStates: 0,
        totalDistricts: 0,
        activeHotels: 0,
        inactiveHotels: 0,
      };
    }

    const hotels = Object.values(hotelData);

    // Count by business type (assuming you have a 'type' or 'category' field)
    const hotelCount = hotels.filter((hotel) =>
      hotel.info.businessType?.toLowerCase().includes("hotel")
    ).length;

    const cafeCount = hotels.filter((hotel) =>
      hotel.info.businessType?.toLowerCase().includes("cafe")
    ).length;

    const restaurantCount = hotels.filter((hotel) =>
      hotel.info.businessType?.toLowerCase().includes("restaurant")
    ).length;

    const barCount = hotels.filter((hotel) =>
      hotel.info.businessType?.toLowerCase().includes("bar")
    ).length;

    const dhabaCount = hotels.filter((hotel) =>
      hotel.info.businessType?.toLowerCase().includes("bar")
    ).length;

    // Count active/inactive
    const activeCount = hotels.filter(
      (hotel) => hotel.isActive !== false
    ).length;
    const inactiveCount = hotels.length - activeCount;

    return {
      totalHotels: hotelCount,
      totalCafes: cafeCount,
      totalRestaurants: restaurantCount,
      totalBars: barCount,
      totalDhaba: dhabaCount,
      totalStates: Object.keys(hotelsByState || {}).length,
      totalDistricts: Object.keys(hotelsByDistrict || {}).length,
      totalCities: Object.keys(hotelsByCity || {}).length,
      activeHotels: activeCount,
      inactiveHotels: inactiveCount,
      totalProperties: hotels.length,
    };
  };

  const calculatedStats = calculateStats();

  // Enhanced Chart Component for Data Visualization
  const ChartCard = ({
    title,
    data,
    color,
    maxValue,
    icon: Icon,
    delay = 0,
  }) => (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 animate-fade-in-up overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
            <Icon className={`text-lg ${color.replace("bg-", "text-")}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(data || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count], index) => (
              <div
                key={name}
                className="group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] group-hover:text-gray-900 transition-colors">
                    {name}
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                    {count}
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`${color} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${(count / Math.max(maxValue, 1)) * 100}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
        {Object.keys(data || {}).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Icon className="mx-auto text-4xl mb-2 opacity-20" />
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );

  // Quick Insights Component
  const QuickInsights = () => {
    const mostPopularState = Object.entries(hotelsByState || {}).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const mostPopularDistrict = Object.entries(hotelsByDistrict || {}).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Business Insights</h3>
          <FaChartBar className="text-2xl opacity-70" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <FaUsers className="mx-auto text-2xl mb-2" />
            <p className="text-2xl font-bold">{calculatedStats.activeHotels}</p>
            <p className="text-sm opacity-80">Active Properties</p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <FaGlobe className="mx-auto text-2xl mb-2" />
            <p className="text-xl font-bold">
              {mostPopularState ? mostPopularState[0] : "N/A"}
            </p>
            <p className="text-sm opacity-80">
              Top State ({mostPopularState ? mostPopularState[1] : 0} hotels)
            </p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <FaCity className="mx-auto text-2xl mb-2" />
            <p className="text-xl font-bold">
              {mostPopularDistrict ? mostPopularDistrict[0] : "N/A"}
            </p>
            <p className="text-sm opacity-80">
              Top District ({mostPopularDistrict ? mostPopularDistrict[1] : 0}{" "}
              hotels)
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Header Section */}
        <div className="animate-fade-in-down">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Super Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl">
              Welcome to your command center. Monitor and manage all properties
              across the platform with real-time insights and analytics.
            </p>
            {!loading && (
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
                <div>Last updated: {new Date().toLocaleTimeString()}</div>
                <div>Total Properties: {calculatedStats.totalProperties}</div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && <Spinner />}

        {/* Error State */}
        {error && <ErrorMessage />}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Enhanced Stats Grid - Business Type */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="Total Hotels"
                  value={calculatedStats.totalHotels}
                  color="bg-gradient-to-br from-blue-50 to-blue-100"
                  icon={
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FaHotel className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="Total Cafes"
                  value={calculatedStats.totalCafes}
                  color="bg-gradient-to-br from-green-50 to-green-100"
                  icon={
                    <div className="p-2 bg-green-500 rounded-lg">
                      <FaCoffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>
              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="Total Dhaba"
                  value={calculatedStats.totalDhaba}
                  color="bg-gradient-to-br from-green-50 to-green-100"
                  icon={
                    <div className="p-2 bg-green-500 rounded-lg">
                      <FaCoffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="Total Restaurants"
                  value={calculatedStats.totalRestaurants}
                  color="bg-gradient-to-br from-orange-50 to-orange-100"
                  icon={
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <FaUtensils className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="Total Bars"
                  value={calculatedStats.totalBars}
                  color="bg-gradient-to-br from-purple-50 to-purple-100"
                  icon={
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <FaGlassCheers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>
            </div>

            {/* Geographic Coverage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="States Covered"
                  value={calculatedStats.totalStates}
                  color="bg-gradient-to-br from-indigo-50 to-indigo-100"
                  icon={
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <FaMapMarkerAlt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="Districts Covered"
                  value={calculatedStats.totalDistricts}
                  color="bg-gradient-to-br from-teal-50 to-teal-100"
                  icon={
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <FaCity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <StatCard
                  title="Cities Covered"
                  value={calculatedStats.totalCities}
                  color="bg-gradient-to-br from-rose-50 to-rose-100"
                  icon={
                    <div className="p-2 bg-rose-500 rounded-lg">
                      <FaBuilding className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  }
                />
              </div>
            </div>

            {/* Quick Insights Card */}
            <QuickInsights />

            {/* Data Visualization Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <ChartCard
                title="Hotels by State"
                data={hotelsByState || {}}
                color="bg-blue-500"
                maxValue={Math.max(...Object.values(hotelsByState || {}), 1)}
                icon={FaMapMarkerAlt}
                delay={0}
              />

              <ChartCard
                title="Hotels by District"
                data={hotelsByDistrict || {}}
                color="bg-green-500"
                maxValue={Math.max(...Object.values(hotelsByDistrict || {}), 1)}
                icon={FaCity}
                delay={200}
              />
            </div>

            {/* Additional Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <ChartCard
                title="Hotels by City"
                data={hotelsByCity || {}}
                color="bg-purple-500"
                maxValue={Math.max(...Object.values(hotelsByCity || {}), 1)}
                icon={FaBuilding}
                delay={400}
              />

              <ChartCard
                title="Hotels by Type"
                data={hotelsByType || {}}
                color="bg-orange-500"
                maxValue={Math.max(...Object.values(hotelsByType || {}), 1)}
                icon={FaHotel}
                delay={600}
              />
            </div>
          </>
        )}

        {/* Footer Info */}
        {!loading && !error && (
          <div className="text-center py-6 animate-fade-in-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-semibold text-green-600">
                  {calculatedStats.activeHotels}
                </span>{" "}
                Active
              </div>
              <div>
                <span className="font-semibold text-red-600">
                  {calculatedStats.inactiveHotels}
                </span>{" "}
                Inactive
              </div>
              <div>
                <span className="font-semibold text-blue-600">
                  {calculatedStats.totalStates}
                </span>{" "}
                States
              </div>
              <div>
                <span className="font-semibold text-purple-600">
                  {calculatedStats.totalDistricts}
                </span>{" "}
                Districts
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Dashboard powered by Real-time Analytics • Data refreshed
              automatically •v Total Properties:{" "}
              <span className="font-semibold">
                {calculatedStats.totalProperties}
              </span>
            </p>
          </div>
        )}
      </div>
    </SuperAdminDashboardLayout>
  );
};

export default SuperAdminDashboard;

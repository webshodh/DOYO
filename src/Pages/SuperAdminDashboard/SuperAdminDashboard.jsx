import React, { useEffect, useState } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import useData from "../../data/useData";
import StatCard from "Atoms/StatCard";


const SuperAdminDashboard = () => {
  const [hotelCount, setHotelCount] = useState(0);
  const [hotelCountsByState, setHotelCountsByState] = useState({});
  const [hotelCountsByDistrict, setHotelCountsByDistrict] = useState({});
  const [hotels, setHotels] = useState([]);

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

  const ChartCard = ({ title, data, color, maxValue }) => (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 truncate max-w-[120px]">
                {name}
              </span>
              <div className="flex-1 mx-3 bg-gray-200 h-2 rounded-full">
                <div
                  className={`${color} h-2 rounded-full`}
                  style={{ width: `${(count / maxValue) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );

  return (
   
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold text-blue-600">{adminName}</span>!
              Manage all hotels and properties from here.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Hotels"
            value={hotelCount}
            color="bg-gradient-to-br from-blue-100 to-blue-200"
          />
          <StatCard
            title="Total Cafes"
            value={hotels.filter((hotel) => hotel.type === "cafe").length}
            color="bg-gradient-to-br from-emerald-100 to-emerald-200"
          />
          <StatCard
            title="Total Bars"
            value={hotels.filter((hotel) => hotel.type === "bar").length}
            color="bg-gradient-to-br from-purple-100 to-purple-200"
          />
          <StatCard
            title="Active States"
            value={Object.keys(hotelCountsByState).length}
            color="bg-gradient-to-br from-indigo-100 to-indigo-200"
          />
        </div>

        {/* Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard
            title="Hotels by State"
            data={hotelCountsByState}
            color="bg-blue-500"
            maxValue={Math.max(...Object.values(hotelCountsByState), 1)}
          />
          <ChartCard
            title="Hotels by District"
            data={hotelCountsByDistrict}
            color="bg-emerald-500"
            maxValue={Math.max(...Object.values(hotelCountsByDistrict), 1)}
          />
        </div>
      </div>
   
  );
};

export default SuperAdminDashboard;

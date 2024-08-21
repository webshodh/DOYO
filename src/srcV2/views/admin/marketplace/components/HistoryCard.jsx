import React, { useState } from "react";
import Card from "../../../../components/card";
import { useOrdersData, useProcessedMenuData } from "data";
import { useHotelContext } from "Context/HotelContext";
import { Tab } from "components";

// Filter functions
const filterDataByDateRange = (data, startDate, endDate) => {
  return data.filter((item) => {
    const itemDate = new Date(item.checkoutData.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

const filterDaily = (data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Set to the next day
  return filterDataByDateRange(data, today, tomorrow);
};

const filterWeekly = (data) => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7); // Set to 7 days before today
  return filterDataByDateRange(data, lastWeek, today);
};

const filterMonthly = (data) => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30); // Set to 30 days before today
  return filterDataByDateRange(data, lastMonth, today);
};

const HistoryCard = () => {
  const [filterType, setFilterType] = useState("Daily");
  const { hotelName } = useHotelContext();
  const { completedOrders } = useOrdersData(hotelName);

  // Apply filter based on selected filter type
  let filteredOrders;
  switch (filterType) {
    case "Daily":
      filteredOrders = filterDaily(completedOrders);
      break;
    case "Weekly":
      filteredOrders = filterWeekly(completedOrders);
      break;
    case "Monthly":
      filteredOrders = filterMonthly(completedOrders);
      break;
    default:
      filteredOrders = completedOrders;
  }

  const menuDataArray = useProcessedMenuData(filteredOrders);

  const sortedMenuDataArray = [...menuDataArray].sort(
    (a, b) => b.menuCount - a.menuCount
  );

  const tabs2 = [
    {
      label: "Top 5",
      content: (
        <div className="row">
          {sortedMenuDataArray
            .slice(0, 5) // Show top 5 items
            .map(({ menuName, menuCount, imageUrl }, index) => (
              <div
                key={index}
                className="flex h-full w-full items-start justify-between bg-white px-3 py-[20px] hover:shadow-2xl dark:!bg-navy-800 dark:shadow-none dark:hover:!bg-navy-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <img
                      className="h-full w-full rounded-xl"
                      src={imageUrl}
                      alt={menuName}
                    />
                  </div>
                  <div className="flex flex-col">
                    <h5 className="text-base font-bold text-navy-700 dark:text-white">
                      {menuName}
                    </h5>
                    <p className="mt-1 text-sm font-normal text-gray-600">
                      {menuCount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ),
    },
    {
      label: "Top 10",
      content: (
        <div className="row">
          {sortedMenuDataArray
            .slice(0, 10) // Show top 10 items
            .map(({ menuName, menuCount, imageUrl }, index) => (
              <div
                key={index}
                className="flex h-full w-full items-start justify-between bg-white px-3 py-[20px] hover:shadow-2xl dark:!bg-navy-800 dark:shadow-none dark:hover:!bg-navy-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center">
                    <img
                      className="h-full w-full rounded-xl"
                      src={imageUrl}
                      alt={menuName}
                    />
                  </div>
                  <div className="flex flex-col">
                    <h5 className="text-base font-bold text-navy-700 dark:text-white">
                      {menuName}
                    </h5>
                    <p className="mt-1 text-sm font-normal text-gray-600">
                      {menuCount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ),
    },
  ];

  return (
    <Card extra={"mt-3 !z-5 overflow-hidden"}>
      {/* Filter Buttons */}
      <div className="flex justify-between p-3">
        <button
          onClick={() => setFilterType("Daily")}
          className={`px-4 py-2 text-lg font-medium transition-colors duration-300 ${filterType === "Daily" ? "text-orange-500 underline" : "text-gray-700 hover:text-orange-500 hover:underline"}`}
        >
          Daily
        </button>
        <button
          onClick={() => setFilterType("Weekly")}
          className={`px-4 py-2 text-lg font-medium transition-colors duration-300 ${filterType === "Weekly" ? "text-orange-500 underline" : "text-gray-700 hover:text-orange-500 hover:underline"}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setFilterType("Monthly")}
          className={`px-4 py-2 text-lg font-medium transition-colors duration-300 ${filterType === "Monthly" ? "text-orange-500 underline" : "text-gray-700 hover:text-orange-500 hover:underline"}`}
        >
          Monthly
        </button>
      </div>

      {/* HistoryCard Header */}
      <div className="flex items-center justify-between rounded-t-3xl p-3">
        <div className="text-lg font-bold text-navy-700 dark:text-white">
          Top Ordered Menu
        </div>
      </div>

      {/* History Card Data */}
      <Tab tabs={tabs2} />
    </Card>
  );
};

export default HistoryCard;

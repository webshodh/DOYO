import React, { useState } from "react";
import Card from "./CommonCard";
import { useOrdersData, useProcessedMenuData } from "data";
import { useParams } from "react-router-dom";
import { Tab } from "components";
import FilterButtons from "Atoms/FilterButtons";

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
  const { hotelName } = useParams();
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
        <div className="d-flex justify-start">
          {sortedMenuDataArray
            .slice(0, 5)
            .map(({ menuName, menuCount, imageUrl }) => (
              <div className="flex justify-center p-4">
                <div className="relative w-24 h-24">
                  <img
                    src={imageUrl || "/dish.png"}
                    alt={menuName}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                  <span className="absolute bottom-0 left-0 w-full bg-orange-500 text-white text-xs font-bold py-1 px-2 text-center rounded-b-lg">
                    {menuName}
                  </span>
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-tr-lg">
                    {menuCount}
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
        <div className="d-flex justify-start">
          {sortedMenuDataArray
            .slice(0, 10) // Show top 10 items
            .map(({ menuName, menuCount, imageUrl }, index) => (
              <div className="flex justify-center p-4">
                <div className="relative w-24 h-24">
                  <img
                    src={imageUrl || "/dish.png"}
                    alt={menuName}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                  <span className="absolute bottom-0 left-0 w-full bg-orange-500 text-white text-xs font-bold py-1 px-2 text-center rounded-b-lg">
                    {menuName}
                  </span>
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold py-1 px-2 rounded-tr-lg">
                    {menuCount}
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
      <div className="d-flex  justify-between p-2">
        {/* HistoryCard Header */}
        <div
          className="text-lg font-bold text-navy-700 dark:text-white p-3"
          style={{ width: "50%" }}
        >
          Top Selling Foods
        </div>
        {/* Filter Buttons */}
        <FilterButtons filterType={filterType} setFilterType={setFilterType} />
      </div>
      {/* History Card Data */}
      <Tab tabs={tabs2} />
    </Card>
  );
};

export default HistoryCard;

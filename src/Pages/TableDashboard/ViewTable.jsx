import React, { useState } from "react";
import { useHotelContext } from "../../Context/HotelContext";
import { useOrdersData } from "../../data";
import styled from "styled-components";
import TableCard from "../../components/Cards/TableCard";
import ColoredCheckbox from "../../Atoms/ColoredCheckbox";

// Background Card
const BackgroundCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

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

function ViewTable() {
  const { hotelName } = useHotelContext();
  const [filterType, setFilterType] = useState("Daily");
  const { pendingOrders, acceptedOrders, completedOrders, cancelledOrders } =
    useOrdersData(hotelName);

  // Filtered data based on selected filterType
  const filteredPendingOrders =
    filterType === "Daily"
      ? filterDaily(pendingOrders)
      : filterType === "Weekly"
      ? filterWeekly(pendingOrders)
      : filterMonthly(pendingOrders);

  const filteredAcceptedOrders =
    filterType === "Daily"
      ? filterDaily(acceptedOrders)
      : filterType === "Weekly"
      ? filterWeekly(acceptedOrders)
      : filterMonthly(acceptedOrders);

  const filteredCompletedOrders =
    filterType === "Daily"
      ? filterDaily(completedOrders)
      : filterType === "Weekly"
      ? filterWeekly(completedOrders)
      : filterMonthly(completedOrders);

  const filteredCancelledOrders =
    filterType === "Daily"
      ? filterDaily(cancelledOrders)
      : filterType === "Weekly"
      ? filterWeekly(cancelledOrders)
      : filterMonthly(cancelledOrders);

  const getOrderCounts = (orders) => {
    return [
      ...orders.reduce((acc, item) => {
        const tableNo = item.checkoutData.tableNo;
        if (acc.has(tableNo)) {
          acc.get(tableNo).count += 1;
        } else {
          acc.set(tableNo, { ...item, count: 1 });
        }
        return acc;
      }, new Map()),
    ].sort((a, b) => a[0] - b[0]); // Sort by table number in ascending order
  };

  const pendingOrderCounts = getOrderCounts(filteredPendingOrders);
  const acceptedOrderCounts = getOrderCounts(filteredAcceptedOrders);

  return (
    <>
      <div className="d-flex justify-between">
        <div
          style={{ display: "flex", alignItems: "center", margin: "1rem 0" }}
        >
          <ColoredCheckbox label="Available" color="white" />
          <ColoredCheckbox label="Order Pending" color="orange" />
          <ColoredCheckbox label="Order Processing" color="green" />
          <ColoredCheckbox label="Payment Pending" color="blue" />
        </div>

        <div className="d-flex"  style={{ marginTop: "-1rem" }}>

          <button
            onClick={() => setFilterType("Daily")}
            className={`px-2 py-2 text-lg font-medium transition-colors duration-300 ${
              filterType === "Daily"
                ? "text-orange-500 underline"
                : "text-gray-700 hover:text-orange-500 hover:underline"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilterType("Weekly")}
            className={`px-2 py-2 text-lg font-medium transition-colors duration-300 ${
              filterType === "Weekly"
                ? "text-orange-500 underline"
                : "text-gray-700 hover:text-orange-500 hover:underline"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilterType("Monthly")}
            className={`px-2 py-2 text-lg font-medium transition-colors duration-300 ${
              filterType === "Monthly"
                ? "text-orange-500 underline"
                : "text-gray-700 hover:text-orange-500 hover:underline"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      <div className="container mt-2">
        <div className="d-flex">
          {pendingOrderCounts.map(([tableNo, item], index) => (
            <TableCard
              bgColor={"orange"}
              key={index}
              count={`${tableNo}`} // Show table number and order count
              order={"Pending Orders"} // Label indicating these are orders
              orderCount={`${item.count}`}
              type="primary"
            />
          ))}
        </div>

        <div className="d-flex mt-3">
          {acceptedOrderCounts.map(([tableNo, item], index) => (
            <TableCard
              bgColor={"green"}
              key={index}
              count={`${tableNo}`} // Show table number and order count
              order={"Processing Orders"} // Label indicating these are orders
              orderCount={`${item.count}`}
              type="primary"
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default ViewTable;

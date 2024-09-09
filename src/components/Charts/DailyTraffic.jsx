import React, { useState } from "react";
import BarChart from "./BarChart";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Card from "../Cards/CommonCard";
import { colors } from "theme/theme";
import { useOrdersData } from "data";
import { useHotelContext } from "Context/HotelContext";
import LineChart from "./LineChart";

const DailyTraffic = () => {
  const { hotelName } = useHotelContext();
  const { completedOrders } = useOrdersData(hotelName);
  const [timePeriod, setTimePeriod] = useState("daily"); // Default to daily

  // Function to filter orders based on the selected time period
  const filterOrdersByTimePeriod = (period) => {
    const now = new Date();
    let filteredOrders = [];

    completedOrders.forEach((order) => {
      const orderDate = new Date(order.checkoutData.date);
      const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      switch (period) {
        case "weekly":
          if (daysDiff < 7) filteredOrders.push(order);
          break;
        case "monthly":
          if (daysDiff < 30) filteredOrders.push(order);
          break;
        case "halfYearly":
          if (daysDiff < 182) filteredOrders.push(order);
          break;
        case "yearly":
          if (daysDiff < 365) filteredOrders.push(order);
          break;
        default:
          filteredOrders.push(order); // daily
          break;
      }
    });

    return filteredOrders;
  };

  // Get filtered orders based on the selected time period
  const filteredOrders = filterOrdersByTimePeriod(timePeriod);

  // Object to store visitor counts by date
  const visitorCountByDate = {};

  // Iterate over the filtered order data to calculate visitor counts per day
  filteredOrders.forEach((order) => {
    const dateObj = new Date(order.checkoutData.date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

    // Increment the visitor count for the corresponding date
    if (visitorCountByDate[formattedDate]) {
      visitorCountByDate[formattedDate]++;
    } else {
      visitorCountByDate[formattedDate] = 1;
    }
  });

  const dates = Object.keys(visitorCountByDate);
  const visitors = Object.values(visitorCountByDate);

  // Calculate the total number of visitors
  const totalVisitors = visitors.reduce((sum, count) => sum + count, 0);

  // Calculate the percentage change from the previous day
  let percentageChange = 0;
  if (visitors.length > 1) {
    const previousDayVisitors = visitors[visitors.length - 2];
    const currentDayVisitors = visitors[visitors.length - 1];
    percentageChange =
      ((currentDayVisitors - previousDayVisitors) / previousDayVisitors) * 100;
  }

  // Determine the color based on the percentage change
  const changeColor = percentageChange >= 0 ? "text-green-500" : "text-red-500";
  const Icon = percentageChange >= 0 ? MdArrowDropUp : MdArrowDropDown;

  const customOptions = {
    xaxis: {
      categories: dates,
    },
    fill: {
      gradient: {
        colorStops: [
          {
            offset: 0,
            color: colors.LightOrange,
            opacity: 1,
          },
          {
            offset: 100,
            color: colors.LightOrange,
            opacity: 0.28,
          },
        ],
      },
    },
  };

  const customData = [
    {
      name: "Visitors",
      data: visitors,
    },
  ];

  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between items-center">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Daily Visitors
          </p>
        </div>
        <div className="mt-2 flex items-start">
          <div className={`flex items-center text-sm ${changeColor}`}>
            <Icon className="h-5 w-5" />
            <p className="font-bold">{percentageChange.toFixed(2)}%</p>
          </div>
        </div>
      </div>
      <div className="d-flex justify-between">
        <div>
          <p className="text-[34px] font-bold text-navy-700 dark:text-white">
            {totalVisitors.toLocaleString()}{" "}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Total Visitors
            </span>
          </p>
        </div>
        <div className="mb-4 mt-2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 bg-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="halfYearly">Half-Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="h-[300px] w-full pt-10 pb-0">
        <LineChart series={customData} options={customOptions} />
      </div>
    </Card>
  );
};

export default DailyTraffic;

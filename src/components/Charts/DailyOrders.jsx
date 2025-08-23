import React, { useState } from "react";
import BarChart from "../Charts/BarChart";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Card from "../Cards/CommonCard";
import { colors } from "theme/theme";
import { useOrdersData } from "data";
import { useParams } from "react-router-dom";
import LineChart from "./LineChart";

const DailyOrders = () => {
  const { hotelName } = useParams();
  const { completedOrders } = useOrdersData(hotelName);
  const [timePeriod, setTimePeriod] = useState("daily"); // default to daily

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

  // Object to store order counts by date
  const orderCountByDate = {};

  // Iterate over the filtered order data
  filteredOrders.forEach((order) => {
    const dateObj = new Date(order.checkoutData.date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

    if (orderCountByDate[formattedDate]) {
      orderCountByDate[formattedDate]++;
    } else {
      orderCountByDate[formattedDate] = 1;
    }
  });

  const dates = Object.keys(orderCountByDate);
  const orders = Object.values(orderCountByDate);

  const totalOrders = orders.reduce((sum, count) => sum + count, 0);

  let percentageChange = 0;
  if (orders.length > 1) {
    const previousDayOrders = orders[orders.length - 2];
    const currentDayOrders = orders[orders.length - 1];
    percentageChange =
      ((currentDayOrders - previousDayOrders) / previousDayOrders) * 100;
  }

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
      name: "Orders",
      data: orders,
    },
  ];

  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Daily Orders
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
            {totalOrders.toLocaleString()}{" "}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Total Orders
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

export default DailyOrders;

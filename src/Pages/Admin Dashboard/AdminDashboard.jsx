import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AdminDashboard.css";
import {
  useMenuData,
  useCategoriesData,
  useProcessedCategoryData,
  useProcessedMenuData,
  useOrdersData,
  useCustomerData,
} from "../../data";
import { PageTitle } from "../../Atoms";
import { Table } from "../../components";
import {
  OrdersAndRevenueByCutomerColumns,
  OrdersAndRevenueByMenuColumns,
  RevenueByCategoryColumns,
} from "../../data/Columns";
import { getAuth } from "firebase/auth";
import { useHotelContext } from "../../Context/HotelContext";
import { IoMdHome } from "react-icons/io";
import Widget from "srcV2/components/widget/Widget";
import { MdBarChart } from "react-icons/md";
import HistoryCard from "srcV2/views/admin/marketplace/components/HistoryCard";
import Banner1 from "srcV2/views/admin/marketplace/components/Banner";
import DailyTraffic from "srcV2/views/admin/default/components/DailyTraffic";
import PieChartCard from "srcV2/views/admin/default/components/PieChartCard";
import TotalSpent from "srcV2/views/admin/default/components/TotalSpent";
import DailyOrders from "srcV2/views/admin/default/components/DailyOrders";

// Filter functions
const filterDataByDateRange = (data, startDate, endDate) => {
  return data.filter((item) => {
    const itemDate = new Date(item.checkoutData?.date);
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

function AdminDashboard() {
  const [filterType, setFilterType] = useState("Daily");

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  const { hotelName } = useHotelContext();

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

  const {
    pendingOrders,
    acceptedOrders,
    completedOrders,
    cancelledOrders,
    orderCounts,
    loading: ordersLoading,
    error: ordersError,
  } = useOrdersData(hotelName);

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

  const filteredOrderCounts = {
    pending: filteredPendingOrders.length,
    accepted: filteredAcceptedOrders.length,
    completed: filteredCompletedOrders.length,
    cancelled: filteredCancelledOrders.length,
  };

  const { categoryDataArray, totalRevenue, ordersByCategoryGraphData } =
    useProcessedCategoryData(filteredCompletedOrders);

  const menuDataArray = useProcessedMenuData(filteredCompletedOrders);
  const { customerDataArray, customerCountData } = useCustomerData(
    filteredCompletedOrders
  );

  console.log("customerDataArraycustomerDataArray", customerDataArray);
  if (menuLoading || categoriesLoading || ordersLoading)
    return <div>Loading...</div>;
  if (menuError || categoriesError || ordersError)
    return (
      <div>
        Error:{" "}
        {menuError?.message || categoriesError?.message || ordersError?.message}
      </div>
    );

  const OrdersByCategoryGraphData = categoryDataArray.map(
    ({ menuCategory, menuCategoryCount }) => ({
      menuCategory,
      menuCategoryCount,
    })
  );

  const filteredCustomerDataArray =
    filterType === "Daily"
      ? filterDaily(customerDataArray)
      : filterType === "Weekly"
      ? filterWeekly(customerDataArray)
      : filterMonthly(customerDataArray);

  const Column1 = OrdersAndRevenueByMenuColumns;
  const columns2 = RevenueByCategoryColumns;
  const column3 = OrdersAndRevenueByCutomerColumns;

  console.log("filteredCustomerDataArray", filteredCustomerDataArray);
  return (
    <div className="container mx-auto px-4">
      {/* Filter Buttons */}
      <div className="flex justify-end mt-5 mb-4" style={{width:'100%'}}>
        <div className="flex space-x-4 border-b border-gray-300">
          {["Daily", "Weekly", "Monthly"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-lg font-medium rounded-t-lg transition-all duration-300 ${
                filterType === type
                  ? "text-orange-500 border-b-2 border-orange-500 bg-white shadow"
                  : "text-gray-700 hover:text-orange-500 hover:border-b-2 hover:border-orange-500"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Widgets Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
        <Widget
          icon={<i className="bi bi-exclamation-circle-fill"></i>}
          title={"Pending Orders"}
          subtitle={filteredOrderCounts.pending}
        />
        <Widget
          icon={<i className="bi bi-check-circle-fill"></i>}
          title={"Accepted Orders"}
          subtitle={filteredOrderCounts.accepted}
        />
        <Widget
          icon={<i className="bi bi-check-circle-fill"></i>}
          title={"Completed Orders"}
          subtitle={filteredOrderCounts.completed}
        />
        <Widget
          icon={<i className="bi bi-x-circle-fill"></i>}
          title={"Cancelled Orders"}
          subtitle={filteredOrderCounts.cancelled}
        />
        <Widget
          icon={<i className="bi bi-person-plus-fill"></i>}
          title={"Total Customers"}
          subtitle={customerDataArray.length}
        />
        <Widget
          icon={<i className="bi bi-currency-rupee"></i>}
          title={"Total Revenue"}
          subtitle={totalRevenue}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Avg Revenue/Day"}
          subtitle={totalRevenue}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Menus"}
          subtitle={totalMenus}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Total Categories"}
          subtitle={totalCategories}
        />
      </div>

      {/* History and Charts Section */}
      <div className="mt-6 grid grid-cols-1 gap-6">
        <HistoryCard />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DailyTraffic />
          <DailyOrders />
          <PieChartCard donutChartData={OrdersByCategoryGraphData} />
        </div>
      </div>

      {/* Revenue and Orders Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <PageTitle pageTitle="Revenue By Category" />
          </div>
          <Table columns={columns2} data={categoryDataArray} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <PageTitle pageTitle="Orders and Revenue By Customer" />
          </div>
          <Table columns={column3} data={customerDataArray} />
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <PageTitle pageTitle="Orders and Revenue By Menu" />
        </div>
        <Table columns={Column1} data={menuDataArray} />
      </div>

      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;

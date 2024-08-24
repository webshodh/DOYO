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
  const { customerDataArray, customerContData } = useCustomerData(
    filteredCompletedOrders
  );
  console.log(
    "filteredCompletedOrdersfilteredCompletedOrders",
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
    <div>
      <div className="d-flex justify-end mt-1 mb-1">
        <div className="d-flex justify-between">
          <div className="d-flex">
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
      </div>

      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-3">
        <Banner1 />
        <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6">
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
            subtitle={customerContData.totalCustomers}
          />
          <Widget
            icon={<i className="bi bi-person-fill-check"></i>}
            title={"New Customers"}
            subtitle={customerContData.newCustomers}
          />
          <Widget
            icon={<i className="bi bi-person-heart"></i>}
            title={"Loyal Customers"}
            subtitle={customerContData.loyalCustomers}
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
      </div>
      <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
          <div className="mt-5 grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
            <DailyTraffic />
            <PieChartCard donutChartData={OrdersByCategoryGraphData} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
            <DailyOrders />
            <PieChartCard donutChartData={OrdersByCategoryGraphData} />
          </div>
          <div className="mt-5">
            <div>
              <div className="background-card">
                <PageTitle pageTitle="Orders and Revenue By Menu" />
                <Table columns={Column1} data={menuDataArray} />
              </div>
            </div>
            <div className="mt-5">
              <div className="background-card">
                <PageTitle pageTitle="Revenue By Category" />
                <Table columns={columns2} data={categoryDataArray} />
              </div>
            </div>
            <div className="mt-5">
              <div className="background-card">
                <PageTitle pageTitle="Orders and Revenue By Customer" />
                <Table columns={column3} data={customerDataArray} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-1">
          <div className="h-full w-full">
            <HistoryCard />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;

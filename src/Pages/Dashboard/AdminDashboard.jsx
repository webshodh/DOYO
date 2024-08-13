import React, { useState, useEffect } from "react";
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
import {
  CountCard,
  Table,
  DonutChart,
  Tab,
  Header,
  SideBar,
} from "../../components";
import {
  OrdersAndRevenueByCutomerColumns,
  OrdersAndRevenueByMenuColumns,
  RevenueByCategoryColumns,
} from "../../data/Columns";
import useHotelsData from "../../data/useHotelsData";
import { getAuth } from "firebase/auth";
import { useHotelContext } from "../../Context/HotelContext";

function AdminDashboard() {
  const [showAll, setShowAll] = useState(false);
  const [filterCount, setFilterCount] = useState(5); // Default to showing top 5
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  console.log("currentAdminId", currentAdminId);
  const { hotelsData, addHotel, loading, error } =
    useHotelsData(currentAdminId);
  console.log("hotelsData", hotelsData);
  // Function to handle filter change
  const handleFilterChange = (count) => {
    setFilterCount(count);
  };

  /*--------------------------- Extract hotel name from URL path ---------------------------------------*/

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

  const { categoryDataArray, totalRevenue, ordersByCategoryGraphData } =
    useProcessedCategoryData(completedOrders);

  const menuDataArray = useProcessedMenuData(completedOrders);
  const { customerDataArray, customerContData } =
    useCustomerData(completedOrders);

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
  // Sort the array by menuCount to get the top most ordered dishes
  const sortedMenuDataArray = [...menuDataArray].sort(
    (a, b) => b.menuCount - a.menuCount
  );
  // Columns
  const Column1 = OrdersAndRevenueByMenuColumns;
  const columns2 = RevenueByCategoryColumns;
  const column3 = OrdersAndRevenueByCutomerColumns;

  const tabs = [
    { label: "Daily", content: "Daily" },
    { label: "Weekly", content: "Weekly" },
    { label: "Monthly", content: "Monthly" },
  ];

  const tabs2 = [
    {
      label: "Top 5",
      content: (
        <div className="row">
          {sortedMenuDataArray
            .slice(0, 5) // Show top 'filterCount' items
            .map(({ menuName, menuCount, imageUrl }, index) => (
              <div className="col-md-12" key={menuName}>
                <CountCard
                  src={imageUrl}
                  count={menuCount}
                  label={menuName}
                  type={`type${index % 4}`} // Cycle through types if there are more items than types
                  width="80px"
                  height="80px"
                  marginTop="-10px"
                />
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
            .slice(0, 10) // Show top 'filterCount' items
            .map(({ menuName, menuCount, imageUrl }, index) => (
              <div className="col-md-12" key={menuName}>
                <CountCard
                  src={imageUrl}
                  count={menuCount}
                  label={menuName}
                  type={`type${index % 4}`} // Cycle through types if there are more items than types
                  width="80px"
                  height="80px"
                  marginTop="-10px"
                />
              </div>
            ))}
        </div>
      ),
    },
  ];
  const filterCompletedOrdersByDate = (completedOrders, filterType) => {
    const today = new Date();
    let startDate;

    switch (filterType) {
      case "Daily":
        // Set start date to the beginning of the current day
        startDate = new Date(today.setHours(0, 0, 0, 0));
        break;
      case "Weekly":
        // Set start date to 7 days ago
        startDate = new Date(today.setDate(today.getDate() - 6));
        break;
      case "Monthly":
        // Set start date to 30 days ago
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      default:
        return completedOrders; // If no filter type, return all completed orders
    }

    return completedOrders.filter((order) => {
      const orderDate = new Date(order.date); // Convert the order's date string to a Date object
      return orderDate >= startDate && orderDate <= new Date(); // Check if the order date is within the range
    });
  };

  return (
    <div>
      {/* Page Title and Filter */}
      <div
        className="d-flex justify-content-between"
        style={{ marginTop: "70px" }}
      >
        <PageTitle pageTitle={"Dashboard"} />
        <Tab tabs={tabs} />
      </div>

      {/* Count Card for Orders & Customers */}
      <div>
        <div>
          <div>
            <div className="container">
              <div className="row" style={{ marginLeft: "-40px" }}>
                {/* Main content area */}
                <div className="col-md-9">
                  {/* Total */}
                  <div className="row background-card">
                    <PageTitle pageTitle={"Orders"} />
                    <div className="col-md-3 mb-3">
                      <CountCard
                        icon="bi-exclamation-circle-fill"
                        iconColor="red"
                        count={orderCounts.pending}
                        label={"Pending Orders"}
                        type="primary"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <CountCard
                        icon="bi-check-circle"
                        iconColor="orange"
                        count={orderCounts.accepted}
                        label={"Accepted Orders"}
                        type="primary"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <CountCard
                        icon="bi-check-circle-fill"
                        iconColor="#00C000"
                        count={orderCounts.completed}
                        label={"Completed Orders"}
                        type="primary"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <CountCard
                        icon="bi-x-circle-fill"
                        iconColor="red"
                        count={orderCounts.cancelled}
                        label={"Cancelled Orders"}
                        type="primary"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="row background-card">
                        {/* Second row of cards */}

                        <PageTitle pageTitle="Menu" />
                        <div className="d-flex justify-content-between">
                          <div
                            className="col-md-0 mb-6"
                            style={{
                              marginLeft: "-10px",
                              marginBottom: "50px",
                            }}
                          >
                            <CountCard
                              src="/serving.png"
                              iconColor="orange"
                              count={totalMenus}
                              label="Total Menu's"
                              type="primary"
                              width="50px"
                              height="50px"
                              marginTop="10px"
                              marginLeft="0px"
                            />
                            <PageTitle pageTitle={"Category"} />
                            <CountCard
                              src="/tag.png"
                              iconColor="red"
                              count={totalCategories}
                              label="Total Categories"
                              type="primary"
                              width="50px"
                              height="50px"
                              marginTop="5px"
                              marginLeft="0px"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-9">
                      <div className="row d-flex">
                        <div className="background-card">
                          <PageTitle pageTitle={"Customers"} />
                          <div className="d-flex justify-content-between">
                            <div className="col-md-4 mb-1">
                              <CountCard
                                icon="bi-person-fill-add"
                                iconColor=""
                                count={customerContData.totalCustomers}
                                label={"Total Customers"}
                                type="primary"
                              />
                            </div>
                            <div className="col-md-4 mb-1">
                              <CountCard
                                icon="bi-person-fill-up"
                                iconColor="#00C000"
                                count={customerContData.newCustomers}
                                label={"New Customers"}
                                type="primary"
                              />
                            </div>
                            <div className="col-md-4 mb-1">
                              <CountCard
                                icon="bi-person-heart"
                                iconColor="red"
                                count={customerContData.loyalCustomers}
                                label={"Loyal Customers"}
                                type="primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row d-flex">
                        <div className="background-card">
                          <PageTitle pageTitle={"Revenue"} />
                          <div className="d-flex justify-content-between">
                            <div className="col-md-4 mb-1">
                              <CountCard
                                icon="bi-currency-rupee"
                                iconColor="#00C000"
                                count={totalRevenue}
                                label={"Total Revenue"}
                                type="primary"
                              />
                            </div>
                            <div className="col-md-4 mb-1">
                              <CountCard
                                icon="fa-list"
                                count={0}
                                label={"Avg Revenue/Day"}
                                type="primary"
                              />
                            </div>
                            <div className="col-md-4 mb-1">
                              <CountCard
                                icon="fa-list"
                                count={0}
                                label={"Avg Revenue/Day"}
                                type="primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Capsules */}
                  <div className="row d-flex flex-wrap col-md-12 background-card">
                    <PageTitle pageTitle={"Orders by Category"} />
                    <div className="category-items d-flex flex-wrap mb-3">
                      {categoryDataArray
                        .slice(0, showAll ? categoryDataArray.length : 4)
                        .map(({ menuCategory, menuCategoryCount }, index) => (
                          <div
                            key={index}
                            className="category-item d-flex align-items-center mx-2 mb-3 capsule"
                          >
                            <div className="category-content d-flex align-items-center">
                              <span className="category-name mx-2">
                                {menuCategory}
                              </span>
                              <span className="category-badge-number">
                                {menuCategoryCount}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div>
                      {menuDataArray.length > 6 && (
                        <div className="show-more-card">
                          <p
                            onClick={() => setShowAll(!showAll)}
                            className="show-more"
                          >
                            {showAll ? "Show Less" : "Show More"}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* <div className="d-flex justfy-content-between">
                    <img src="/ads.png" height={'200px'} width={'500px'} style={{marginRight:'10px'}}/>
                    <img src="/ads2.jpg" height={'200px'} width={'500px'}/>
                    </div> */}
                  </div>
                  <div className="d-flex justify-content-around">
                    {/* Donut Chart */}
                    <div className="row donut-chart col-md-6 background-card">
                      <PageTitle pageTitle={"Orders By Category"} />
                      <DonutChart data={OrdersByCategoryGraphData} />
                    </div>
                    <div className=" row col-lg-6 col-md-6 col-sm-12 col-12 mb-4 background-card ">
                      <PageTitle pageTitle={"Revenue By Category"} />
                      <Table columns={columns2} data={categoryDataArray} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-around">
                    <div className=" row col-lg-12 col-md-6 col-sm-12 col-12 mb-4 background-card ">
                      <PageTitle pageTitle={"Orders and Revenue By Menu"} />
                      <Table columns={Column1} data={menuDataArray} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-around">
                    <div className=" row col-lg-12 col-md-6 col-sm-12 col-12 mb-4 background-card ">
                      <PageTitle pageTitle={"Orders and Revenue By Customer"} />
                      <Table columns={column3} data={customerDataArray} />
                    </div>
                  </div>
                </div>

                {/* Sidebar for Top 5 Menus */}
                <div className="col-md-3" style={{ marginTop: "-15px" }}>
                  <div className="mb-3 background-card">
                    <div style={{ marginLeft: "10px" }}>
                      <PageTitle pageTitle={"Most Orderd Menu"} />
                    </div>
                    <Tab tabs={tabs2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;

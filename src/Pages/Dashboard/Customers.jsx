import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { PageTitle } from "../../Atoms";
import { DynamicTable, FilterSortSearch } from "../../components";
import { customersColumns } from "../../data/Columns";
import useCompletedOrders from "../../data/useCompletedOrders";
import useCustomerData from "../../data/useCustomerData";
const Customers = () => {
  // const [completedOrders, setCompletedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const hotelName = "Atithi";

  // useEffect(() => {
  //   const ordersRef = ref(db, `Atithi/orders/`);
  //   const unsubscribe = onValue(ordersRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const completedOrders = [];

  //       Object.keys(data).forEach((orderId) => {
  //         const order = data[orderId]?.orderData || {};
  //         const status = order.status || "Pending";

  //         if (status === "Completed") {
  //           completedOrders.push({ ...order, orderId });
  //         }
  //       });
  //       setCompletedOrders(completedOrders);
  //     } else {
  //       setCompletedOrders([]);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [hotelName]);

  // /*--------------------------- Customer Data ---------------------------------------*/

  // const customerContData = {
  //   totalCustomers: 0,
  //   newCustomers: 0,
  //   loyalCustomers: 0,
  // };

  // const customerInfo = {};

  // completedOrders.forEach((order) => {
  //   const { checkoutData } = order;
  //   const { name, cartItems } = checkoutData;

  //   const totalOrderPrice = cartItems.reduce(
  //     (sum, item) => sum + parseFloat(item.menuPrice) * item.quantity,
  //     0
  //   );

  //   if (!customerInfo[name]) {
  //     // New customer
  //     customerInfo[name] = { name, totalMenuPrice: 0, totalOrders: 0 };
  //     customerContData.newCustomers += 1;
  //   } else {
  //     // Loyal customer
  //     customerContData.loyalCustomers += 1;
  //   }

  //   customerInfo[name].totalMenuPrice += totalOrderPrice;
  //   customerInfo[name].totalOrders += 1;
  //   customerContData.totalCustomers += 1;
  // });

  // // Convert customerInfo to an array and add serial numbers
  // let customerDataArray = Object.values(customerInfo).map(
  //   (customer, index) => ({
  //     srNo: index + 1, // Serial number (1-based index)
  //     ...customer,
  //   })
  // );

  const { completedOrders, loading, error } = useCompletedOrders(hotelName);
  const { customerDataArray, customerContData } = useCustomerData(completedOrders);
console.log('customerDataArray', customerDataArray)
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Sorting logic
  if (sortOrder !== "default") {
    if (sortOrder === "lowToHigh") {
      customerDataArray.sort(
        (a, b) => parseFloat(a.totalMenuPrice) - parseFloat(b.totalMenuPrice)
      );
    } else if (sortOrder === "highToLow") {
      customerDataArray.sort(
        (a, b) => parseFloat(b.totalMenuPrice) - parseFloat(a.totalMenuPrice)
      );
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const columns = customersColumns;

  return (
    <>
      <div style={{ marginTop: "70px" }}>
        <PageTitle pageTitle={"Customers"} />
      </div>
      <div className="container mt-2" style={{ width: "70vw" }}>
        <FilterSortSearch
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleSort={handleSort}
        />
        <div className="rows">
          <DynamicTable
            columns={columns}
            data={customerDataArray}
            onEdit={null}
            onDelete={null}
          />
        </div>
      </div>
    </>
  );
};

export default Customers;

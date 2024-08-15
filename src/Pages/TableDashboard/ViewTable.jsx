import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CountCard, DynamicTable, FilterSortSearch, Tab } from "../../components";
import PageTitle from "../../Atoms/PageTitle";
import styled from "styled-components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import ColoredCheckbox from "../../Atoms/ColoredCheckbox";
import { useOrdersData } from "../../data";
import TableCard from "../../components/Cards/TableCard";

// Background Card
const BackgroundCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

function ViewTable() {
  const { hotelName } = useHotelContext();
  
  const {
    pendingOrders,
    acceptedOrders,
    completedOrders,
    cancelledOrders,
    orderCounts,
    loading: ordersLoading,
    error: ordersError,
  } = useOrdersData(hotelName);

 
  console.log("pendingOrders", pendingOrders);
  return (
    <>

     
      <div style={{ display: "flex", alignItems: "center" }}>
        <ColoredCheckbox label="Available" color="white" />
        <ColoredCheckbox label="Order Pending" color="orange" />
        <ColoredCheckbox label="Order Processing" color="green" />
        <ColoredCheckbox label="Payment Pending" color="blue" />
      </div>
      <div className="container mt-2">
        {/* <FilterSortSearch searchTerm={searchTerm} handleSearch={handleSearch} /> */}
        <div className="d-flex">
          {[
            ...pendingOrders.reduce((acc, item) => {
              const tableNo = item.checkoutData.tableNo;
              if (acc.has(tableNo)) {
                acc.get(tableNo).count += 1;
              } else {
                acc.set(tableNo, { ...item, count: 1 });
              }
              return acc;
            }, new Map()),
          ]
            .sort((a, b) => a[0] - b[0]) // Sort by table number in ascending order
            .map(([tableNo, item], index) => (
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

        <div className="d-flex">
          {[
            ...acceptedOrders.reduce((acc, item) => {
              const tableNo = item.checkoutData.tableNo;
              if (acc.has(tableNo)) {
                acc.get(tableNo).count += 1;
              } else {
                acc.set(tableNo, { ...item, count: 1 });
              }
              return acc;
            }, new Map()),
          ]
            .sort((a, b) => a[0] - b[0]) // Sort by table number in ascending order
            .map(([tableNo, item], index) => (
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
      <ToastContainer />
    </>
  );
}

export default ViewTable;

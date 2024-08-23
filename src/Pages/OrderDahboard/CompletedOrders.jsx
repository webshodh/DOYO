import React from "react";
import { Alert } from "react-bootstrap";
import DynamicTable from "../../components/DynamicTable";
import { completedOrderColumn } from "../../data/Columns";

const CompletedOrders = ({ orders, count }) => {
  const flattenOrderData = (orders) => {
    return orders.map((order, index) => ({
      ...order,
      index: index + 1,
      tableNo: order.checkoutData.tableNo,
      name: order.checkoutData.name,
      bill: order.quantity * order.menuPrice
    }));
  };

  const columns = completedOrderColumn

  const data = flattenOrderData(orders);
  console.log("data", data);
  return (
    <>
      {count === 0 ? (
        <Alert variant="info">No completed orders at the moment.</Alert>
      ) : (
        <DynamicTable columns={columns} data={data} />
      )}
    </>
  );
};

export default CompletedOrders;

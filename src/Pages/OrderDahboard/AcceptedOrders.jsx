import React from 'react';
import { Alert } from 'react-bootstrap';
import DynamicTable from '../../components/DynamicTable';
import { AcceptedOrderColumn } from '../../data/Columns';
import PropTypes from 'prop-types';

// Helper function to flatten order data
const flattenOrderData = (orders) => {
  return orders.map((order, index) => ({
    ...order,
    index: index + 1,
    tableNumber: order.checkoutData.tableNumber,
    name: order.checkoutData.name,
  }));
};

const AcceptedOrders = ({ orders, onMarkAsCompleted, count }) => {
  // Prepare columns and actions
  const columns = AcceptedOrderColumn;
  const actions = [
    { label: 'Mark as Completed', variant: 'primary', handler: onMarkAsCompleted }
  ];

  // Flatten and prepare the data
  const data = flattenOrderData(orders);
console.log("AcceptedOrders", data)
  return (
    <>
      {count === 0 ? (
        <Alert variant="info">No accepted orders at the moment.</Alert>
      ) : (
        <DynamicTable
          columns={columns}
          data={data}
          onMarkAsCompleted={onMarkAsCompleted}
        />
      )}
    </>
  );
};



export default AcceptedOrders;

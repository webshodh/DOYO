import React from 'react';
import { Alert } from 'react-bootstrap';
import DynamicTable from '../../components/DynamicTable';
import { pendingOrdercolumns } from '../../data/Columns';

const PendingOrders = ({ orders, onAccept, onReject, count }) => {
  const flattenOrderData = (orders) => {
    return orders.map((order, index) => ({
      ...order,
      index: index + 1,
      tableNumber: order.checkoutData.tableNumber,
      name: order.checkoutData.name,
    }));
  };

  const columns = pendingOrdercolumns;

  // Flatten and prepare the data
  const data = flattenOrderData(orders);

  return (
    <>
      {count === 0 ? (
        <Alert variant="info">No pending orders at the moment.</Alert>
      ) : (
        <DynamicTable
          columns={columns}
          data={data}
          onAccept={onAccept}
          onReject={onReject}
        />
      )}
    </>
  );
};

export default PendingOrders;

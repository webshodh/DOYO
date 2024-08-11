import React from 'react';
import { Alert } from 'react-bootstrap';
import DynamicTable from '../components/DynamicTable';

const PendingOrders = ({ orders, onAccept, onReject, count }) => {
  const flattenOrderData = (orders) => {
    return orders.map((order, index) => ({
      ...order,
      index: index + 1,
      tableNo: order.checkoutData.tableNo,
      name: order.checkoutData.name,
    }));
  };

  const columns = [
    { header: 'Sr.No', accessor: 'index' },
    { header: 'Item Name', accessor: 'menuName' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Table No', accessor: 'tableNo' },
    { header: 'Name', accessor: 'name' }
  ];

  const actions = [
    { label: 'Accept', variant: 'success', handler: onAccept },
    { label: 'Reject', variant: 'danger', handler: onReject }
  ];

  const data = flattenOrderData(orders);

  return (
    <>
      <h4>Pending Orders ({count})</h4>
      {count === 0 ? (
        <Alert variant="info">No pending orders at the moment.</Alert>
      ) : (
        <DynamicTable
          columns={columns}
          data={data}
          actions={actions}
        />
      )}
    </>
  );
};

export default PendingOrders;

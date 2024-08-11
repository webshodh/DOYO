import React from 'react';
import { Alert } from 'react-bootstrap';
import DynamicTable from '../components/DynamicTable';

const AcceptedOrders = ({ orders, onMarkAsCompleted, count }) => {
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
    { label: 'Mark as Completed', variant: 'primary', handler: onMarkAsCompleted }
  ];

  const data = flattenOrderData(orders);

  return (
    <>
      <h4>Accepted Orders ({count})</h4>
      {count === 0 ? (
        <Alert variant="info">No accepted orders at the moment.</Alert>
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

export default AcceptedOrders;

import React from 'react';
import { Alert } from 'react-bootstrap';
import DynamicTable from '../../components/DynamicTable';
import { cancelledOrderColumn } from '../../data/Columns';

const CancelledOrders = ({ orders, count }) => {
  const flattenOrderData = (orders) => {
    return orders.map((order, index) => ({
      ...order,
      index: index + 1,
      tableNo: order.checkoutData.tableNo,
      name: order.checkoutData.name,
      waiterName: order.waiterName, // Assuming waiterName is available in order
      rejectionReason: order.rejectionReason, // Assuming rejectionReason is available in order
    }));
  };

  const columns = cancelledOrderColumn

  const data = flattenOrderData(orders);

  return (
    <>
      <h4>Cancelled Orders ({count})</h4>
      {count === 0 ? (
        <Alert variant="info">No cancelled orders at the moment.</Alert>
      ) : (
        <DynamicTable
          columns={columns}
          data={data}
        />
      )}
    </>
  );
};

export default CancelledOrders;

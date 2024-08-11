import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { onValue, ref } from 'firebase/database';

const useOrdersData = (hotelName) => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ordersRef = ref(db, `${hotelName}/orders/`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const pending = [];
          const accepted = [];
          const completed = [];
          const cancelled = [];

          Object.keys(data).forEach((orderId) => {
            const order = data[orderId]?.orderData || {};
            const status = order.status || 'Pending';

            if (status === 'Pending') {
              pending.push({ ...order, orderId });
            } else if (status === 'Accepted') {
              accepted.push({ ...order, orderId });
            } else if (status === 'Completed') {
              completed.push({ ...order, orderId });
            } else if (status === 'Cancelled') {
              cancelled.push({ ...order, orderId }); // Correctly push to cancelled
            }
          });

          setPendingOrders(pending);
          setAcceptedOrders(accepted);
          setCompletedOrders(completed);
          setCancelledOrders(cancelled);
          setOrderCounts({
            pending: pending.length,
            accepted: accepted.length,
            completed: completed.length,
            cancelled: cancelled.length,
          });
        } else {
          setPendingOrders([]);
          setAcceptedOrders([]);
          setCompletedOrders([]);
          setCancelledOrders([]);
          setOrderCounts({
            pending: 0,
            accepted: 0,
            completed: 0,
            cancelled: 0,
          });
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);

  return { pendingOrders, acceptedOrders, completedOrders, cancelledOrders, orderCounts, loading, error };
};

export default useOrdersData;

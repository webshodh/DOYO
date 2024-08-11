import { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig'; // Adjust the path as necessary
import { onValue, ref } from 'firebase/database';

const useCompletedOrders = (hotelName) => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ordersRef = ref(db, `${hotelName}/orders/`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const orders = [];

          Object.keys(data).forEach((orderId) => {
            const order = data[orderId]?.orderData || {};
            const status = order.status || 'Pending';

            if (status === 'Completed') {
              orders.push({ ...order, orderId });
            }
          });

          setCompletedOrders(orders);
        } else {
          setCompletedOrders([]);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);

  return { completedOrders, loading, error };
};

export default useCompletedOrders;

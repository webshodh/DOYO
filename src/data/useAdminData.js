import { useEffect, useState } from 'react';
import { db } from './firebase/firebaseConfig';
import { onValue, ref } from 'firebase/database';

const useAdminData = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dataRef = ref(db, path);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const value = snapshot.val();
        if (value) {
          // Assuming value is an object structured as desired
          setData(value);
        } else {
          setData({});
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
};

export default useAdminData;

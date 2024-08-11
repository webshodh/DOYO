import { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig';
import { onValue, ref } from 'firebase/database';

const useCategoriesData = (hotelName) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const categoriesRef = ref(db, `/${hotelName}/categories/`);
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const categoriesArray = data ? Object.values(data) : [];
        setCategoriesData(categoriesArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);
  const totalCategories = categoriesData.length;
  return { categoriesData, totalCategories, loading, error };
};

export default useCategoriesData;

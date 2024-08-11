import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { onValue, ref } from 'firebase/database';

const useMenuData = (hotelName) => {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const menuRef = ref(db, `/${hotelName}/menu/`);
    const unsubscribe = onValue(menuRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const menuArray = data ? Object.values(data) : [];
        setMenuData(menuArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);
  const totalMenus = menuData.length;
  return { menuData, loading, error, totalMenus };
};

export default useMenuData;

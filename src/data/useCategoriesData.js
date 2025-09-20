import { useState, useEffect } from "react";
import { db } from "../services/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
const useCategoriesData = (hotelName) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  useEffect(() => {
    const categoriesRef = ref(db, `/hotels/${hotelName}/categories/`);
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
  console.log("categoriesData", categoriesData);
  const totalCategories = categoriesData.length;
  return { categoriesData, totalCategories, loading, error };
};

export default useCategoriesData;

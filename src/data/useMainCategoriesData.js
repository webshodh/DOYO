import { useState, useEffect } from "react";
import { db } from "../services/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
const useMainCategoriesData = (hotelName) => {
  const [mainCategoriesData, setMainCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  useEffect(() => {
    const categoriesRef = ref(db, `/hotels/${hotelName}/Maincategories/`);
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const categoriesArray = data ? Object.values(data) : [];
        setMainCategoriesData(categoriesArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);
  console.log("MaincategoriesData", mainCategoriesData);
  const totalMainCategories = mainCategoriesData.length;
  return { mainCategoriesData, totalMainCategories, loading, error };
};

export default useMainCategoriesData;

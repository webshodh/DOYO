import { useState, useEffect } from "react";
import { db } from "../services/firebase/firebaseConfig"; // Adjust the path as necessary
import { onValue, ref } from "firebase/database";

const useData = (path) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dataRef = ref(db, path);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const dataArray = Object.values(data);
          setData(dataArray);
        } else {
          setData([]);
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

export default useData;

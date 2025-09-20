import { useState, useEffect } from "react";
import { db } from "../services/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";

const useOptionsData = (hotelName) => {
  const [optionsData, setOptionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelName) return;

    const categoriesRef = ref(db, `/hotels/${hotelName}/optionCategories`);

    const unsubscribe = onValue(
      categoriesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          const formattedOptions = {};

          if (data) {
            Object.keys(data).forEach((categoryKey) => {
              const category = data[categoryKey];
              formattedOptions[categoryKey] = category.options
                ? Object.values(category.options)
                : [];
            });
            setOptionsData(formattedOptions);
          } else {
            setOptionsData({});
          }
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hotelName]);

  // Flatten all options into a single array for easier statistics
  const allOptions = Object.values(optionsData).flat();

  const totalOptionsCount = allOptions.length;
  const categories = Object.keys(optionsData);

  // Get unique option types, assuming each option has an `optionType` field
  const optionTypes = [
    ...new Set(allOptions.map((opt) => opt.optionType).filter(Boolean)),
  ];

  return {
    optionsData,
    totalOptionsCount,
    categories,
    optionTypes,
    loading,
    error,
  };
};

export default useOptionsData;

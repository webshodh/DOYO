// hooks/useHomeData.js
import { useState, useEffect, useCallback } from "react";
import { homeService } from "../services/homeService";

export const useHomeData = (hotelName) => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    menuCountsByCategory: {},
    menuCountsByMainCategory: {},
    specialCategoryCounts: {},
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await homeService.fetchAllData(hotelName);

      setMenus(data.menus);
      setCategories(data.categories);
      setMainCategories(data.mainCategories);
      setCounts(data.counts);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [hotelName]);

  useEffect(() => {
    if (hotelName) {
      fetchData();
    }
  }, [hotelName, fetchData]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    menus,
    categories,
    mainCategories,
    loading,
    error,
    counts,
    retry,
  };
};

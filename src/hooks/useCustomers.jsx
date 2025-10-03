// ==================== FILE 1: useCustomers.js ====================
import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";

export function useCustomers(hotelName) {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(() => {
    if (!hotelName) {
      setCustomers([]);
      return () => {};
    }

    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("hotelName", "==", hotelName));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const customersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setCustomers(customersData);
          setError(null);
        } else {
          setCustomers([]);
          setError(null);
        }
      },
      (err) => {
        console.error("Error fetching customers:", err);
        setError(err.message || "Failed to fetch customers");
        setCustomers([]);
      },
    );

    return unsubscribe;
  }, [hotelName]);

  useEffect(() => {
    const unsubscribe = fetchCustomers();
    return () => unsubscribe();
  }, [fetchCustomers]);

  const stats = useMemo(() => {
    if (!customers || customers.length === 0) {
      return {
        totalCustomers: 0,
        uniqueCustomers: 0,
        loyalCustomers: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        totalOrders: 0,
        newCustomers: 0,
        vipCustomers: 0,
        activeCustomers: 0,
        oneTimeCustomers: 0,
        repeatCustomers: 0,
        frequentCustomers: 0,
        superFrequentCustomers: 0,
        eliteCustomers: 0,
      };
    }

    const totalCustomers = customers.length;
    const uniqueCustomers = customers.length;

    // Customer segmentation by visit count
    const oneTimeCustomers = customers.filter(
      (c) => (c.orderCount || 0) === 1,
    ).length;
    const repeatCustomers = customers.filter(
      (c) => (c.orderCount || 0) >= 2 && (c.orderCount || 0) < 3,
    ).length;
    const frequentCustomers = customers.filter(
      (c) => (c.orderCount || 0) >= 3 && (c.orderCount || 0) < 5,
    ).length;
    const superFrequentCustomers = customers.filter(
      (c) => (c.orderCount || 0) >= 5 && (c.orderCount || 0) < 10,
    ).length;
    const eliteCustomers = customers.filter(
      (c) => (c.orderCount || 0) >= 10,
    ).length;

    const loyalCustomers = customers.filter(
      (c) => (c.orderCount || 0) >= 2,
    ).length;

    const totalRevenue = customers.reduce(
      (sum, c) => sum + (c.totalOrderValue || 0),
      0,
    );
    const totalOrders = customers.reduce(
      (sum, c) => sum + (c.orderCount || 0),
      0,
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = customers.filter((c) => {
      if (!c.firstOrderDate) return false;
      const firstOrder = c.firstOrderDate.toDate
        ? c.firstOrderDate.toDate()
        : new Date(c.firstOrderDate);
      return firstOrder >= thirtyDaysAgo;
    }).length;

    const vipCustomers = customers.filter(
      (c) => (c.totalOrderValue || 0) >= 50000,
    ).length;
    const activeCustomers = customers.filter((c) => {
      if (!c.lastOrderDate) return false;
      const lastOrder = c.lastOrderDate.toDate
        ? c.lastOrderDate.toDate()
        : new Date(c.lastOrderDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastOrder >= sevenDaysAgo;
    }).length;

    return {
      totalCustomers,
      uniqueCustomers,
      loyalCustomers,
      totalRevenue,
      avgOrderValue,
      totalOrders,
      newCustomers,
      vipCustomers,
      activeCustomers,
      oneTimeCustomers,
      repeatCustomers,
      frequentCustomers,
      superFrequentCustomers,
      eliteCustomers,
    };
  }, [customers]);

  return {
    customers,
    ...stats,
    error,
  };
}

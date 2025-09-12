// context/TableSessionContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { ref, push, set, get, onValue, update } from "firebase/database";
import { db } from "../data/firebase/firebaseConfig";

const TableSessionContext = createContext();

export const useTableSession = () => {
  const context = useContext(TableSessionContext);
  if (!context) {
    throw new Error(
      "useTableSession must be used within a TableSessionProvider"
    );
  }
  return context;
};

export const TableSessionProvider = ({ children, hotelName }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionOrders, setSessionOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Start a new table session
  const startTableSession = async (tableNumber) => {
    setIsLoading(true);
    try {
      const sessionData = {
        tableNumber: parseInt(tableNumber),
        hotelName: hotelName,
        startTime: new Date().toISOString(),
        startTimeLocal: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        status: "active", // active, completed, cancelled
        totalAmount: 0,
        totalOrders: 0,
        orderSequence: 0,
        metadata: {
          createdAt: Date.now(),
          lastUpdated: Date.now(),
        },
      };

      const sessionsRef = ref(db, `/hotels/${hotelName}/table_sessions`);
      const newSessionRef = push(sessionsRef);
      const sessionId = newSessionRef.key;

      await set(newSessionRef, { ...sessionData, sessionId });

      setCurrentSession({ ...sessionData, sessionId });
      setSessionOrders([]);

      return sessionId;
    } catch (error) {
      console.error("Error starting table session:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get active session for a table
  const getActiveSessionForTable = async (tableNumber) => {
    try {
      const sessionsRef = ref(db, `/hotels/${hotelName}/table_sessions`);
      const snapshot = await get(sessionsRef);

      if (snapshot.exists()) {
        const sessions = snapshot.val();
        const activeSession = Object.values(sessions).find(
          (session) =>
            session.tableNumber === parseInt(tableNumber) &&
            session.status === "active"
        );

        if (activeSession) {
          setCurrentSession(activeSession);
          await loadSessionOrders(activeSession.sessionId);
          return activeSession;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting active session:", error);
      return null;
    }
  };

  // Load orders for a session
  const loadSessionOrders = async (sessionId) => {
    try {
      const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = snapshot.val();
        const sessionOrders = Object.values(orders)
          .filter((order) => order.sessionId === sessionId)
          .sort((a, b) => a.orderSequence - b.orderSequence);

        setSessionOrders(sessionOrders);
        return sessionOrders;
      }
      return [];
    } catch (error) {
      console.error("Error loading session orders:", error);
      return [];
    }
  };

  // Add order to current session
  const addOrderToSession = async (orderData, courseType = "main") => {
    if (!currentSession) {
      throw new Error("No active session found");
    }

    try {
      // Get next order sequence for session
      const nextSequence = currentSession.orderSequence + 1;

      // Enhanced order data with session info
      const sessionOrderData = {
        ...orderData,
        sessionId: currentSession.sessionId,
        orderSequence: nextSequence,
        courseType: courseType, // starter, main, dessert, beverage
        sessionInfo: {
          tableNumber: currentSession.tableNumber,
          sessionStartTime: currentSession.startTime,
          isMultiOrder: currentSession.totalOrders > 0,
        },
      };

      // Add order to Firebase
      const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, sessionOrderData);

      // Update session totals
      const newTotalAmount =
        currentSession.totalAmount + orderData.pricing.total;
      const newTotalOrders = currentSession.totalOrders + 1;

      const sessionUpdateData = {
        totalAmount: newTotalAmount,
        totalOrders: newTotalOrders,
        orderSequence: nextSequence,
        lastOrderTime: new Date().toISOString(),
        "metadata/lastUpdated": Date.now(),
      };

      const sessionRef = ref(
        db,
        `/hotels/${hotelName}/table_sessions/${currentSession.sessionId}`
      );
      await update(sessionRef, sessionUpdateData);

      // Update local state
      setCurrentSession((prev) => ({
        ...prev,
        totalAmount: newTotalAmount,
        totalOrders: newTotalOrders,
        orderSequence: nextSequence,
      }));

      await loadSessionOrders(currentSession.sessionId);

      return newOrderRef.key;
    } catch (error) {
      console.error("Error adding order to session:", error);
      throw error;
    }
  };

  // End table session
  const endTableSession = async () => {
    if (!currentSession) {
      throw new Error("No active session to end");
    }

    try {
      const sessionUpdateData = {
        status: "completed",
        endTime: new Date().toISOString(),
        endTimeLocal: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        duration: Date.now() - new Date(currentSession.startTime).getTime(),
        "metadata/lastUpdated": Date.now(),
      };

      const sessionRef = ref(
        db,
        `/hotels/${hotelName}/table_sessions/${currentSession.sessionId}`
      );
      await update(sessionRef, sessionUpdateData);

      const completedSession = { ...currentSession, ...sessionUpdateData };
      return completedSession;
    } catch (error) {
      console.error("Error ending table session:", error);
      throw error;
    }
  };

  // Get session totals
  const getSessionTotals = () => {
    if (!currentSession || sessionOrders.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        total: 0,
        orderCount: 0,
        itemCount: 0,
      };
    }

    const totals = sessionOrders.reduce(
      (acc, order) => {
        return {
          subtotal: acc.subtotal + (order.pricing?.subtotal || 0),
          tax: acc.tax + (order.pricing?.tax || 0),
          total: acc.total + (order.pricing?.total || 0),
          itemCount: acc.itemCount + (order.orderDetails?.totalItems || 0),
        };
      },
      { subtotal: 0, tax: 0, total: 0, itemCount: 0 }
    );

    return {
      ...totals,
      orderCount: sessionOrders.length,
    };
  };

  const value = {
    // State
    currentSession,
    sessionOrders,
    isLoading,

    // Actions
    startTableSession,
    getActiveSessionForTable,
    addOrderToSession,
    endTableSession,
    loadSessionOrders,
    getSessionTotals,

    // Computed values
    hasActiveSession: !!currentSession,
    sessionTotals: getSessionTotals(),
  };

  return (
    <TableSessionContext.Provider value={value}>
      {children}
    </TableSessionContext.Provider>
  );
};

export default TableSessionProvider;

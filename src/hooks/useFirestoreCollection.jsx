// src/hooks/useFirestoreCollection.js
import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy as firestoreOrderBy,
  where,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";

export const useFirestoreCollection = (collectionName, options = {}) => {
  // Default options
  const {
    orderBy = null, // [['field', 'direction']] format
    where: whereClause = null, // [['field', 'operator', 'value']] format
    limit: limitCount = null,
    realtime = true,
    enableRetry = true,
    maxRetries = 3,
  } = options;

  // State management
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for cleanup
  const unsubscribeRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // ✅ Build Firestore query
  const buildQuery = useCallback(() => {
    try {
      let q = collection(db, collectionName);

      // Apply where clauses
      if (whereClause && Array.isArray(whereClause)) {
        whereClause.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }

      // Apply ordering
      if (orderBy && Array.isArray(orderBy)) {
        orderBy.forEach(([field, direction = "asc"]) => {
          q = query(q, firestoreOrderBy(field, direction));
        });
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      return q;
    } catch (err) {
      console.error("Error building Firestore query:", err);
      throw err;
    }
  }, [collectionName, orderBy, whereClause, limitCount]);

  // ✅ Fetch data once (non-realtime)
  const fetchOnce = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus("connecting");

      const q = buildQuery();
      const snapshot = await getDocs(q);

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDocuments(docs);
      setConnectionStatus("connected");
      setLastFetch(Date.now());
      setRetryCount(0);

      return docs;
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err);
      setConnectionStatus("error");

      if (enableRetry && retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          fetchOnce();
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildQuery, collectionName, enableRetry, retryCount, maxRetries]);

  // ✅ Setup real-time listener
  const setupRealtimeListener = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus("connecting");

      const q = buildQuery();

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setDocuments(docs);
          setConnectionStatus("connected");
          setLastFetch(Date.now());
          setLoading(false);
          setRetryCount(0);
        },
        (err) => {
          console.error(`Error in ${collectionName} listener:`, err);
          setError(err);
          setConnectionStatus("error");
          setLoading(false);

          if (enableRetry && retryCount < maxRetries) {
            setRetryCount((prev) => prev + 1);
            retryTimeoutRef.current = setTimeout(() => {
              setupRealtimeListener();
            }, Math.pow(2, retryCount) * 1000);
          }
        }
      );

      unsubscribeRef.current = unsubscribe;
      return unsubscribe;
    } catch (err) {
      console.error(`Error setting up ${collectionName} listener:`, err);
      setError(err);
      setConnectionStatus("error");
      setLoading(false);
    }
  }, [buildQuery, collectionName, enableRetry, retryCount, maxRetries]);

  // ✅ Initialize data fetching
  useEffect(() => {
    if (realtime) {
      setupRealtimeListener();
    } else {
      fetchOnce();
    }

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [realtime, setupRealtimeListener, fetchOnce]);

  // ✅ Manual refresh function
  const refresh = useCallback(async () => {
    setRetryCount(0);

    if (realtime) {
      // Restart real-time listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      setupRealtimeListener();
    } else {
      // Fetch once
      return fetchOnce();
    }
  }, [realtime, setupRealtimeListener, fetchOnce]);

  // ✅ Add document helper
  const addDocument = useCallback(
    async (data) => {
      // This would typically be handled by a separate hook like useFirestoreDocument
      // But we can provide a basic implementation
      try {
        const { addDoc } = await import("firebase/firestore");
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return docRef;
      } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
      }
    },
    [collectionName]
  );

  // ✅ Computed values
  const computedValues = {
    isEmpty: documents.length === 0,
    count: documents.length,
    isRetrying: retryCount > 0 && loading,
    canRetry: enableRetry && retryCount < maxRetries,
    dataAge: lastFetch ? Date.now() - lastFetch : null,
  };

  return {
    // Data
    documents,

    // State
    loading,
    error,
    connectionStatus,
    lastFetch,
    retryCount,

    // Actions
    refresh,
    addDocument,

    // Computed values
    ...computedValues,
  };
};

export default useFirestoreCollection;

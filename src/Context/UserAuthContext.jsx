import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../data/firebase/firebaseConfig'; // Adjust the path as needed
import { onAuthStateChanged } from 'firebase/auth';

// Create a context for user authentication
export const UserAuthContext = createContext();

// Provider component
export const UserAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error", error);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Value provided to consuming components
  const value = {
    currentUser,
    loading,
  };

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

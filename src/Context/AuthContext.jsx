import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../data/firebase/firebaseConfig'; // Adjust this import to your Firebase configuration
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get the admin ID from the user's info
        setCurrentAdminId(user.uid); // Assuming the UID is the admin ID
      } else {
        // User is signed out
        setCurrentAdminId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email, password) => {
    // Implement your login logic here
    await auth.signInWithEmailAndPassword(email, password);
  };

  const logout = async () => {
    // Implement your logout logic here
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ currentAdminId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};

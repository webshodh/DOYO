import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../data/firebase/firebaseConfig'; // Adjust this import to your Firebase configuration
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../data/firebase/firebaseConfig'; // Make sure to import Firestore

const AuthContext = createContext();

// Define super admin email list
const SUPER_ADMIN_EMAILS = [
  "superadmin1@example.com",
  "superadmin2@example.com",
  "admin@company.com",
  // Add more super admin emails as needed
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userHotels, setUserHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // User is signed in
          setCurrentUser(user);
          setCurrentAdminId(user.uid);

          // Determine user role based on email
          const userEmail = user.email.toLowerCase();
          let role = 'user';
          let hotels = [];

          if (SUPER_ADMIN_EMAILS.includes(userEmail)) {
            // User is a super admin
            role = 'superadmin';
            // Super admins can access all hotels - you might want to fetch all hotels here
            hotels = await getAllHotels(); // Implement this function
          } else {
            // Check if user is a hotel admin by looking up in Firestore
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              role = 'admin';
              hotels = adminData.assignedHotels || [];
            }
          }

          setUserRole(role);
          setUserHotels(hotels);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
          setCurrentAdminId(null);
          setUserRole(null);
          setUserHotels([]);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setCurrentAdminId(null);
        setUserRole(null);
        setUserHotels([]);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Helper function to get all hotels (for super admin)
  const getAllHotels = async () => {
    try {
      // Implement this based on your Firestore structure
      // This is just an example - adjust according to your data structure
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      return hotelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return [];
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear all state
      setCurrentUser(null);
      setCurrentAdminId(null);
      setUserRole(null);
      setUserHotels([]);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Helper functions to check user roles
  const isSuperAdmin = () => {
    return userRole === 'superadmin';
  };

  const isAdmin = () => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  const canAccessHotel = (hotelId) => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'admin') {
      return userHotels.some(hotel => hotel.id === hotelId || hotel === hotelId);
    }
    return false;
  };

  // Function to create hotel and admin (super admin only)
  const createHotelWithAdmin = async (hotelData, adminData) => {
    if (!isSuperAdmin()) {
      throw new Error('Only super admins can create hotels and admins');
    }

    try {
      // 1. Create the hotel in Firestore
      const hotelRef = await addDoc(collection(db, 'hotels'), {
        name: hotelData.name,
        address: hotelData.address,
        phone: hotelData.phone,
        createdAt: new Date(),
        createdBy: currentAdminId,
      });

      // 2. Create admin user with Firebase Auth
      const adminUserCredential = await createUserWithEmailAndPassword(
        auth, 
        adminData.email, 
        adminData.password
      );

      // 3. Store admin details in Firestore
      await setDoc(doc(db, 'admins', adminUserCredential.user.uid), {
        name: adminData.name,
        email: adminData.email,
        role: 'admin',
        assignedHotels: [hotelRef.id],
        createdAt: new Date(),
        createdBy: currentAdminId,
      });

      return {
        hotel: { id: hotelRef.id, ...hotelData },
        admin: { id: adminUserCredential.user.uid, ...adminData }
      };
    } catch (error) {
      console.error('Error creating hotel and admin:', error);
      throw error;
    }
  };

  // Function to assign hotel to admin (super admin only)
  const assignHotelToAdmin = async (adminId, hotelId) => {
    if (!isSuperAdmin()) {
      throw new Error('Only super admins can assign hotels to admins');
    }

    try {
      const adminRef = doc(db, 'admins', adminId);
      const adminDoc = await getDoc(adminRef);
      
      if (adminDoc.exists()) {
        const currentHotels = adminDoc.data().assignedHotels || [];
        if (!currentHotels.includes(hotelId)) {
          await updateDoc(adminRef, {
            assignedHotels: [...currentHotels, hotelId]
          });
        }
      }
    } catch (error) {
      console.error('Error assigning hotel to admin:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    currentAdminId,
    userRole,
    userHotels,
    loading,
    login,
    logout,
    isSuperAdmin,
    isAdmin,
    canAccessHotel,
    createHotelWithAdmin,
    assignHotelToAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
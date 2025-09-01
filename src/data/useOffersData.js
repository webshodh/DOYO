import { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig';
import { onValue, ref } from 'firebase/database';
import { getAuth } from "firebase/auth";

const useOffersData = (hotelName) => {
  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  useEffect(() => {
    const offersRef = ref(db, `/hotels/${hotelName}/offers/`);
    
    const unsubscribe = onValue(offersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const offersArray = data ? Object.values(data) : [];
        setOffersData(offersArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hotelName]);

  console.log("offersDataoffersData", offersData);
  
  const totalOffers = offersData.length;
  const activeOffers = offersData.filter(offer => offer.isActive && !offer.isExpired).length;
  const expiredOffers = offersData.filter(offer => offer.isExpired).length;
  
  // Get unique offer types for filtering
  const offerTypes = [...new Set(offersData.map(offer => offer.offerType))];

  return { 
    offersData, 
    totalOffers, 
    activeOffers, 
    expiredOffers, 
    offerTypes,
    loading, 
    error 
  };
};

export default useOffersData;
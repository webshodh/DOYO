import { useState, useEffect } from 'react';
import { db, ref, push, set } from './firebase/firebaseConfig';
import { onValue } from 'firebase/database';

const useHotelsData = (adminId, adminName) => {
  const [hotelsData, setHotelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!adminId) return;  // Ensure adminId is defined
    const hotelsRef = ref(db, `/admins/${adminId}/hotels`);
    const unsubscribe = onValue(hotelsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const hotelsArray = data ? Object.entries(data).map(([id, details]) => ({ id, ...details })) : [];
        setHotelsData(hotelsArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [adminId]);

  const addHotel = async (hotelDetails) => {
    if (!adminId || !adminName) return;  // Ensure adminId and adminName are defined

    // Generate a unique hotel name based on admin name or other criteria
    const generatedHotelName = `${adminName}-${Date.now()}`;

    const newHotelRef = push(ref(db, `/admins/${adminId}/hotels`));
    const hotelData = { hotelName: generatedHotelName, ...hotelDetails };

    await set(newHotelRef, hotelData);
  };

  return { hotelsData, addHotel, loading, error };
};

export default useHotelsData;

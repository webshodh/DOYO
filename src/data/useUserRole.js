import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../data/firebase/firebaseConfig"; // Adjust the path as necessary
import { ref, get } from "firebase/database";

const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;

      if (user) {
        // First, check the 'users' collection
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          // Set the user role from the 'users' collection
          setUserRole(userSnapshot.val().role);
        } else {
          // If user is not found in 'users', check the 'admins' collection
          const adminRef = ref(db, `admins/${user.uid}`);
          const adminSnapshot = await get(adminRef);

          if (adminSnapshot.exists()) {
            // Set the user role from the 'admins' collection
            setUserRole(adminSnapshot.val().role);
          }
        }
      }
    };

    fetchUserRole();
  }, [auth]);

  return userRole;
};

export default useUserRole;

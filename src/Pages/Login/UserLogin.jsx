import React, { useContext, useState, useEffect } from 'react';
import { db } from '../../data/firebase/firebaseConfig';
import { ref, set, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';

const UserLogin = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();
  const hotelName = "Mauli";
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      navigate(`/viewMenu/${hotelName}/home`);
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!name || !mobile) {
      alert('Please enter both name and mobile number');
      return;
    }

    const userId = mobile;
    const userRef = ref(db, `/hotels/users/${userId}`);
    const currentDate = new Date().toISOString();

    try {
      const snapshot = await get(userRef);
      const userExists = snapshot.exists();

      const userData = {
        name: name,
        mobile: mobile,
        userLastLoginDate: currentDate,
      };

      if (!userExists) {
        userData.userCreatedDate = currentDate;
      }

      await set(userRef, userData);

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      navigate(`/viewMenu/${hotelName}/home`);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form 
        onSubmit={handleLogin} 
        className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back!
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="mobile">
            Mobile Number
          </label>
          <input
            type="text"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your mobile number"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition duration-300 mb-4"
        >
          Login
        </button>
       
      </form>
    </div>
  );
};

export default UserLogin;

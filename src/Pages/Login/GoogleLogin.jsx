import React, { useState, useEffect } from "react";
import { auth, googleProvider, signInWithPopup, OAuthProvider } from "../../data/firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { colors } from "../../theme/theme";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GoogleLogin = () => {
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 1];
    setHotelName(hotelNameFromPath);
  }, []);

  const navigate = useNavigate();

  const handleLoginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in with Google!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      navigate(`/viewMenu/${hotelName}/home`);
    } catch (error) {
      console.error("Error during signInWithPopup", error);
    }
  };

  const handleLoginWithApple = async () => {
    try {
      const appleProvider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, appleProvider);
      toast.success("Successfully logged in with Apple!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      navigate(`/viewMenu/${hotelName}/home`);
    } catch (error) {
      console.error("Error during signInWithApple", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-500 p-6 text-center">
      <div className="text-white max-w-md w-full">
        <img src="/logo.png" alt="Logo" className="w-80 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Welcome to {hotelName}!</h1>
        <p className="text-xl mb-6">Your favorite dishes are just a click away</p>
        <div className="flex flex-col gap-4 items-center">
          <button
            className="flex items-center justify-center px-6 py-3 text-lg font-medium bg-white text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
            onClick={handleLoginWithGoogle}
          >
            <FcGoogle className="mr-2" size={24} />
            Sign in with Google
          </button>
          <button
            className="flex items-center justify-center px-6 py-3 text-lg font-medium bg-black text-white rounded-lg shadow-md hover:bg-gray-800 transition-transform transform hover:scale-105"
            onClick={handleLoginWithApple}
          >
            <FaApple className="mr-2" size={24} />
            Sign in with Apple
          </button>
        </div>
      </div>
      {/* Toast Notification */}
      <ToastContainer />
    </div>
  );
};

export default GoogleLogin;

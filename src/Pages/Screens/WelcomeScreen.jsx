import React from "react";
import { colors } from "../../theme/theme";

const WelcomeScreen = () => {
  return (
    <div
      className="flex items-center justify-center bg-orange-500 min-h-screen p-6"
      style={{ backgroundColor: colors.Orange }}
    >
      <div className="text-center text-white max-w-lg w-full">
        <img src="/logo.png" alt="Logo" className="w-80 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
        <p className="text-lg">
          We're thrilled to have you here. Start exploring our menu and enjoy
          your meal!
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;

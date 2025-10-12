// WelcomeSection.jsx
import React, { memo } from "react";

const WelcomeSection = memo(({ firstName = "User" }) => (
  <div className="mb-8">
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
      <h2 className="text-xl font-bold mb-2">Welcome back, {firstName}!</h2>
      <p className="text-blue-100">
        Manage your restaurant orders and track their status efficiently.
      </p>
    </div>
  </div>
));

WelcomeSection.displayName = "WelcomeSection";

export default WelcomeSection;

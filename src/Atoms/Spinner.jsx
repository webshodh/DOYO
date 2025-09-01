// Spinner.js
import React from "react";
import { colors } from "theme/theme";

const Spinner = ({ text }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div
      style={{ borderColor: colors.Orange }}
      className="w-12 h-12 border-4  border-t-4 border-gray-200 rounded-full animate-spin"
      role="status"
    >
      <span className="sr-only">{text ? text : "Loading..."}</span>
    </div>
  </div>
);

export default Spinner;

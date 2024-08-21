// Spinner.js
import React from 'react';

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div
      className="w-12 h-12 border-4 border-t-orange-500 border-t-4 border-gray-200 rounded-full animate-spin"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

export default Spinner;

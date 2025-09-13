import React from "react";

const ErrorMessage = ({ message }) => {
  if (!message) return null; // Don't render if no error message

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-red-600 font-semibold">
        ⚠️ Error: {message}
      </div>
    </div>
  );
};

export default ErrorMessage;

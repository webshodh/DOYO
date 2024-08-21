import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const NotAuthorized = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg border border-red-300">
          <h4 className="text-xl font-semibold">Access Denied</h4>
          <p className="mt-2 text-base">
            You do not have permission to view this page.
          </p>
          <hr className="my-4 border-red-300" />
          <p className="text-sm text-gray-600">
            Please contact your administrator if you believe this is a mistake.
          </p>
        </div>
        <Link to="/">
          <Button
            variant="primary"
            className="mt-6 px-6 py-3 bg-blue-500 text-white border border-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotAuthorized;

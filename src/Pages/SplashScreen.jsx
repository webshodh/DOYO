import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelSelection } from "../Context/HotelSelectionContext";
import { toast } from "react-toastify";
import { Spinner } from "Atoms";

const HotelSplashScreen = () => {
  const navigate = useNavigate();
  const { availableHotels, loading, selectHotel } = useHotelSelection();
  const [selectedHotelId, setSelectedHotelId] = useState("");

  useEffect(() => {
    let timer;

    if (!loading) {
      timer = setTimeout(() => {
        if (availableHotels.length === 0) {
          toast.error(
            "No hotels assigned to your account. Please contact administrator."
          );
        }
      }, 2000); // 2 second delay
    }

    return () => clearTimeout(timer); // cleanup on unmount
  }, [availableHotels, loading, navigate]);

  const handleHotelSelect = (hotelId) => {
    setSelectedHotelId(hotelId);
  };

  const handleProceed = () => {
    if (!selectedHotelId) {
      toast.error("Please select a hotel to proceed.");
      return;
    }

    const selectedHotelData = availableHotels.find(
      (hotel) => hotel.id === selectedHotelId
    );
    if (selectedHotelData) {
      selectHotel(selectedHotelData);
      navigate(`/${selectedHotelId}/admin/dashboard`);
    }
  };

  if (loading) {
    <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
          <h1 className="text-3xl font-bold text-white text-center">
            Select Your Hotel
          </h1>
          <p className="text-orange-100 text-center mt-2">
            Choose which hotel you'd like to manage today
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {availableHotels.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Hotels Available
              </h3>
              <p className="text-gray-500">
                You don't have access to any hotels yet. Please contact your
                administrator.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {availableHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className={`relative cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                      selectedHotelId === hotel.id
                        ? "ring-4 ring-orange-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleHotelSelect(hotel.id)}
                  >
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                      {selectedHotelId === hotel.id && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}

                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {hotel.name}
                      </h3>

                      <p className="text-sm text-gray-500 mb-4">
                        Click to select this hotel
                      </p>

                      <div
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          selectedHotelId === hotel.id
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedHotelId === hotel.id ? "Selected" : "Select"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proceed Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleProceed}
                  disabled={!selectedHotelId}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    selectedHotelId
                      ? "bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Proceed to Dashboard
                  <svg
                    className="w-5 h-5 ml-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSplashScreen;

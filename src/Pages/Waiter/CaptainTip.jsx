import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { CaptainCard, Navbar } from "../../components";
import { useNavigate } from "react-router-dom";
import { db } from "../../data/firebase/firebaseConfig";
import Footer from "Atoms/Footer";

const CaptainTip = () => {
  const [staff, setStaff] = useState([]);
  const [selectedCaptain, setSelectedCaptain] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const hotelName = "Atithi";
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const staffRef = ref(db, `/hotels/${hotelName}/staff/`);
    const unsubscribe = onValue(staffRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const staffArray = Object.values(data);
        setStaff(staffArray);
      } else {
        setStaff([]); // Clear staff if none exist
      }
    });

    return () => unsubscribe();
  }, [hotelName, currentAdminId]);

  const staffDetails = staff.map((staff) => {
    const { firstName, lastName, upiId, imageUrl } = staff;
    const fullName = `${firstName} ${lastName}`;
    return { fullName, upiId, imageUrl };
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNext = () => {
    if (selectedCaptain) {
      navigate("/Atithi/orders/captain-feedback", {
        state: { selectedCaptain },
      });
    } else {
      alert("Please select a captain before proceeding.");
    }
  };

  const filteredStaff = staffDetails.filter((staff) =>
    staff.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar
        title={`${hotelName}`}
        className="fixed top-0 w-full z-50 bg-white shadow-md"
      />
      <main className="flex-grow mt-16 mb-20 p-4">
        <div className="text-center w-full max-w-4xl mx-auto">
          <div >
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Leave a Tip for Our Captain!
            </h1>
            <p className="text-lg mb-6">Show your appreciation with a tip!</p>

            <div className="mb-6">
              <input
                type="text"
                id="searchCaptain"
                placeholder="Search Captain"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <h5 className="font-semibold mb-4">Select a Captain</h5>
              {filteredStaff.map((staff, index) => (
                <CaptainCard
                  key={index}
                  fullName={staff.fullName}
                  imageUrl={staff.imageUrl}
                  upiId={staff.upiId}
                  selectedCaptain={selectedCaptain}
                  setSelectedCaptain={setSelectedCaptain}
                  isSelected={
                    selectedCaptain.fullName === staff.fullName &&
                    selectedCaptain.upiId === staff.upiId
                  }
                />
              ))}
              {selectedCaptain.fullName && (
                <div className="mt-3 text-center">
                  <h6 className="text-lg font-medium">
                    Selected Captain: {selectedCaptain.fullName}
                  </h6>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className="mt-6 w-full py-3 rounded-full bg-orange-500 text-white text-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </main>
      <Footer className="fixed bottom-0 w-full bg-white shadow-md" />
    </div>
  );
};

export default CaptainTip;

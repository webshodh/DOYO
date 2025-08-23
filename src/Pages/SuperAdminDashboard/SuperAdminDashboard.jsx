import React, { useEffect, useState } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref, remove } from "firebase/database";
import "../../styles/SuperAdminDashboard.css";

import useData from "../../data/useData";
import { PageTitle } from "../../Atoms";
import AddHotelWithAdmins from "./AddHotel";
const SuperAdminDashboard = () => {
  const [hotelCount, setHotelCount] = useState(0);
  const [hotelCountsByState, setHotelCountsByState] = useState({});
  const [hotelCountsByDistrict, setHotelCountsByDistrict] = useState({});
  const [hotels, setHotels] = useState([]);
  const { data, loading, error } = useData("/");
  console.log("data", data);

  useEffect(() => {
    const hotelsRef = ref(db, "/");
    onValue(hotelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setHotelCount(Object.keys(data).length);
        setHotels(Object.values(data));
      }
    });
  }, []);

  useEffect(() => {
    const hotelsRef = ref(db, "/");
    onValue(hotelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const countsByState = {};
        const countsByDistrict = {};

        Object.values(data).forEach((hotel) => {
          const state = hotel.state || "Unknown State";
          const district = hotel.district || "Unknown District";

          countsByState[state] = (countsByState[state] || 0) + 1;
          countsByDistrict[district] = (countsByDistrict[district] || 0) + 1;
        });

        setHotelCountsByState(countsByState);
        setHotelCountsByDistrict(countsByDistrict);
      }
    });
  }, []);

  return (
    <>
      <div>
        {/* Page Title and Filter */}
        <PageTitle pageTitle={"Super Admin Dashboard"} />

        <AddHotelWithAdmins />
      </div>
    </>
  );
};

export default SuperAdminDashboard;

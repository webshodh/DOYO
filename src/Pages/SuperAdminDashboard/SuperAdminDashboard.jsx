import React, { useEffect, useState } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref, remove } from "firebase/database";
import "../../styles/SuperAdminDashboard.css";
import { CountCard, DynamicTable, Tab } from "../../components";
import { HotelsListColumn } from "../../data/Columns";
import useData from "../../data/useData";
import { PageTitle } from "../../Atoms";
const SuperAdminDashboard = () => {
  const [hotelCount, setHotelCount] = useState(0);
  const [hotelCountsByState, setHotelCountsByState] = useState({});
  const [hotelCountsByDistrict, setHotelCountsByDistrict] = useState({});
  const [hotels, setHotels] = useState([]);
  const { data, loading, error } = useData("/");
  console.log("data", data)

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

  const handleDeleteHotel = (hotelName) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      remove(ref(db, `/${hotelName}`));
    }
  };
  const tabs = [
    { label: "Daily", content: "Daily" },
    { label: "Weekly", content: "Weekly" },
    { label: "Monthly", content: "Monthly" },
  ];

  const Hotelstabs = [
    { label: "All (230)", content: "" },
    { label: "Hotels (50)", content: "" },
    { label: "Restaurant (35)", content: "" },
    { label: "Bar (25)", content: "" },
    { label: "Cafe (120)", content: "" },
  ];

  const HotelColumns = HotelsListColumn;

  return (
    <>
      <div>
        {/* Page Title and Filter */}
        <div
          className="d-flex justify-content-between"
          style={{ marginTop: "70px" }}
        >
          <PageTitle pageTitle={"Super Admin Dashboard"} />
          <Tab tabs={tabs} />
        </div>

        {/* Count Card for Orders & Customers */}

        <Tab tabs={Hotelstabs} />

        <div className="container">
          <div className="row" style={{ marginLeft: "-40px" }}>
            {/* Main content area */}
            <div className="col-md-12">
              {/* Total */}
              <div className="row background-card">
                <PageTitle pageTitle={"Total"} />
                <div className="col-md-3 mb-3">
                  <CountCard
                    icon="bi-exclamation-circle-fill"
                    iconColor="red"
                    count={"50"}
                    label={"Hotels"}
                    type="primary"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <CountCard
                    icon="bi-check-circle"
                    iconColor="orange"
                    count={"35"}
                    label={"Restaurant"}
                    type="primary"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <CountCard
                    icon="bi-check-circle-fill"
                    iconColor="#00C000"
                    count={"25"}
                    label={"Bar"}
                    type="primary"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <CountCard
                    icon="bi-x-circle-fill"
                    iconColor="red"
                    count={"120"}
                    label={"Cafe"}
                    type="primary"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-3">
                  {/* Locations */}
                  <div className="row background-card">
                    <PageTitle pageTitle="Menu" />
                    <div className="d-flex justify-content-between">
                      <div
                        className="col-md-0 mb-6"
                        style={{
                          marginLeft: "-10px",
                          marginBottom: "50px",
                        }}
                      >
                        <CountCard
                          src="/serving.png"
                          iconColor="orange"
                          count={"10"}
                          label="Total Menu's"
                          type="primary"
                          width="50px"
                          height="50px"
                          marginTop="10px"
                          marginLeft="0px"
                        />
                        <PageTitle pageTitle={"Category"} />
                        <CountCard
                          src="/tag.png"
                          iconColor="red"
                          count={"15"}
                          label="Total Categories"
                          type="primary"
                          width="50px"
                          height="50px"
                          marginTop="5px"
                          marginLeft="0px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="row d-flex">
                    {/* Locations */}
                    <div className="background-card">
                      <PageTitle pageTitle={"Locations"} />
                      <div className="d-flex justify-content-between">
                        <div className="col-md-4 mb-1">
                          <CountCard
                            icon="bi-person-fill-add"
                            iconColor=""
                            count={"10"}
                            label={"Contries"}
                            type="primary"
                          />
                        </div>
                        <div className="col-md-4 mb-1">
                          <CountCard
                            icon="bi-person-fill-up"
                            iconColor="#00C000"
                            count={"15"}
                            label={"States"}
                            type="primary"
                          />
                        </div>
                        <div className="col-md-4 mb-1">
                          <CountCard
                            icon="bi-person-heart"
                            iconColor="red"
                            count={"30"}
                            label={"Districts"}
                            type="primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row d-flex">
                    <div className="background-card">
                      <PageTitle pageTitle={"Revenue"} />
                      <div className="d-flex justify-content-between">
                        <div className="col-md-4 mb-1">
                          <CountCard
                            icon="bi-currency-rupee"
                            iconColor="#00C000"
                            count={"10"}
                            label={"Total Revenue"}
                            type="primary"
                          />
                        </div>
                        <div className="col-md-4 mb-1">
                          <CountCard
                            icon="fa-list"
                            count={0}
                            label={"Avg Revenue/Day"}
                            type="primary"
                          />
                        </div>
                        <div className="col-md-4 mb-1">
                          <CountCard
                            icon="fa-list"
                            count={0}
                            label={"Avg Revenue/Day"}
                            type="primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DynamicTable
            columns={HotelColumns}
            data={hotels}
            //  onEdit={handleShow}
            onDelete={handleDeleteHotel}
            //  action={actions}
          />
        </div>
      </div>

      {/* <ToastContainer /> */}
    </>
  );
};

export default SuperAdminDashboard;

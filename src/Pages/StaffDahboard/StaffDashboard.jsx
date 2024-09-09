import React from "react";
import AddStaff from "./AddStaff";
import AddRole from "./AddRole";
import TabButtons from "components/TabButtons";

const StaffDashboard = () => {
  const tabs = [
    { label: "Add Role", content: <AddRole /> },
    { label: "Add Staff", content: <AddStaff /> },
  ];
  return (
    <>
    <div style={{marginTop:'70px'}}><TabButtons tabs={tabs} /></div>
      
    </>
  );
};

export default StaffDashboard;

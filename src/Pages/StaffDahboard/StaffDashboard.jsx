import React from "react";
import { PageTitle } from "../../Atoms";
import { Tab } from "../../components";
import AddStaff from "./AddStaff";
import AddRole from "./AddRole";
import ViewStaff from "./ViewStaff";
import TabButtons from "components/TabButtons";

const StaffDashboard = () => {
  const tabs = [
    { label: "Add Role", content: <AddRole /> },
    { label: "Add Staff", content: <AddStaff /> },
    // { label: "View Staff", content: <ViewStaff /> },
  ];
  return (
    <>
    <div style={{marginTop:'70px'}}><TabButtons tabs={tabs} /></div>
      
    </>
  );
};

export default StaffDashboard;

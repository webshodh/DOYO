import React from "react";
import AddSection from "./AddSections";
import AddTable from "./AddTable";
import ViewTable from "./ViewTable";
import TabButtons from "components/TabButtons";

const TableDashboard = () => {
  const tabs = [
    { label: "Add Sections", content: <AddSection /> },
    { label: "Add Table", content: <AddTable /> },
    // { label: "View Table", content: <ViewTable /> },
  ];
  return (
    <>
      <div style={{marginTop:'70px'}}><TabButtons tabs={tabs} width="70vw" /></div>
    </>
  );
};

export default TableDashboard;

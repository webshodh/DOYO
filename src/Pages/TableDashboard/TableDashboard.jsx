import React from "react";
import { PageTitle } from "../../Atoms";
import { Tab } from "../../components";
import ViewMenu from "../MenuDashboard/ViewMenu";
import AddSection from "./AddSections";
import AddTable  from "./AddTable";
import ViewTable from "./ViewTable";

const TableDashboard = () => {
  const tabs = [
    { label: "Add Sections", content: <AddSection /> },
    { label: "Add Table", content: <AddTable /> },
    { label: "View Table", content: <ViewTable /> },
  ];
  return (
    <>
      <div style={{ marginTop: "70px" }}>
        <PageTitle pageTitle={"Table Dashboard"} />
      </div>
      <Tab tabs={tabs} width='70vw'/>
    </>
  );
};

export default TableDashboard;

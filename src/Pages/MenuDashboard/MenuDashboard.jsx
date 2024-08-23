import React from "react";
import { PageTitle } from "../../Atoms";
import { Tab } from "../../components";
import AddMenu from "./AddMenu";
import ViewMenu from "./ViewMenu";
import AddCategory from "./AddCategory";
import AddMainCategory from "./AddMainCategory";

const MenuDashboard = () => {
  const tabs = [
    { label: "Add Category", content: <AddCategory /> },
    {label: "Add Special Category", content: <AddMainCategory />},
    { label: "Add Menu", content: <AddMenu /> },
    { label: "View Menu", content: <ViewMenu /> },
  ];
  return (
    <>
      <div style={{ marginTop: "70px" }}>
        <PageTitle pageTitle={"Menu Dashboard"} />
      </div>
      <Tab tabs={tabs} width='70vw'/>
    </>
  );
};

export default MenuDashboard;

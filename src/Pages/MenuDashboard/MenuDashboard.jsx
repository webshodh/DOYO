import React from "react";
import AddMenu from "./AddMenu";
import AddCategory from "./AddCategory";
import AddMainCategory from "./AddMainCategory";
import TabButtons from "components/TabButtons";

const MenuDashboard = () => {
  const tabs = [
    { label: "Add Category", content: <AddCategory /> },
    {label: "Add Special Category", content: <AddMainCategory />},
    { label: "Add Menu", content: <AddMenu /> },
  ];
  return (
    <>
    <div style={{marginTop:'70px'}}>
      <TabButtons tabs={tabs} width='70vw'/>
      </div>
    </>
  );
};

export default MenuDashboard;

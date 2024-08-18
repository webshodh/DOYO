import React from "react";
import { PageTitle } from "../../Atoms";
import { Tab } from "../../components";
import AddMenu from "./AddMenu";
import ViewMenu from "./ViewMenu";
import AddCategory from "./AddCategory";
import OrderForecasting from "./OrderForecasting";
import SalesForecasting from "./SalesForecasting";

const PredictionDashboard = () => {
  const tabs = [
    { label: "Orders Forecasting", content: <OrderForecasting /> },
    { label: "Sales Forecasting", content: <SalesForecasting /> },
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

export default PredictionDashboard;

import React from "react";
import { PageTitle } from "../../Atoms";
import { Tab } from "../../components";
import OrderForecasting from "./OrderForecasting";
import SalesForecasting from "./SalesForecasting";
import CustomerTrafficPrediction from "./CustomerTrafficPrediction"
import MenuItemPopularityPrediction from "./MenuItemPopularityPrediction"
import PeakHoursDaysPrediction from "./PeakHoursDaysPrediction"
import TabButtons from "components/TabButtons";
const PredictionDashboard = () => {
  const tabs = [
    { label: "Orders Forecasting", content: <OrderForecasting /> },
    { label: "Sales Forecasting", content: <SalesForecasting /> },
    { label: "Customer Traffic Prediction", content: <CustomerTrafficPrediction /> },
    { label: "Menu Item Popularity Prediction", content: <MenuItemPopularityPrediction /> },
    { label: "Peak Hours Days Prediction", content: <PeakHoursDaysPrediction /> },
    
  ];
  return (
    <>
      <TabButtons tabs={tabs} width='70vw'/>
    </>
  );
};

export default PredictionDashboard;

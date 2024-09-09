
import { AdminDashboard, CustomerDashboard, MenuDashboard, OrderDashboard, POS, StaffDashboard, TableDashboard } from 'Pages';
import React from 'react'
import PredictionDashboard from './AI Prediction/PredictionDashboard';
import { Tab } from 'components';

const Dashboard = () => {
    const tabs = [
        { label: "Admin Dashboard", content: <AdminDashboard /> },
        { label: "Order Dashboard", content: <OrderDashboard /> },
        { label: "POS", content: <POS /> },
        { label: "Table Dashboard", content: <TableDashboard /> },
        { label: "Prediction Dashboard", content: <PredictionDashboard /> },
        { label: "Menu Dashboard", content: <MenuDashboard /> },
        { label: "Customer Dashboard", content: <CustomerDashboard /> },
        { label: "Staff Dashboard", content: <StaffDashboard /> },
    
      ];
  return (
    <>
    <div className='mt-5'>
     {/* <Tab tabs={tabs} width="70vw" /> */}
     </div>
    </>
  )
}

export default Dashboard
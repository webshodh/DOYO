// Routes/PublicRoutes.jsx
import Home from "../Pages/User/Home";
import Offers from "../Pages/User/Offers";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="home" element={<Home />} />
      <Route path="offers" element={<Offers />} />
      <Route path="" element={<Navigate to="home" replace />} />
    </Routes>
  );
};

export default PublicRoutes;

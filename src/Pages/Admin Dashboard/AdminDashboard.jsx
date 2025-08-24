import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AdminDashboard.css";
import { useMenuData, useCategoriesData } from "../../data";

import { getAuth } from "firebase/auth";
import { useParams } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import Widget from "../../components/Cards/Widget";
import { MdBarChart } from "react-icons/md";
import { MenuDashboard } from "Pages";
import useMainCategoriesData from "data/useMainCategoriesData";

function AdminDashboard() {
  const [filterType, setFilterType] = useState("Daily");

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  const { hotelName } = useParams();

  const {
    menuData,
    totalMenus,
    loading: menuLoading,
    error: menuError,
  } = useMenuData(hotelName);

  const {
    categoriesData,
    totalCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesData(hotelName);

  const {
    mainCategoriesData,
    totalMainCategories,
    // loading: categoriesLoading,
    // error: categoriesError,
  } = useMainCategoriesData(hotelName);

  if (menuLoading || categoriesLoading) return <div>Loading...</div>;
  if (menuError || categoriesError)
    return <div>Error: {menuError?.message || categoriesError?.message}</div>;

  return (
    <div className="container mx-auto px-4">
      {/* Widgets Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Menus"}
          subtitle={totalMenus}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Total Categories"}
          subtitle={totalCategories}
        />
         <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Total Special Categories"}
          subtitle={totalMainCategories}
        />
      </div>
      <MenuDashboard />

      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;

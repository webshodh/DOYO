import React from "react";
import useData from "../../data/useData";
import { PageTitle } from "../../Atoms";
import { DynamicTable } from "../../components";
import { adminsListColumn } from "../../data/Columns";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, update, get } from "firebase/database";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toast notifications
import { useHotelContext } from "../../Context/HotelContext";

const AdminsList = () => {
  const { data, loading, error } = useData("/admins/");
  const { hotelName } = useHotelContext();

  // Convert data to an array and add serial numbers
  const adminsDataArray = Object.entries(data).map(([id, admin], index) => ({
    srNo: index + 1, // Serial number (1-based index)
    id, // Add the admin ID
    ...admin,
  }));

  console.log("datadatadata", adminsDataArray);

  // Function to toggle the role between Super Admin and Admin
  const onToggleRole = async (item) => {
    const { id } = item; // Extract ID from item
    const itemRef = ref(db, `admins/${id}`);

    try {
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        const currentRole = snapshot.val().role;
        const newRole = currentRole === "Super Admin" ? "Admin" : "Super Admin";

        await update(itemRef, { role: newRole });
        toast.success(`User role updated to ${newRole} successfully.`);
      } else {
        toast.error("No data available for this user.");
      }
    } catch (error) {
      console.error("Error updating user role:", error); // Debug log
      toast.error("Error updating user role: " + error.message);
    }
  };

  const actions = [
    { label: 'Toggle Role', variant: 'primary', handler: onToggleRole }
  ];

  const columns = adminsListColumn;

  return (
    <>
      <div style={{ marginTop: "70px" }}>
        <PageTitle pageTitle={"Admin List"} />
        <DynamicTable
          columns={columns}
          data={adminsDataArray}
          onEdit={null}
          onDelete={null}
          actions={actions}
        />
        <ToastContainer />
      </div>
    </>
  );
};

export default AdminsList;

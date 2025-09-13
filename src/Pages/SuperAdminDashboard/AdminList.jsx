import React, { useState } from "react";
import useData from "../../data/useData";
import { PageTitle } from "../../atoms";
import { DynamicTable } from "../../components";
import { adminsListColumn } from "../../Constants/Columns";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, update, get, remove } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import AdminEditForm from "./AdminEditForm"; // Import the separate component
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { Spinner } from "react-bootstrap";

const AdminList = () => {
  const { data, loading, error, refetch } = useData("/admins/");
  console.log("adminData_______", data);
  const { hotelName } = useParams();
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Convert data to an array and add serial numbers + process hotel names
  const adminsDataArray = Object.entries(data || {}).map(
    ([id, admin], index) => ({
      srNo: index + 1,
      id,
      ...admin,
      // Process hotels to create a readable string
      hotelNames: admin.hotels
        ? Object.keys(admin.hotels).join(", ")
        : "No hotels assigned",
      // Ensure displayName shows properly
      displayName: admin.displayName || admin.name || "",
      // Handle contact/phone field
      contact: admin.contact || admin.phone || "",
    })
  );

  console.log("Admin data array:", adminsDataArray);

  // Function to toggle the role between Super Admin and Admin
  const onToggleRole = async (item) => {
    const { id } = item;
    const itemRef = ref(db, `admins/${id}`);

    try {
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentRole = currentData.role;
        const newRole = currentRole === "Super Admin" ? "admin" : "Super Admin";

        // Update only the role field, preserve everything else
        await update(itemRef, {
          role: newRole,
          updatedAt: new Date().toISOString(),
        });

        toast.success(`User role updated to ${newRole} successfully.`);

        // Refresh data after update
        if (refetch) {
          refetch();
        }
      } else {
        toast.error("No data available for this user.");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Error updating user role: " + error.message);
    }
  };

  // Function to handle edit action
  const onEdit = (item) => {
    console.log("Opening edit form for admin:", item);
    setEditingAdmin(item);
  };

  // Function to handle successful edit
  const onEditSuccess = () => {
    console.log("Edit successful, refreshing data...");
    setEditingAdmin(null);

    // Refresh data after successful update
    if (refetch) {
      refetch();
    }
  };

  // Function to handle delete action
  const onDelete = async (item) => {
    const { id, name, displayName } = item;
    const adminName = displayName || name || "this admin";

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${adminName}? This action cannot be undone.`
    );

    if (confirmDelete) {
      const itemRef = ref(db, `admins/${id}`);

      try {
        await remove(itemRef);
        toast.success(`${adminName} deleted successfully!`);

        // Refresh data after deletion
        if (refetch) {
          refetch();
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
        toast.error("Error deleting admin: " + error.message);
      }
    }
  };

  const actions = [
    { label: "Toggle Role", variant: "primary", handler: onToggleRole },
  ];

  const columns = adminsListColumn;

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <>
      <div style={{ margin: "20px" }}>
        <PageTitle pageTitle={"Admin List"} />
        <DynamicTable
          columns={columns}
          data={adminsDataArray}
          onEdit={onEdit}
          onDelete={onDelete}
          actions={actions}
        />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* Edit Form Modal */}
        {editingAdmin && (
          <AdminEditForm
            admin={editingAdmin}
            onClose={() => setEditingAdmin(null)}
            onSuccess={onEditSuccess}
          />
        )}
      </div>
    </>
  );
};

export default AdminList;

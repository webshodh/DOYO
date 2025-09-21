import React, { useState, useMemo } from "react";
import useData from "../../data/useData";
import { PageTitle } from "../../atoms";
import { DynamicTable } from "../../components";
import { adminsListColumn } from "../../Constants/Columns";
import { db } from "../../services/firebase/firebaseConfig";
import { ref, update, get, remove } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import AdminEditForm from "./AdminEditForm";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { Spinner } from "react-bootstrap";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Plus,
  Activity,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import StatCard from "components/Cards/StatCard";

const AdminList = () => {
  const { data, loading, error, refetch } = useData("/admins/");
  console.log("adminData_______", data);
  const { hotelName } = useParams();
  const navigate = useNavigate();

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  // Convert data to an array and add serial numbers + process admin data
  const adminsDataArray = useMemo(() => {
    return Object.entries(data || {}).map(([id, admin], index) => ({
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
      // Normalize role field
      role: admin.role || "admin",
      // Add status field if not exists
      status: admin.status !== false ? "Active" : "Inactive",
      // Format creation date
      createdDate: admin.createdAt
        ? new Date(admin.createdAt).toLocaleDateString()
        : "N/A",
      // Email field
      email: admin.email || "N/A",
    }));
  }, [data]);

  // Get unique roles for filter
  const roles = useMemo(() => {
    const uniqueRoles = [
      ...new Set(adminsDataArray.map((admin) => admin.role).filter(Boolean)),
    ];
    return uniqueRoles;
  }, [adminsDataArray]);

  // Calculate admin statistics
  const adminStats = useMemo(() => {
    const total = adminsDataArray.length;
    const active = adminsDataArray.filter(
      (admin) => admin.status === "Active"
    ).length;
    const inactive = total - active;
    const superAdmins = adminsDataArray.filter(
      (admin) => admin.role === "Super Admin"
    ).length;
    const regularAdmins = adminsDataArray.filter(
      (admin) => admin.role === "admin"
    ).length;

    return {
      total,
      active,
      inactive,
      superAdmins,
      regularAdmins,
    };
  }, [adminsDataArray]);

  // Filter admins based on search term and filters
  const filteredAdmins = useMemo(() => {
    return adminsDataArray.filter((admin) => {
      // Text search filter
      const matchesSearch =
        !searchTerm ||
        [
          admin.displayName,
          admin.name,
          admin.email,
          admin.contact,
          admin.hotelNames,
        ].some(
          (field) =>
            field && field.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Role filter
      const matchesRole = roleFilter === "all" || admin.role === roleFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && admin.status === "Active") ||
        (statusFilter === "inactive" && admin.status === "Inactive");

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [adminsDataArray, searchTerm, roleFilter, statusFilter]);

  const adminCount = filteredAdmins.length;
  const hasAdmins = adminsDataArray.length > 0;
  const hasSearchResults = filteredAdmins.length > 0;

  console.log("Admin data array:", adminsDataArray);

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle add button click
  const handleAddClick = () => {
    navigate("/super-admin/add-admin");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  // Function to toggle the role between Super Admin and Admin
  const onToggleRole = async (item) => {
    const { id, displayName, name } = item;
    const adminName = displayName || name || "Admin";
    const itemRef = ref(db, `admins/${id}`);
    setSubmitting(true);

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

        toast.success(`${adminName} role updated to ${newRole} successfully.`);

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
    } finally {
      setSubmitting(false);
    }
  };

  // Function to toggle admin status
  const onToggleStatus = async (item) => {
    const { id, displayName, name } = item;
    const adminName = displayName || name || "Admin";
    const itemRef = ref(db, `admins/${id}`);
    setSubmitting(true);

    try {
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentStatus = currentData.status !== false;
        const newStatus = !currentStatus;

        await update(itemRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });

        const statusText = newStatus ? "activated" : "deactivated";
        toast.success(`${adminName} ${statusText} successfully.`);

        if (refetch) {
          refetch();
        }
      } else {
        toast.error("No data available for this admin.");
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Error updating admin status: " + error.message);
    } finally {
      setSubmitting(false);
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
      setSubmitting(true);

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
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Function to view admin details
  const onViewDetails = (item) => {
    console.log("Viewing details for admin:", item);
    toast.info(`Viewing details for ${item.displayName || item.name}`);
  };

  const actions = [
    { label: "Toggle Role", variant: "primary", handler: onToggleRole },
    { label: "Toggle Status", variant: "success", handler: onToggleStatus },
    { label: "View Details", variant: "info", handler: onViewDetails },
  ];

  const columns = adminsListColumn;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Admin Edit Form Modal */}
        {editingAdmin && (
          <AdminEditForm
            admin={editingAdmin}
            onClose={() => setEditingAdmin(null)}
            onSuccess={onEditSuccess}
            submitting={submitting}
          />
        )}

        {/* Header with actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <PageTitle
              pageTitle="Admin Management"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description="Manage system administrators and their permissions"
            />

            {/* Result count */}
            {hasAdmins && (
              <div className="text-sm text-gray-600 mt-1">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? `Showing ${adminCount} of ${adminStats.total} admins`
                  : `Total: ${adminStats.total} admins`}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {hasAdmins && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              title="Total Admins"
              value={adminStats.total}
              color="blue"
              loading={loading}
            />
            <StatCard
              icon={Activity}
              title="Active Admins"
              value={adminStats.active}
              color="green"
              subtitle={`${Math.round(
                (adminStats.active / adminStats.total) * 100
              )}% active`}
              loading={loading}
            />
            <StatCard
              icon={Shield}
              title="Super Admins"
              value={adminStats.superAdmins}
              color="purple"
              loading={loading}
            />
            <StatCard
              icon={AlertTriangle}
              title="Inactive Admins"
              value={adminStats.inactive}
              color="red"
              loading={loading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search admins by name, email, or assigned hotels..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {roles.length > 0 && (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              )}

              {/* <button
                onClick={handleAddClick}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Add Admin
              </button> */}
            </div>
          </div>

          {/* Filter summary */}
          {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {adminCount} result{adminCount !== 1 ? "s" : ""}
              </span>
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasAdmins ? (
            <>
              {hasSearchResults ? (
                <DynamicTable
                  columns={columns}
                  data={filteredAdmins}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  actions={actions}
                  loading={submitting}
                  emptyMessage="No admins match your search criteria"
                  showPagination={true}
                  initialRowsPerPage={10}
                  sortable={true}
                  searchable={false}
                  exportable={true}
                  refreshable={true}
                />
              ) : (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                    No admins found
                  </h5>
                  <p className="text-gray-600 mb-4">
                    No admins match your search "{searchTerm}"
                  </p>
                  <button
                    onClick={() => handleSearchChange("")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h5 className="text-lg font-medium text-gray-900 mb-2">
                No Admins Found
              </h5>
              <p className="text-gray-600 mb-6">
                Get started by adding your first admin to the system
              </p>
              <button
                onClick={handleAddClick}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <Plus size={20} />
                Add Your First Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
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
        theme="light"
      />
    </div>
  );
};

export default AdminList;

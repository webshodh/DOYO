// src/Pages/SuperAdmin/AdminList.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Download,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";

// ✅ NEW: Import Firestore-based hooks and contexts
import { useAuth } from "../../context/AuthContext";
import { useSuperAdmin } from "../../hooks/useSuperAdmin";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";

import { PageTitle } from "../../atoms";
import { DynamicTable } from "../../components";
import { adminsListColumn } from "../../Constants/Columns";
import AdminEditForm from "./AdminEditForm";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import StatCard from "components/Cards/StatCard";

const AdminList = () => {
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isSuperAdmin } = useAuth();
  const { hasPermissions } = useSuperAdmin();

  // ✅ ENHANCED: Use Firestore collection hook
  const {
    documents: admins,
    loading,
    error,
    connectionStatus,
    lastFetch,
    retryCount,
    refresh: refetchAdmins,
    isRetrying,
    canRetry,
  } = useFirestoreCollection("admins", {
    orderBy: [["createdAt", "desc"]],
    realtime: true,
    enableRetry: true,
  });

  // State management
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("adminData_______", admins);

  // ✅ NEW: Permission check
  const hasPermission = useMemo(() => {
    return isSuperAdmin() && hasPermissions;
  }, [isSuperAdmin, hasPermissions]);

  // ✅ ENHANCED: Process and filter admin data
  const processedAdmins = useMemo(() => {
    if (!admins || admins.length === 0) return [];

    let filtered = admins.map((admin, index) => ({
      srNo: index + 1,
      id: admin.id,
      ...admin,
      // Process hotels to create a readable string
      hotelNames:
        admin.managedHotels?.length > 0
          ? admin.managedHotels.join(", ")
          : admin.hotels
          ? Object.keys(admin.hotels).join(", ")
          : "No hotels assigned",
      // Ensure displayName shows properly
      displayName:
        admin.displayName ||
        admin.name ||
        `${admin.firstName || ""} ${admin.lastName || ""}`.trim(),
      // Handle contact/phone field
      contact: admin.phone || admin.contact || "",
      // Format dates
      createdDate: admin.createdAt?.toDate
        ? admin.createdAt.toDate().toLocaleDateString()
        : new Date(admin.createdAt).toLocaleDateString(),
      lastLogin: admin.lastLogin?.toDate
        ? admin.lastLogin.toDate().toLocaleDateString()
        : admin.lastLogin
        ? new Date(admin.lastLogin).toLocaleDateString()
        : "Never",
      // Status indicators
      statusBadge: admin.isActive !== false ? "Active" : "Inactive",
      roleBadge:
        admin.role === "superadmin"
          ? "Super Admin"
          : admin.role === "manager"
          ? "Manager"
          : "Admin",
    }));

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.displayName?.toLowerCase().includes(search) ||
          admin.email?.toLowerCase().includes(search) ||
          admin.contact?.includes(search) ||
          admin.hotelNames?.toLowerCase().includes(search)
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((admin) => admin.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(
        (admin) => (admin.isActive !== false) === isActive
      );
    }

    return filtered;
  }, [admins, searchTerm, roleFilter, statusFilter]);

  // ✅ NEW: Statistics
  const adminStats = useMemo(() => {
    if (!admins || admins.length === 0) {
      return { total: 0, active: 0, inactive: 0, superAdmins: 0 };
    }

    const total = admins.length;
    const active = admins.filter((admin) => admin.isActive !== false).length;
    const inactive = total - active;
    const superAdmins = admins.filter(
      (admin) => admin.role === "superadmin"
    ).length;

    return { total, active, inactive, superAdmins };
  }, [admins]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === "connecting" || isRetrying) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>{isRetrying ? "Retrying..." : "Connecting..."}</span>
        </div>
      );
    } else if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
          {canRetry && (
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Retry
            </button>
          )}
        </div>
      );
    } else if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>Live Data</span>
          {lastFetch && (
            <span className="text-xs text-gray-500">
              • Updated {new Date(lastFetch).toLocaleTimeString()}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // ✅ ENHANCED: Toggle role function with Firestore
  const onToggleRole = useCallback(
    async (item) => {
      if (!hasPermission) {
        toast.error("You don't have permission to modify admin roles.");
        return;
      }

      const { id, role } = item;

      try {
        const adminDocRef = doc(db, "admins", id);
        const currentRole = role;
        const newRole =
          currentRole === "superadmin"
            ? "admin"
            : currentRole === "admin"
            ? "manager"
            : "admin";

        await updateDoc(adminDocRef, {
          role: newRole,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
        });

        const roleDisplay =
          newRole === "superadmin"
            ? "Super Admin"
            : newRole === "manager"
            ? "Manager"
            : "Admin";
        toast.success(`User role updated to ${roleDisplay} successfully.`);
      } catch (error) {
        console.error("Error updating user role:", error);

        let errorMessage = "Error updating user role: ";
        if (error.code === "permission-denied") {
          errorMessage += "You don't have permission to update this admin.";
        } else {
          errorMessage += error.message;
        }

        toast.error(errorMessage);
      }
    },
    [hasPermission, currentUser]
  );

  // ✅ ENHANCED: Toggle status function
  const onToggleStatus = useCallback(
    async (item) => {
      if (!hasPermission) {
        toast.error("You don't have permission to modify admin status.");
        return;
      }

      const { id, isActive, displayName } = item;
      const newStatus = !isActive;

      try {
        const adminDocRef = doc(db, "admins", id);

        await updateDoc(adminDocRef, {
          isActive: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
        });

        toast.success(
          `${displayName} ${
            newStatus ? "activated" : "deactivated"
          } successfully.`
        );
      } catch (error) {
        console.error("Error updating admin status:", error);
        toast.error("Error updating admin status: " + error.message);
      }
    },
    [hasPermission, currentUser]
  );

  // Function to handle edit action
  const onEdit = useCallback(
    (item) => {
      if (!hasPermission) {
        toast.error("You don't have permission to edit admins.");
        return;
      }
      console.log("Opening edit form for admin:", item);
      setEditingAdmin(item);
    },
    [hasPermission]
  );

  // Function to handle successful edit
  const onEditSuccess = useCallback((updatedAdmin) => {
    console.log("Edit successful:", updatedAdmin);
    setEditingAdmin(null);
    toast.success("Admin updated successfully!");
  }, []);

  // ✅ ENHANCED: Delete function with Firestore
  const onDelete = useCallback(
    async (item) => {
      if (!hasPermission) {
        toast.error("You don't have permission to delete admins.");
        return;
      }

      const { id, displayName, role } = item;
      const adminName = displayName || "this admin";

      // Prevent deletion of super admins by non-super admins
      if (role === "superadmin" && !isSuperAdmin()) {
        toast.error("Only super admins can delete other super admins.");
        return;
      }

      // Confirm deletion
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${adminName}? This action cannot be undone and will remove all associated data.`
      );

      if (confirmDelete) {
        try {
          const adminDocRef = doc(db, "admins", id);
          await deleteDoc(adminDocRef);

          toast.success(`${adminName} deleted successfully!`);
        } catch (error) {
          console.error("Error deleting admin:", error);

          let errorMessage = "Error deleting admin: ";
          if (error.code === "permission-denied") {
            errorMessage += "You don't have permission to delete this admin.";
          } else {
            errorMessage += error.message;
          }

          toast.error(errorMessage);
        }
      }
    },
    [hasPermission, isSuperAdmin]
  );

  // ✅ NEW: Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchAdmins();
    } catch (error) {
      console.error("Error refreshing admin list:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refetchAdmins]);

  // ✅ NEW: Export functionality
  const handleExport = useCallback(() => {
    try {
      const csvData = processedAdmins.map((admin) => ({
        "Sr. No": admin.srNo,
        Name: admin.displayName,
        Email: admin.email,
        Phone: admin.contact,
        Role: admin.roleBadge,
        Status: admin.statusBadge,
        Hotels: admin.hotelNames,
        "Created Date": admin.createdDate,
        "Last Login": admin.lastLogin,
      }));

      const csv = csvData.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(csvData[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `admins_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting admin list:", error);
      toast.error("Error exporting data");
    }
  }, [processedAdmins]);

  // ✅ ENHANCED: Actions with better organization
  const actions = [
    {
      label: "Toggle Role",
      variant: "primary",
      handler: onToggleRole,
      icon: <Shield size={14} />,
      condition: (item) => hasPermission && item.role !== "superadmin",
    },
    {
      label: "Toggle Status",
      variant: "secondary",
      handler: onToggleStatus,
      icon: (item) =>
        item.isActive !== false ? (
          <ToggleRight size={14} />
        ) : (
          <ToggleLeft size={14} />
        ),
      condition: (item) => hasPermission,
    },
  ];

  // ✅ ENHANCED: Updated columns with better formatting
  const enhancedColumns = [
    ...adminsListColumn,
    {
      key: "statusBadge",
      label: "Status",
      render: (value, item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.isActive !== false
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "roleBadge",
      label: "Role",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Super Admin"
              ? "bg-purple-100 text-purple-800"
              : value === "Manager"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  // ✅ NEW: Permission check UI
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            You don't have super admin permissions to view the admin list.
          </p>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Loading state
  if (loading && (!admins || admins.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin list..." />
      </div>
    );
  }

  // ✅ ENHANCED: Error state
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            error={error}
            onRetry={handleRefresh}
            title="Admin List Error"
            showRetryButton={canRetry}
          />
          <div className="mt-4 text-center">
            <ConnectionStatusIndicator />
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Attempted {retryCount} time{retryCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ NEW: Connection Status Bar */}
      {connectionStatus !== "connected" && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <ConnectionStatusIndicator />
            {retryCount > 0 && (
              <span className="text-xs text-gray-600">
                Retry attempt: {retryCount}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* ✅ ENHANCED: Header with actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <PageTitle
              pageTitle="Admin Management"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description="Manage system administrators and their permissions"
            />

            {/* ✅ NEW: Live status indicator */}
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live updates</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!processedAdmins.length}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isRefreshing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ✅ NEW: Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="Total Admins"
            value={adminStats.total}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={UserCheck}
            title="Active Admins"
            value={adminStats.active}
            color="green"
            loading={loading}
          />
          <StatCard
            icon={UserX}
            title="Inactive Admins"
            value={adminStats.inactive}
            color="red"
            loading={loading}
          />
          <StatCard
            icon={Shield}
            title="Super Admins"
            value={adminStats.superAdmins}
            color="purple"
            loading={loading}
          />
        </div>

        {/* ✅ NEW: Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search admins by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Filter summary */}
          {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {processedAdmins.length} of {adminStats.total} admins
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="text-red-600 hover:text-red-800 underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* ✅ ENHANCED: Dynamic Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DynamicTable
            columns={enhancedColumns}
            data={processedAdmins}
            onEdit={onEdit}
            onDelete={onDelete}
            actions={actions}
            loading={loading}
            emptyMessage="No admins found matching your criteria"
            showPagination={true}
            initialRowsPerPage={10}
            sortable={true}
            // ✅ NEW: Enhanced table props
            searchable={false} // We handle search externally
            exportable={false} // We handle export externally
            refreshable={true}
            onRefresh={handleRefresh}
            connectionStatus={connectionStatus}
          />
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

        {/* ✅ ENHANCED: Edit Form Modal */}
        {editingAdmin && (
          <AdminEditForm
            admin={editingAdmin}
            onClose={() => setEditingAdmin(null)}
            onSuccess={onEditSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AdminList;

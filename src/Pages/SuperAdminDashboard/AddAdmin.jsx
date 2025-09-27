// Fixed AdminManagement Page - pages/AdminManagement.jsx

import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  Shield,
  Search,
  Filter,
  Download,
  Settings,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useAdmin } from "../../hooks/useAdmin";
import { useHotel } from "../../hooks/useHotel"; // Fixed import
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import StatCard from "components/Cards/StatCard";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useNavigate, useParams } from "react-router-dom";

const AdminFormModal = React.lazy(() =>
  import("../../components/FormModals/AdminFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

const AdminManagement = memo(() => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { hotelId } = useParams(); // If we're managing admins for a specific hotel

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get hotels list for filtering and assignment - FIXED
  const {
    hotels: availableHotels,
    loading: hotelsLoading,
    error: hotelsError,
  } = useHotel({
    includeMetrics: false,
    filterActive: true, // Only get active hotels
  });

  console.log("Available hotels:", availableHotels); // Debug log

  const {
    admins,
    filteredAdmins,
    searchTerm,
    loading,
    submitting,
    error,
    handleFormSubmit,
    handleSearchChange,
    deleteAdmin,
    linkAdminToHotel,
    unlinkAdminFromHotel,
    prepareForEdit,
    adminCount,
    hasAdmins,
    hasSearchResults,
    setSearchTerm,
    clearError,
  } = useAdmin({
    hotelId, // If hotelId is provided, only show admins for that hotel
    onAdminAdded: (adminData) => {
      console.log("Admin added successfully:", adminData);
    },
  });

  // Filter admins based on status, role, and hotel
  const filteredAndSorted = useMemo(() => {
    let arr = filteredAdmins;

    if (statusFilter !== "all") {
      arr = arr.filter((admin) => admin.status === statusFilter);
    }

    if (roleFilter !== "all") {
      arr = arr.filter((admin) => admin.role === roleFilter);
    }

    if (hotelFilter !== "all") {
      arr = arr.filter((admin) => admin.linkedHotelId === hotelFilter);
    }

    // Sort by created date descending (newest first)
    arr = [...arr].sort((a, b) => {
      const aTime =
        a.createdAt?.seconds || a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime =
        b.createdAt?.seconds || b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });

    return arr;
  }, [filteredAdmins, statusFilter, roleFilter, hotelFilter]);

  // Get unique roles and hotels for filters
  const filterOptions = useMemo(() => {
    const roles = new Set();
    const linkedHotels = new Set();

    admins.forEach((admin) => {
      if (admin.role) roles.add(admin.role);
      if (admin.linkedHotelId && admin.hotelInfo) {
        linkedHotels.add(admin.linkedHotelId);
      }
    });

    return {
      roles: Array.from(roles).sort(),
      linkedHotels: Array.from(linkedHotels).sort(),
    };
  }, [admins]);

  // Enhanced Stats Calculation
  const adminStats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((admin) => admin.status === "active").length;
    const inactive = total - active;
    const linked = admins.filter((admin) => admin.linkedHotelId).length;
    const unlinked = total - linked;

    const roleStats = {};
    admins.forEach((admin) => {
      const role = admin.role || "unknown";
      roleStats[role] = (roleStats[role] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      linked,
      unlinked,
      roleStats,
    };
  }, [admins]);

  const handleAddClick = useCallback(() => {
    setEditingAdmin(null);
    setShowModal(true);
    if (error) clearError();
  }, [error, clearError]);

  const handleEditClick = useCallback(
    async (admin) => {
      try {
        const adminToEdit = await prepareForEdit(admin);
        if (adminToEdit) {
          setEditingAdmin(adminToEdit);
          setShowModal(true);
        }
      } catch (err) {
        console.error("Error preparing admin for edit:", err);
      }
    },
    [prepareForEdit]
  );

  const handleDeleteClick = useCallback(
    async (admin) => {
      const adminName = admin.fullName || admin.email || "this admin";
      const hotelName = admin.hotelInfo?.businessName || "no hotel";

      const confirmed = window.confirm(
        `Are you sure you want to delete "${adminName}" (linked to: ${hotelName})?\n\nThis action cannot be undone and will remove the admin's access to the system.`
      );

      if (confirmed) {
        try {
          await deleteAdmin(admin);
        } catch (err) {
          console.error("Error deleting admin:", err);
        }
      }
    },
    [deleteAdmin]
  );

  const handleLinkToHotel = useCallback(
    async (admin, targetHotelId) => {
      if (admin.linkedHotelId === targetHotelId) return;

      try {
        if (admin.linkedHotelId) {
          // First unlink from current hotel
          await unlinkAdminFromHotel(admin.adminId, admin.linkedHotelId);
        }

        if (targetHotelId) {
          // Then link to new hotel
          await linkAdminToHotel(admin.adminId, targetHotelId);
        }
      } catch (err) {
        console.error("Error linking admin to hotel:", err);
      }
    },
    [linkAdminToHotel, unlinkAdminFromHotel]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingAdmin(null);
    if (error) clearError();
  }, [error, clearError]);

  const handleModalSubmit = useCallback(
    async (adminData, adminId = null) => {
      try {
        // If we're in hotel-specific mode, auto-assign the admin to this hotel
        if (hotelId && !adminData.linkedHotelId) {
          adminData.linkedHotelId = hotelId;
        }

        console.log("Submitting admin data:", adminData); // Debug log

        const success = await handleFormSubmit(
          adminData,
          adminId,
          adminData.linkedHotelId
        );
        return success;
      } catch (error) {
        console.error("Error submitting admin form:", error);
        return false;
      }
    },
    [handleFormSubmit, hotelId]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setHotelFilter("all");
  }, [setSearchTerm]);

  const handleViewHotel = useCallback(
    (admin) => {
      if (admin.linkedHotelId) {
        navigate(`/super-admin/${admin.linkedHotelId}/dashboard`);
      }
    },
    [navigate]
  );

  // Error Handling
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage
          error={error}
          title="Error Loading Admins"
          onRetry={clearError}
        />
      </div>
    );
  }

  if (loading && !admins.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admins..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal for Add/Edit Admin - FIXED with proper props */}
      <Suspense fallback={<LoadingSpinner />}>
        <AdminFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editAdmin={editingAdmin}
          title={editingAdmin ? "Edit Admin Details" : "Create New Admin"}
          submitting={submitting}
          hotelId={hotelId} // Pass hotelId if we're in hotel-specific mode
          availableHotels={availableHotels || []} // FIXED: Pass available hotels
        />
      </Suspense>

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex flex-row lg:flex-row lg:items-center justify-between gap-4 mb-1">
              <PageTitle
                pageTitle={hotelId ? `Hotel Admins` : "Admin Management"}
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                description={
                  hotelId
                    ? "Manage admins for this specific hotel"
                    : "Manage all admin users across all hotels"
                }
              />
              <PrimaryButton
                onAdd={handleAddClick}
                btnText={hotelId ? "Add Hotel Admin" : "Add New Admin"}
                loading={submitting}
                icon={Plus}
                className="bg-blue-600 hover:bg-blue-700"
              />
            </div>
            {hasAdmins && (
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {adminStats.total}</span>
                <span className="text-green-600">
                  Active: {adminStats.active}
                </span>
                <span className="text-red-600">
                  Inactive: {adminStats.inactive}
                </span>
                <span className="text-blue-600">
                  Linked: {adminStats.linked}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {hasAdmins && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              title="Total Admins"
              value={adminStats.total}
              color="blue"
              loading={loading}
              subtitle={`${Object.keys(adminStats.roleStats).length} roles`}
            />
            <StatCard
              icon={UserCheck}
              title="Active Admins"
              value={adminStats.active}
              color="green"
              subtitle={
                adminStats.total
                  ? `${Math.round(
                      (adminStats.active / adminStats.total) * 100
                    )}% active`
                  : ""
              }
              loading={loading}
            />
            <StatCard
              icon={UserX}
              title="Inactive Admins"
              value={adminStats.inactive}
              color="red"
              loading={loading}
              subtitle={
                adminStats.inactive > 0 ? "Requires attention" : "All active"
              }
            />
            <StatCard
              icon={Building2}
              title="Linked to Hotels"
              value={adminStats.linked}
              color="purple"
              subtitle={`${adminStats.unlinked} unlinked`}
              loading={loading}
            />
          </div>
        )}

        {/* Enhanced Filters */}
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
                  placeholder="Search by name, email, role, or hotel..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter dropdowns */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                {filterOptions.roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() +
                      role.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>

              {!hotelId && ( // Only show hotel filter if not in hotel-specific mode
                <select
                  value={hotelFilter}
                  onChange={(e) => setHotelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Hotels</option>
                  <option value="">Unlinked</option>
                  {availableHotels.map((hotel) => (
                    <option key={hotel.hotelId} value={hotel.hotelId}>
                      {hotel.businessName || hotel.hotelName}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleAddClick}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Add Admin
              </button>
            </div>
          </div>

          {/* Hotels loading indicator */}
          {hotelsLoading && (
            <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Loading hotels for assignment...
            </div>
          )}

          {/* Filter summary */}
          {(searchTerm ||
            statusFilter !== "all" ||
            roleFilter !== "all" ||
            hotelFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAndSorted.length} result
                {filteredAndSorted.length !== 1 ? "s" : ""}
                {searchTerm && ` for "${searchTerm}"`}
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

        {/* Table/Search Results/Empty States */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasAdmins ? (
            filteredAndSorted.length > 0 ? (
              <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                <DynamicTable
                  columns={[
                    {
                      key: "srNo",
                      title: "#",
                      width: "60px",
                    },
                    {
                      key: "fullName",
                      title: "Name",
                      render: (value, admin) => (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {admin.fullName?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {admin.fullName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={12} />
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "role",
                      title: "Role",
                      render: (value) => (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            value === "super_admin"
                              ? "bg-purple-100 text-purple-800"
                              : value === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : value === "manager"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <Shield size={12} className="mr-1" />
                          {value?.charAt(0)?.toUpperCase() +
                            value?.slice(1).replace("_", " ")}
                        </span>
                      ),
                    },
                    {
                      key: "hotelInfo",
                      title: "Hotel",
                      render: (value, admin) => (
                        <div>
                          {admin.hotelInfo ? (
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-gray-400" />
                              <span className="text-sm font-medium">
                                {admin.hotelInfo.businessName}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  admin.hotelInfo.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {admin.hotelInfo.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 italic">
                              Not linked
                            </span>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "phone",
                      title: "Contact",
                      render: (value, admin) => (
                        <div className="text-sm">
                          {admin.phone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone size={12} />
                              {admin.phone}
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "status",
                      title: "Status",
                      render: (value) => (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            value === "active"
                              ? "bg-green-100 text-green-800"
                              : value === "inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {value === "active" ? (
                            <UserCheck size={12} className="mr-1" />
                          ) : (
                            <UserX size={12} className="mr-1" />
                          )}
                          {value?.charAt(0)?.toUpperCase() + value?.slice(1)}
                        </span>
                      ),
                    },
                  ]}
                  data={filteredAndSorted}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  loading={submitting}
                  emptyMessage="No admins match your current filters"
                  showPagination={true}
                  initialRowsPerPage={10}
                  sortable={true}
                  className="border-0"
                  actions={[
                    {
                      label: "View Hotel",
                      onClick: handleViewHotel,
                      icon: Building2,
                      variant: "secondary",
                      show: (admin) => Boolean(admin.linkedHotelId),
                    },
                  ]}
                />
              </Suspense>
            ) : (
              <NoSearchResults
                btnText={hotelId ? "Add Hotel Admin" : "Add New Admin"}
                searchTerm={searchTerm}
                onClearSearch={handleClearSearch}
                onAddNew={handleAddClick}
              />
            )
          ) : (
            <EmptyState
              icon={Users}
              title={hotelId ? "No Hotel Admins Yet" : "No Admins Yet"}
              description={
                hotelId
                  ? "Start by adding the first admin for this hotel. They will be able to manage the hotel's operations."
                  : "Start by adding your first admin user. They will be able to manage hotel operations and access the system."
              }
              actionLabel={
                hotelId ? "Add First Hotel Admin" : "Add First Admin"
              }
              onAction={handleAddClick}
              loading={submitting}
            />
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
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
});

AdminManagement.displayName = "AdminManagement";
export default AdminManagement;

import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useAdmin } from "../../hooks/useAdmin";
import { useHotel } from "../../hooks/useHotel";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";

// Lazy load heavy components
const AddAdminFormModal = React.lazy(() =>
  import("../../components/FormModals/AdminFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Advanced Filters Component
const AdvancedFilters = memo(
  ({
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    hotelFilter,
    setHotelFilter,
    filterOptions,
    availableHotels,
    showHotelFilter,
    onAddClick,
    submitting,
  }) => (
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
            {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
          </option>
        ))}
      </select>

      {showHotelFilter && (
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
        onClick={onAddClick}
        disabled={submitting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Users size={16} />
        Add Admin
      </button>
    </div>
  )
);

// Main ViewAdmin component
const ViewAdmin = memo(() => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { hotelId } = useParams();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("all");

  // Get hotels list for filtering and assignment
  const {
    hotels: availableHotels,
    loading: hotelsLoading,
    error: hotelsError,
  } = useHotel({
    includeMetrics: false,
    filterActive: true,
  });

  // Use custom hook for admin management
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
    refreshAdmins,
    adminCount,
    hasAdmins,
    hasSearchResults,
    setSearchTerm,
    clearError,
  } = useAdmin({
    hotelId,
    onAdminAdded: (adminData) => {},
  });

  // Filter and sort admins
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

    return [...arr].sort((a, b) => {
      const aTime =
        a.createdAt?.seconds || a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime =
        b.createdAt?.seconds || b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
  }, [filteredAdmins, statusFilter, roleFilter, hotelFilter]);

  // Get filter options
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

  // Memoized statistics calculations
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

  // Event handlers
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

  const handleRefresh = useCallback(() => {
    try {
      if (typeof refreshAdmins === "function") {
        refreshAdmins();
      } else {
        console.warn("Refresh function not available");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing admins:", error);
      window.location.reload();
    }
  }, [refreshAdmins]);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
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
              <div className="font-medium text-gray-900">{admin.fullName}</div>
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
              <span className="text-sm text-gray-500 italic">Not linked</span>
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
    ],
    []
  );

  // Table actions configuration
  const tableActions = useMemo(
    () => [
      {
        label: "View Hotel",
        onClick: handleViewHotel,
        icon: Building2,
        variant: "secondary",
        show: (admin) => Boolean(admin.linkedHotelId),
      },
    ],
    [handleViewHotel]
  );

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title={t("admins.errorLoading")}
      />
    );
  }

  // Loading state
  if (loading && !admins.length) {
    return <LoadingSpinner size="lg" text={t("admins.loading")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <AddAdminFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editAdmin={editingAdmin}
          availableHotels={availableHotels}
          defaultHotelId={hotelId}
          title={editingAdmin ? t("admins.editTitle") : t("admins.addTitle")}
          submitting={submitting}
        />
      </Suspense>

      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
          <PageTitle
            pageTitle={hotelId ? "Hotel Admins" : t("admins.pageTitle")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={
              hotelId
                ? "Manage admins for this specific hotel"
                : t("admins.pageDescription")
            }
          />
        </div>

        {/* Stats Cards */}
        {hasAdmins && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <StatCard
              icon={Users}
              title={t("admins.total")}
              value={adminStats.total}
              color="blue"
              subtitle={`${Object.keys(adminStats.roleStats).length} roles`}
              loading={loading}
            />
            <StatCard
              icon={UserCheck}
              title={t("admins.active")}
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
              title={t("admins.inactive")}
              value={adminStats.inactive}
              color="red"
              subtitle={
                adminStats.inactive > 0 ? "Requires attention" : "All active"
              }
              loading={loading}
            />
            <StatCard
              icon={Building2}
              title={t("admins.linked")}
              value={adminStats.linked}
              color="purple"
              subtitle={`${adminStats.unlinked} unlinked`}
              loading={loading}
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasAdmins && (
          <>
            <SearchWithResults
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("admins.searchPlaceholder")}
              totalCount={adminCount}
              filteredCount={filteredAndSorted.length}
              onClearSearch={handleClearSearch}
              totalLabel={t("admins.totalLabel")}
              onAdd={handleAddClick}
              addButtonText={hotelId ? "Add Hotel Admin" : "Add Admin"}
              addButtonLoading={loading}
              customFilters={
                <AdvancedFilters
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  roleFilter={roleFilter}
                  setRoleFilter={setRoleFilter}
                  hotelFilter={hotelFilter}
                  setHotelFilter={setHotelFilter}
                  filterOptions={filterOptions}
                  availableHotels={availableHotels}
                  showHotelFilter={!hotelId}
                  onAddClick={handleAddClick}
                  submitting={submitting}
                />
              }
            />

            {/* Filter summary */}
            {(searchTerm ||
              statusFilter !== "all" ||
              roleFilter !== "all" ||
              hotelFilter !== "all") && (
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
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
          </>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasAdmins ? (
            <>
              {hasSearchResults && filteredAndSorted.length > 0 ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={tableColumns}
                    data={filteredAndSorted}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    loading={submitting}
                    emptyMessage={t("admins.noSearchResults")}
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                    actions={tableActions}
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText={t("admins.addButton")}
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Users}
              title={hotelId ? "No Hotel Admins Yet" : t("admins.emptyTitle")}
              description={
                hotelId
                  ? "Start by adding the first admin for this hotel. They will be able to manage the hotel's operations."
                  : t("admins.emptyDescription")
              }
              actionLabel={
                hotelId ? "Add First Hotel Admin" : t("admins.emptyAction")
              }
              onAction={handleAddClick}
              loading={submitting}
            />
          )}
        </div>
      </div>

      {/* Toast Container */}
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

ViewAdmin.displayName = "ViewAdmin";
export default ViewAdmin;

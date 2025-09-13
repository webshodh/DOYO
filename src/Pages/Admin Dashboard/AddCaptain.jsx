import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Plus,
  Users,
  Search,
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Filter,
  Download,
  RefreshCw,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

import PageTitle from "../../atoms/PageTitle";
import { ViewCaptainColumns } from "../../Constants/Columns";
import SearchWithButton from "molecules/SearchWithAddButton";
import { useCaptain } from "../../customHooks/useCaptain";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";

// Lazy load heavy components
const CaptainFormModal = React.lazy(() =>
  import("../../components/FormModals/CaptainFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Stats card component
const StatsCard = memo(({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${colorClasses[color]}`}
    >
      <Icon className="w-5 h-5" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
});

StatsCard.displayName = "StatsCard";

// No search results component
const NoSearchResults = memo(({ searchTerm, onClearSearch, onAddNew }) => (
  <EmptyState
    icon={Search}
    title="No Captains Found"
    description={`No captains match your search for "${searchTerm}". Try adjusting your search terms or add a new captain.`}
    className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
  >
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
      <button
        onClick={onClearSearch}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <LoaderCircle className="w-4 h-4" />
        Clear Search
      </button>

      <button
        onClick={onAddNew}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Captain
      </button>
    </div>
  </EmptyState>
));

NoSearchResults.displayName = "NoSearchResults";

// Action buttons component
const ActionButtons = memo(
  ({ onAdd, onExport, onRefresh, loading = false, exportEnabled = false }) => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onAdd}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Captain</span>
      </button>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {exportEnabled && (
        <button
          onClick={onExport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}
    </div>
  )
);

ActionButtons.displayName = "ActionButtons";
// Status Badge Component




// Actions Menu Component
export const ActionsMenu = ({
  captain,
  onEdit,
  onDelete,
  onToggleStatus,
  loading,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onEdit(captain)}
        disabled={loading}
        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
        title="Edit Captain"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleStatus(captain.captainId, captain.status)}
        disabled={loading}
        className={`p-1 rounded transition-colors disabled:opacity-50 ${
          captain.status === "active"
            ? "text-red-600 hover:text-red-800 hover:bg-red-50"
            : "text-green-600 hover:text-green-800 hover:bg-green-50"
        }`}
        title={
          captain.status === "active"
            ? "Deactivate Captain"
            : "Activate Captain"
        }
      >
        {captain.status === "active" ? (
          <XCircle className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
      </button>

      <button
        onClick={() => onDelete(captain)}
        disabled={loading}
        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
        title="Delete Captain"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// Main AddCaptain component
const AddCaptain = memo(() => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState(null);

  // Use custom hook for captain management
  const {
    captains,
    filteredCaptains,
    searchTerm,
    loading,
    submitting,
    error,
    handleFormSubmit,
    handleSearchChange,
    deleteCaptain,
    toggleCaptainStatus,
    prepareForEdit,
    refreshCaptains,
    captainCount,
    hasCaptains,
    hasSearchResults,
    activeCaptains,
    inactiveCaptains,
  } = useCaptain(hotelName);

  // Memoized calculations
  const stats = useMemo(() => {
    const recentCount = captains.filter((captain) => {
      const createdDate = new Date(captain.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdDate > weekAgo;
    }).length;

    return {
      total: captainCount,
      active: activeCaptains,
      inactive: inactiveCaptains,
      recent: recentCount,
    };
  }, [captains, captainCount, activeCaptains, inactiveCaptains]);

  // Event handlers
  const handleAddClick = useCallback(() => {
    setEditingCaptain(null);
    setShowModal(true);
  }, []);

  const handleEditClick = useCallback(
    async (captain) => {
      try {
        const captainToEdit = await prepareForEdit(captain);
        if (captainToEdit) {
          setEditingCaptain(captainToEdit);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error preparing captain for edit:", error);
      }
    },
    [prepareForEdit]
  );

  const handleDeleteClick = useCallback(
    async (captain) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${captain.firstName} ${captain.lastName}"? This action cannot be undone.`
      );

      if (confirmed) {
        try {
          await deleteCaptain(captain);
        } catch (error) {
          console.error("Error deleting captain:", error);
        }
      }
    },
    [deleteCaptain]
  );

  const handleToggleStatus = useCallback(
    async (captainId, currentStatus) => {
      try {
        await toggleCaptainStatus(captainId, currentStatus);
      } catch (error) {
        console.error("Error toggling captain status:", error);
      }
    },
    [toggleCaptainStatus]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingCaptain(null);
  }, []);

  const handleModalSubmit = useCallback(
    async (captainData, captainId = null) => {
      try {
        const success = await handleFormSubmit(captainData, captainId);
        return success;
      } catch (error) {
        console.error("Error submitting form:", error);
        return false;
      }
    },
    [handleFormSubmit]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const handleExport = useCallback(() => {
    console.log("Exporting captains...");
    // Export logic here - could export to CSV/Excel
  }, []);

  const handleRefresh = useCallback(() => {
    refreshCaptains();
  }, [refreshCaptains]);

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Captains
          </h3>
          <p className="text-red-600 mb-4">
            {error.message || "Something went wrong"}
          </p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !captains.length) {
    return <LoadingSpinner size="lg" text="Loading captains..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Captain Form Modal */}
      <Suspense fallback={<div>Loading modal...</div>}>
        <CaptainFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editCaptain={editingCaptain}
          existingCaptains={captains}
          title={editingCaptain ? "Edit Captain" : "Add Captain"}
          submitting={submitting}
        />
      </Suspense>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <PageTitle
              pageTitle="Captain Management"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            />
            <p className="text-gray-600 mt-1">
              Manage your restaurant captains and service staff
            </p>
          </div>

          <ActionButtons
            onAdd={handleAddClick}
            onExport={handleExport}
            onRefresh={handleRefresh}
            loading={loading}
            exportEnabled={hasCaptains}
          />
        </div>

        {/* Stats Cards */}
        {hasCaptains && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={Users}
              label="Total Captains"
              value={stats.total}
              color="blue"
            />
            <StatsCard
              icon={UserCheck}
              label="Active Captains"
              value={stats.active}
              color="green"
            />
            <StatsCard
              icon={UserX}
              label="Inactive Captains"
              value={stats.inactive}
              color="red"
            />
            <StatsCard
              icon={Clock}
              label="Recent (7 days)"
              value={stats.recent}
              color="purple"
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasCaptains && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 min-w-0">
                <SearchWithButton
                  searchTerm={searchTerm}
                  onSearchChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search captains by name, email, mobile, or Aadhar..."
                  onlyView={true}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {searchTerm ? (
                  <>
                    <span>
                      Showing {filteredCaptains.length} of {captainCount}
                    </span>
                    <button
                      onClick={handleClearSearch}
                      className="text-orange-500 hover:text-orange-600 underline"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <span>{captainCount} total captains</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasCaptains ? (
            <>
              {hasSearchResults ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={ViewCaptainColumns}
                    data={filteredCaptains}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    loading={submitting}
                    emptyMessage="No captains match your search criteria"
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="No Captains Yet"
              description="Add your first captain to start managing your service staff. Captains help coordinate between kitchen and customers for better service."
              actionLabel="Add Your First Captain"
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

AddCaptain.displayName = "AddCaptain";

export default AddCaptain;

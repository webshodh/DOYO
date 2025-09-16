import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

import PageTitle from "../../atoms/PageTitle";
import { ViewCaptainColumns } from "../../Constants/Columns";
import { useCaptain } from "../../customHooks/useCaptain";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import StatCard from "components/Cards/StatCard";
import ErrorState from "atoms/Messages/ErrorState";
import NoSearchResults from "molecules/NoSearchResults";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const CaptainFormModal = React.lazy(() =>
  import("../../components/FormModals/CaptainFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main AddCaptain component
const AddCaptain = memo(() => {
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

  const handleRefresh = useCallback(() => {
    refreshCaptains();
  }, [refreshCaptains]);

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title="Error Loading Captains"
      />
    );
  }

  // Loading state
  if (loading && !captains.length) {
    return <LoadingSpinner size="lg" text="Loading captains..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Captain Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
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

      <div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle="Captain Management"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="Manage your restaurant captains and service staff"
          />

          <PrimaryButton
            onAdd={handleAddClick}
            btnText="Add Captain"
            loading={loading}
          />
        </div>

        {/* Stats Cards */}
        {hasCaptains && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              title="Total Captains"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              title="Active Captains"
              value={stats.active}
              color="green"
            />
            <StatCard
              icon={UserX}
              title="Inactive Captains"
              value={stats.inactive}
              color="red"
            />
            <StatCard
              icon={Clock}
              title="Recent (7 days)"
              value={stats.recent}
              color="purple"
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasCaptains && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search captains by name, email, mobile, or Aadhar..."
            totalCount={captainCount}
            filteredCount={filteredCaptains.length}
            onClearSearch={handleClearSearch}
            totalLabel="total captains"
          />
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
                  btnText="Add Captain"
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

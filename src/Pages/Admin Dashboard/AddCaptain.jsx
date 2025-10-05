// AddCaptain.js (CORRECTED VERSION)
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Users } from "lucide-react";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useCaptain } from "../../hooks/useCaptain";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "components/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "components/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useTranslation } from "react-i18next";

// Lazy load heavy components
const CaptainFormModal = React.lazy(() =>
  import("../../components/FormModals/CaptainFormModal")
);
const DynamicTable = React.lazy(() => import("../../components/DynamicTable"));

// Main AddCaptain component
const AddCaptain = memo(() => {
  const { hotelName } = useParams();
  const { ViewCaptainColumns } = useColumns();
  const { t } = useTranslation();

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
  const stats = useMemo(
    () => ({
      total: captainCount,
      active: activeCaptains,
      inactive: inactiveCaptains,
      recent: captains.filter((captain) => {
        const createdDate = new Date(
          captain.createdAt?.toDate
            ? captain.createdAt.toDate()
            : captain.createdAt
        );
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate > weekAgo;
      }).length,
    }),
    [captains, captainCount, activeCaptains, inactiveCaptains]
  );

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
        t("confirmations.deleteCaptain", {
          firstName: captain.firstName,
          lastName: captain.lastName,
        })
      );

      if (confirmed) {
        try {
          await deleteCaptain(captain);
        } catch (error) {
          console.error("Error deleting captain:", error);
        }
      }
    },
    [deleteCaptain, t]
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
    try {
      if (typeof refreshCaptains === "function") {
        refreshCaptains();
      } else {
        console.warn("Refresh function not available");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing captains:", error);
      window.location.reload();
    }
  }, [refreshCaptains]);

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title={t("errors.loadingCaptains")}
      />
    );
  }

  // Loading state
  if (loading && !captains.length) {
    return <LoadingSpinner size="lg" text={t("loading.captains")} />;
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
          title={
            editingCaptain ? t("captains.editTitle") : t("captains.addTitle")
          }
          submitting={submitting}
        />
      </Suspense>

      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
          <PageTitle
            pageTitle={t("pages.captainManagement")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={t("descriptions.captainManagement")}
          />
        </div>

        {/* Stats Cards */}
        {hasCaptains && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <StatCard
              icon={Users}
              title={t("stats.totalCaptains")}
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={Users}
              title={t("stats.activeCaptains")}
              value={stats.active}
              color="green"
            />
            <StatCard
              icon={Users}
              title={t("stats.inactiveCaptains")}
              value={stats.inactive}
              color="red"
            />
            <StatCard
              icon={Users}
              title={t("stats.recentCaptains")}
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
            placeholder={t("placeholders.searchCaptains")}
            totalCount={captainCount}
            filteredCount={filteredCaptains.length}
            onClearSearch={handleClearSearch}
            totalLabel={t("labels.totalCaptains")}
            onAdd={handleAddClick}
            addButtonText="Add"
            addButtonLoading={loading}
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasCaptains ? (
            <>
              {hasSearchResults ? (
                <Suspense
                  fallback={<LoadingSpinner text={t("loading.table")} />}
                >
                  <DynamicTable
                    columns={ViewCaptainColumns}
                    data={filteredCaptains}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    loading={submitting}
                    emptyMessage={t("messages.noSearchResults")}
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText={t("buttons.addCaptain")}
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Users}
              title={t("emptyStates.noCaptains.title")}
              description={t("emptyStates.noCaptains.description")}
              actionLabel={t("emptyStates.noCaptains.actionLabel")}
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

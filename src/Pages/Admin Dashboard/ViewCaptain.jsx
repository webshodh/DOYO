import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageTitle from "../../atoms/PageTitle";

import { useCaptain } from "../../hooks/useCaptain";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import StatCard from "components/Cards/StatCard";
import NoSearchResults from "molecules/NoSearchResults";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import useColumns from "../../Constants/Columns";

const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main ViewCaptain component
const ViewCaptain = memo(() => {
  const { t } = useTranslation();
  const { hotelName } = useParams();
  const { ViewCaptainColumns } = useColumns();

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
        console.error(t("errors.prepareCaptainEdit"), error);
      }
    },
    [prepareForEdit, t]
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
          console.error(t("errors.deleteCaptain"), error);
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
        console.error(t("errors.toggleCaptainStatus"), error);
      }
    },
    [toggleCaptainStatus, t]
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
        console.error(t("errors.submitForm"), error);
        return false;
      }
    },
    [handleFormSubmit, t]
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
      <div>
        {/* Header */}
        <div className="flex flex-row lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle={t("pages.captainManagement")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={t("descriptions.captainManagement")}
          />

          <PrimaryButton
            onAdd={handleAddClick}
            btnText={t("buttons.addCaptain")}
            loading={loading}
          />
        </div>

        {/* Stats Cards */}
        {hasCaptains && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              title={t("stats.totalCaptains")}
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              title={t("stats.activeCaptains")}
              value={stats.active}
              color="green"
            />
            <StatCard
              icon={UserX}
              title={t("stats.inactiveCaptains")}
              value={stats.inactive}
              color="red"
            />
            <StatCard
              icon={Clock}
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

ViewCaptain.displayName = "ViewCaptain";

export default ViewCaptain;

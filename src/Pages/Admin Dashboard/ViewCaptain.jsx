import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Users } from "lucide-react";

import PageTitle from "../../atoms/PageTitle";
import PrimaryButton from "../../atoms/Buttons/PrimaryButton";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import SearchWithResults from "molecules/SearchWithResults";
import StatCard from "components/Cards/StatCard";
import { Users as UsersIcon, UserCheck, UserX, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCaptain } from "../../hooks/useCaptain";
import CaptainFormModal from "../../components/FormModals/CaptainFormModal";
import useColumns from "../../Constants/Columns";
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

const AddCaptain = () => {
  const { t } = useTranslation();
  const { hotelName } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState(null);
  const { ViewCaptainColumns } = useColumns;
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

  const stats = React.useMemo(() => {
    const recent = captains.filter((c) => {
      const date = new Date(c.createdAt);
      return date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;
    return {
      total: captainCount,
      active: activeCaptains,
      inactive: inactiveCaptains,
      recent,
    };
  }, [captains, captainCount, activeCaptains, inactiveCaptains]);

  const openAdd = useCallback(() => {
    setEditingCaptain(null);
    setShowModal(true);
  }, []);

  const openEdit = useCallback(
    async (cap) => {
      const editable = await prepareForEdit(cap);
      if (editable) {
        setEditingCaptain(editable);
        setShowModal(true);
      }
    },
    [prepareForEdit]
  );

  const handleDelete = useCallback(
    (cap) => {
      if (
        window.confirm(
          t("confirmations.deleteCaptain", {
            firstName: cap.firstName,
            lastName: cap.lastName,
          })
        )
      ) {
        deleteCaptain(cap);
      }
    },
    [deleteCaptain, t]
  );

  const handleToggle = useCallback(
    (id, status) => {
      toggleCaptainStatus(id, status);
    },
    [toggleCaptainStatus]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingCaptain(null);
  }, []);

  const submitModal = useCallback(
    async (data, id) => {
      return await handleFormSubmit(data, id);
    },
    [handleFormSubmit]
  );

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title={t("errors.loadingCaptains")}
        onRetry={refreshCaptains}
      />
    );
  }

  if (loading && !captains.length) {
    return <LoadingSpinner size="lg" text={t("loading.captains")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageTitle
        pageTitle={t("pages.captainManagement")}
        description={t("descriptions.captainManagement")}
      />
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onAdd={openAdd}
          btnText={t("buttons.addCaptain")}
          loading={loading}
        />
      </div>

      {hasCaptains && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={UsersIcon}
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

      {hasCaptains && (
        <SearchWithResults
          searchTerm={searchTerm}
          onSearchChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t("placeholders.searchCaptains")}
          totalCount={captainCount}
          filteredCount={filteredCaptains.length}
          onClearSearch={() => handleSearchChange("")}
          totalLabel={t("labels.totalCaptains")}
        />
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {hasCaptains ? (
          hasSearchResults ? (
            <React.Suspense
              fallback={<LoadingSpinner text={t("loading.table")} />}
            >
              <DynamicTable
                columns={ViewCaptainColumns}
                data={filteredCaptains}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggle}
                loading={submitting}
                emptyMessage={t("messages.noSearchResults")}
                showPagination
                initialRowsPerPage={10}
                sortable
              />
            </React.Suspense>
          ) : (
            <NoSearchResults
              btnText={t("buttons.addCaptain")}
              searchTerm={searchTerm}
              onClearSearch={() => handleSearchChange("")}
              onAddNew={openAdd}
            />
          )
        ) : (
          <EmptyState
            icon={Users}
            title={t("emptyStates.noCaptains.title")}
            description={t("emptyStates.noCaptains.description")}
            actionLabel={t("emptyStates.noCaptains.actionLabel")}
            onAction={openAdd}
            loading={submitting}
          />
        )}
      </div>

      <CaptainFormModal
        show={showModal}
        onClose={closeModal}
        onSubmit={submitModal}
        editCaptain={editingCaptain}
        existingCaptains={captains}
        submitting={submitting}
      />

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default AddCaptain;

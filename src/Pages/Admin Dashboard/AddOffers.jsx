import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Plus,
  Tags,
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useOffers } from "../../hooks/useOffers";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const OffersFormModal = React.lazy(() =>
  import("../../components/FormModals/OffersFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main AddOffers component
const AddOffers = memo(() => {
  const navigate = useNavigate();
  const { hotelName } = useParams();
  const { ViewOffersColumns } = useColumns();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Use custom hook for offers management
  const {
    offers,
    filteredOffers,
    searchTerm,
    loading,
    submitting,
    error,
    handleFormSubmit,
    handleSearchChange,
    deleteOffer,
    prepareForEdit,
    refreshOffers,
    offerCount,
    hasOffers,
    hasSearchResults,
    toggleOfferStatus,
  } = useOffers(hotelName);

  // Memoized calculations
  const stats = useMemo(
    () => ({
      total: offerCount,
      active: offers.filter((offer) => offer.status === "active").length,
      expired: offers.filter((offer) => {
        const expiry = new Date(offer.expiryDate);
        return expiry < new Date();
      }).length,
      recent: offers.filter((offer) => {
        const createdDate = new Date(offer.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate > weekAgo;
      }).length,
    }),
    [offers, offerCount]
  );

  // Event handlers
  const handleAddClick = useCallback(() => {
    setEditingOffer(null);
    setShowModal(true);
  }, []);

  const handleEditClick = useCallback(
    async (offer) => {
      try {
        const offerToEdit = await prepareForEdit(offer);
        if (offerToEdit) {
          setEditingOffer(offerToEdit);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error preparing offer for edit:", error);
      }
    },
    [prepareForEdit]
  );

  const handleDeleteClick = useCallback(
    async (offer) => {
      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to delete "${offer.title}"? This action cannot be undone.`
      );

      if (confirmed) {
        try {
          await deleteOffer(offer);
        } catch (error) {
          console.error("Error deleting offer:", error);
        }
      }
    },
    [deleteOffer]
  );

  const handleStatusToggle = useCallback(
    async (offer) => {
      try {
        await toggleOfferStatus(offer);
      } catch (error) {
        console.error("Error toggling offer status:", error);
      }
    },
    [toggleOfferStatus]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingOffer(null);
  }, []);

  const handleModalSubmit = useCallback(
    async (offerData, offerId = null) => {
      try {
        const success = await handleFormSubmit(offerData, offerId);
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
    refreshOffers();
  }, [refreshOffers]);

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title="Error Loading Offers"
      />
    );
  }

  // Loading state
  if (loading && !offers.length) {
    return <LoadingSpinner size="lg" text="Loading offers..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offers Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <OffersFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editOffer={editingOffer}
          title={editingOffer ? "Edit Offer" : "Add Offer"}
          submitting={submitting}
          hotelName={hotelName}
        />
      </Suspense>

      <div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle="Offers Management"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="Manage your promotional offers"
          />

          <PrimaryButton
            onAdd={handleAddClick}
            btnText="Add Offer"
            loading={loading}
          />
        </div>

        {/* Stats Cards */}
        {hasOffers && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Tags}
              title="Total Offers"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              title="Active Offers"
              value={stats.active}
              color="green"
            />
            <StatCard
              icon={Clock}
              title="Expired Offers"
              value={stats.expired}
              color="red"
            />
            <StatCard
              icon={Plus}
              title="Recent (7 days)"
              value={stats.recent}
              color="purple"
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasOffers && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search offers by title, description, or type..."
            totalCount={offerCount}
            filteredCount={filteredOffers.length}
            onClearSearch={handleClearSearch}
            totalLabel="total offers"
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasOffers ? (
            <>
              {hasSearchResults ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={ViewOffersColumns}
                    data={filteredOffers}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleStatusToggle}
                    loading={submitting}
                    emptyMessage="No offers match your search criteria"
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText="Add Offer"
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Tags}
              title="No Offers Yet"
              description="Create your first promotional offer to attract more customers. Offers help boost sales and customer engagement."
              actionLabel="Add Your First Offer"
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

AddOffers.displayName = "AddOffers";

export default AddOffers;

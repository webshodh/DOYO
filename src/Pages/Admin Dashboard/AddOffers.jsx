import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "../../styles/AddOffers.css";
import { PageTitle } from "../../atoms";
import { ViewOffersColumns } from "../../Constants/Columns";
import { DynamicTable } from "../../components";
import { useParams } from "react-router-dom";
import SearchWithButton from "molecules/SearchWithAddButton";
import OffersFormModal from "../../components/FormModals/OffersFormModal";
import { useOffers } from "../../customHooks/useOffers";
import { Spinner } from "react-bootstrap";

function AddOffers() {
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const { hotelName } = useParams();

  // Use custom hook for offers management
  const {
    offers,
    filteredOffers,
    searchTerm,
    loading,
    submitting,
    handleFormSubmit,
    handleSearchChange,
    deleteOffer,
    prepareForEdit,
    offerCount,
    hasOffers,
    hasSearchResults,
    toggleOfferStatus,
  } = useOffers(hotelName);

  // Handle add button click
  const handleAddClick = () => {
    setEditingOffer(null);
    setShowModal(true);
  };

  // Handle edit button click
  const handleEditClick = async (offer) => {
    const offerToEdit = await prepareForEdit(offer);
    if (offerToEdit) {
      setEditingOffer(offerToEdit);
      setShowModal(true);
    }
  };

  // Handle delete button click
  const handleDeleteClick = async (offer) => {
    await deleteOffer(offer);
  };

  // Handle status toggle
  const handleStatusToggle = async (offer) => {
    await toggleOfferStatus(offer);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  // Handle form submission from modal
  const handleModalSubmit = async (offerData, offerId = null) => {
    const success = await handleFormSubmit(offerData, offerId);
    return success;
  };

  // Loading state
  if (loading) {
    <Spinner />;
  }

  return (
    <>
      <div style={{ margin: "20px" }}>
        {/* Offers Form Modal */}
        <OffersFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editOffer={editingOffer}
          title={editingOffer ? "Edit Offer" : "Add Offer"}
          submitting={submitting}
          hotelName={hotelName}
        />

        <div style={{ width: "100%" }}>
          {/* Page Title with Stats */}
          <div className="d-flex justify-between align-items-center mb-3">
            <PageTitle pageTitle="View Offers" />
            {hasOffers && (
              <div className="text-sm text-gray-600">
                {searchTerm
                  ? `Showing ${filteredOffers.length} of ${offerCount} offers`
                  : `Total: ${offerCount} offers`}
              </div>
            )}
          </div>

          {/* Search and Add Button */}
          <div className="mb-4">
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              buttonText="Add Offer"
              onButtonClick={handleAddClick}
              disabled={submitting}
              placeholder="Search offers..."
            />
          </div>

          {/* Offers Table */}
          {hasOffers ? (
            <>
              {hasSearchResults ? (
                <DynamicTable
                  columns={ViewOffersColumns}
                  data={filteredOffers}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onToggleStatus={handleStatusToggle}
                  loading={submitting}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">
                    <i className="fas fa-search fa-3x"></i>
                  </div>
                  <h5 className="text-gray-600">No offers found</h5>
                  <p className="text-gray-500">
                    No offers match your search "{searchTerm}"
                  </p>
                  <button
                    className="btn btn-outline-primary mt-2"
                    onClick={() => handleSearchChange("")}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <i className="fas fa-tags fa-4x"></i>
              </div>
              <h5 className="text-gray-600 mb-2">No Offers Found</h5>
              <p className="text-gray-500 mb-4">
                Get started by adding your first offer
              </p>
              <button
                className="btn btn-primary"
                onClick={handleAddClick}
                disabled={submitting}
              >
                <i className="fas fa-plus me-2"></i>
                Add Your First Offer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}

export default AddOffers;

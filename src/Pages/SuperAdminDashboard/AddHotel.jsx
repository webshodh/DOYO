import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HotelFormModal from "../../components/FormModals/HotelFormModal";
import { useHotel } from "../../customHooks/useHotel";

function AddHotelWithAdmins() {
  const {
    // State
    hotelName,
    admin,
    loading,
    submitting,
    searching,

    // Actions
    setHotelName,
    updateAdmin,
    searchAdmin,
    createNewAdmin,
    submitHotelWithAdmin,
    resetForm,

    // Computed values
    getAdminValidationStatus,
    getFormValidationStatus,

    // Utilities
    adminExists,
  } = useHotel();

  const handleSubmit = async () => {
    const validationStatus = getFormValidationStatus();

    if (!validationStatus.isFormValid) {
      return;
    }

    await submitHotelWithAdmin();
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HotelFormModal
        hotelName={hotelName}
        admin={admin}
        onHotelNameChange={setHotelName}
        onUpdateAdmin={updateAdmin}
        onSearchAdmin={searchAdmin}
        onCreateNewAdmin={createNewAdmin}
        onSubmit={handleSubmit}
        onReset={resetForm}
        submitting={submitting}
        searching={searching}
        getAdminValidationStatus={getAdminValidationStatus}
        adminExists={adminExists}
      />
      <ToastContainer />
    </>
  );
}

export default AddHotelWithAdmins;

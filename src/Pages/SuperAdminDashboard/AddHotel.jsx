import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HotelFormModal from "../../components/FormModals/HotelFormModal";
import useHotel from "../../customHooks/useHotel";
import { Spinner } from "atoms";

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

  // Hotel data state (if not handled by useHotel hook)
  const [hotelData, setHotelData] = useState({
    category: "",
    contact: "",
    description: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    website: "",
    email: "",

    avgCostForTwo: "",
    gstNumber: "",
    fssaiNumber: "",
  });

  const handleHotelDataChange = (field, value) => {
    setHotelData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Contact validation helper function
  const validateContact = (contact) => {
    return /^\d{10}$/.test(contact);
  };

  const getHotelValidationStatus = () => {
    return (
      hotelData.category &&
      hotelData.contact &&
      validateContact(hotelData.contact) &&
      hotelData.address &&
      hotelData.city &&
      hotelData.district &&
      hotelData.state &&
      hotelData.pincode &&
      /^\d{6}$/.test(hotelData.pincode)
    );
  };

  // Handler functions that match the prop names
  const handleUpdateAdmin = (field, value) => {
    updateAdmin(field, value);
  };

  const handleSearchAdmin = () => {
    searchAdmin();
  };

  const handleCreateNewAdmin = () => {
    createNewAdmin();
  };

  const handleReset = () => {
    resetForm();
    setHotelData({
      category: "",
      contact: "",
      description: "",
      address: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      website: "",
      email: "",
      avgCostForTwo: "",
      gstNumber: "",
      fssaiNumber: "",
    });
  };

  const handleSubmit = async () => {
    const validationStatus = getFormValidationStatus();

    if (!validationStatus.isFormValid) {
      return;
    }

    await submitHotelWithAdmin(hotelData);
  };

  if (loading) {
    <Spinner />;
  }

  return (
    <>
      <HotelFormModal
        hotelName={hotelName}
        hotelData={hotelData}
        admin={admin}
        onHotelNameChange={setHotelName}
        onHotelDataChange={handleHotelDataChange}
        onUpdateAdmin={handleUpdateAdmin}
        onSearchAdmin={handleSearchAdmin}
        onCreateNewAdmin={handleCreateNewAdmin}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitting={submitting}
        searching={searching}
        getAdminValidationStatus={getAdminValidationStatus}
        getHotelValidationStatus={getHotelValidationStatus}
        adminExists={adminExists}
      />
      <ToastContainer />
    </>
  );
}

export default AddHotelWithAdmins;

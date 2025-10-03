// src/pages/AddHotelPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // React Router v6
import FormContainer from "../../components/Forms/FormContainer";
import {
  hotelFormSections,
  hotelFormFields,
  hotelFormInitialValues,
  getHotelValidationSchema,
} from "../../Constants/ConfigForms/addHotelFormConfig";
import { hotelServices } from "../../services/api/hotelServices"; // Your API functions
import { PageTitle } from "atoms";
import { t } from "i18next";

export default function AddHotelPage() {
  const navigate = useNavigate();
  const { id: hotelId } = useParams(); // e.g. path="/hotels/:id/edit"
  const isEditMode = Boolean(hotelId);

  const [initialValues, setInitialValues] = useState(hotelFormInitialValues);
  const [submitting, setSubmitting] = useState(false);

  // If editing, fetch existing hotel data
  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const data = await hotelServices.getHotelById(hotelId);
          setInitialValues({ ...hotelFormInitialValues, ...data });
        } catch (err) {
          console.error("Failed to load hotel:", err);
        }
      })();
    }
  }, [hotelId, isEditMode]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await hotelServices.updateHotel(hotelId, formData);
      } else {
        await hotelServices.addHotel(formData);
      }
      navigate("/super-admin/view-hotel"); // go back to listing
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // go back
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
     {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
          <PageTitle
            pageTitle={t("pages.captainManagement")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={t("descriptions.captainManagement")}
          />
        </div>

      <FormContainer
        sections={hotelFormSections}
        fieldsMap={hotelFormFields} // Changed from fieldsConfig to fieldsMap
        initialValues={initialValues}
        validationSchema={getHotelValidationSchema()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={isEditMode}
        submitText={isEditMode ? "Update Hotel" : "Create Hotel"}
        cancelText="Cancel"
        submitting={submitting}
      />
    </div>
  );
}

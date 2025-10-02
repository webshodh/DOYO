// src/pages/AddAdminPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormContainer from "../../components/Forms/FormContainer";
import {
  adminFormSections,
  adminFormFields,
  adminFormInitialValues,
  getAdminValidationSchema,
} from "../../Constants/ConfigForms/adminFormFields";
import { adminServices } from "../../services/api/adminServices";
import { useHotelsList } from "../../hooks/useHotel";

export default function AddAdminPage() {
  const navigate = useNavigate();
  const { id: adminId } = useParams();
  const isEditMode = Boolean(adminId);

  // hotels for linkedHotelId select
  const { hotels, loading: hotelsLoading } = useHotelsList();
  const hotelOptions = useMemo(
    () =>
      hotels.map((h) => ({
        value: h.hotelId,
        label: h.businessName || h.hotelName,
      })),
    [hotels]
  );

  const [initialValues, setInitialValues] = useState(adminFormInitialValues);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    let mounted = true;
    setSubmitting(true);

    adminServices
      .getAdminById(adminId)
      .then((data) => {
        if (mounted && data) {
          setInitialValues({ ...adminFormInitialValues, ...data });
        }
      })
      .catch((err) => console.error("Failed to load admin:", err))
      .finally(() => mounted && setSubmitting(false));

    return () => {
      mounted = false;
    };
  }, [isEditMode, adminId]);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const goToList = useCallback(
    () => navigate("/super-admin/view-admin"),
    [navigate]
  );

  const handleSubmit = useCallback(
    async (formData) => {
      setSubmitting(true);
      try {
        if (isEditMode) {
          await adminServices.updateAdmin(adminId, formData);
        } else {
          await adminServices.addAdmin(formData);
        }
        goToList();
      } catch (err) {
        console.error("Submit failed:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [isEditMode, adminId, goToList]
  );

  // Build sections with actual fields arrays & inject hotel options
  const sectionsWithFields = useMemo(
    () =>
      adminFormSections.map((section) => {
        const key = section.fields; // e.g. "roleAccess"
        const fieldsArray = adminFormFields[key] || [];
        const mappedFields = fieldsArray.map((f) =>
          f.name === "linkedHotelId"
            ? { ...f, options: hotelOptions, loading: hotelsLoading }
            : f
        );
        return { ...section, fields: mappedFields };
      }),
    [hotelOptions, hotelsLoading]
  );

  // Flatten for FormContainer
  const fieldsConfig = useMemo(
    () => sectionsWithFields.flatMap((sec) => sec.fields),
    [sectionsWithFields]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Admin" : "Create New Admin"}
        </h1>
      </div>

      <FormContainer
        sections={sectionsWithFields}
        fieldsConfig={fieldsConfig}
        initialValues={initialValues}
        validationSchema={getAdminValidationSchema()}
        onSubmit={handleSubmit}
        onCancel={goBack}
        isEditMode={isEditMode}
        submitText={isEditMode ? "Update Admin" : "Create Admin"}
        cancelText="Cancel"
        submitting={submitting}
      />
    </div>
  );
}

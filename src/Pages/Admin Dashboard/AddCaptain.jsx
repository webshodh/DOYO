import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormContainer from "../../components/Forms/FormContainer";
import { captainFormConfig } from "../../Constants/ConfigForms/captainFormConfig";
import { captainServices } from "../../services/api/captainServices";
import { validateCaptainForm } from "../../validation/captainValidation";

export default function AddCaptainPage() {
  const navigate = useNavigate();
  const { id: captainId } = useParams();
  const isEditMode = Boolean(captainId);

  const [initialValues, setInitialValues] = useState({});

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const data = await captainServices.getCaptainById(captainId);
          setInitialValues({ ...data });
        } catch (error) {
          console.error("Failed to load captain:", error);
        }
      })();
    } else {
      // Prepare initial values from config
      const defaultValues = {};
      captainFormConfig.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.type === "photo") defaultValues[field.name] = null;
          else defaultValues[field.name] = field.defaultValue ?? "";
        });
      });
      setInitialValues(defaultValues);
    }
  }, [captainId, isEditMode]);

  // Wrap your validateCaptainForm for FormContainer.validate
  const validationSchema = {
    validate: (values) => {
      const validation = validateCaptainForm(values);
      return validation.errors;
    },
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await captainServices.updateCaptain(captainId, formData);
      } else {
        await captainServices.addCaptain(formData);
      }
      navigate("/captains");
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Captain" : "Add New Captain"}
        </h1>
      </div>

      <FormContainer
        sections={captainFormConfig.sections}
        fieldsConfig={captainFormConfig.sections.reduce((acc, section) => {
          acc[section.id] = section.fields;
          return acc;
        }, {})}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={isEditMode}
        submitText={isEditMode ? "Update Captain" : "Add Captain"}
        cancelText="Cancel"
        submitting={submitting}
      />
    </div>
  );
}

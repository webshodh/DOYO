// src/pages/AddSubscriptionPlanPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormContainer from "../../components/Forms/FormContainer";
import {
  subscriptionFormSections,
  subscriptionFormFields,
  subscriptionFormInitialValues,
  getSubscriptionValidationSchema,
} from "../../Constants/ConfigForms/subscriptionFormFields";
import { subscriptionServices } from "../../services/api/subscriptionPlanServices"; // Your API helpers

export default function AddSubscriptionPlanPage() {
  const navigate = useNavigate();
  const { id: planId } = useParams();
  const isEditMode = Boolean(planId);

  const [initialValues, setInitialValues] = useState(
    subscriptionFormInitialValues
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const data = await subscriptionServices.getPlanById(planId);
          setInitialValues({ ...subscriptionFormInitialValues, ...data });
        } catch (error) {
          console.error("Failed to load subscription plan:", error);
        }
      })();
    }
  }, [planId, isEditMode]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await subscriptionServices.updatePlan(planId, formData);
      } else {
        await subscriptionServices.addPlan(formData);
      }
      navigate("/subscriptions");
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Subscription Plan" : "Create New Plan"}
        </h1>
      </div>

      <FormContainer
        sections={subscriptionFormSections}
        fieldsConfig={subscriptionFormSections.reduce((acc, section) => {
          acc[section.title] = subscriptionFormFields[section.fields];
          return acc;
        }, {})}
        initialValues={initialValues}
        validationSchema={getSubscriptionValidationSchema()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={isEditMode}
        submitText={isEditMode ? "Update Plan" : "Create Plan"}
        cancelText="Cancel"
        submitting={submitting}
      />
    </div>
  );
}

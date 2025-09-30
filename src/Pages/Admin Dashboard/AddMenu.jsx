// src/pages/AddMenuItemPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormContainer from "../../components/Forms/FormContainer";
import {
  FORM_CONFIG,
  specialCategories,
} from "../../Constants/ConfigForms/addMenuFormConfig";
import { menuServices } from "../../services/api/menuService";

// Build default initial values from FORM_CONFIG
const buildInitialValues = () => {
  const values = {};
  FORM_CONFIG.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const name = field.name;
      if (field.type === "checkbox") {
        values[name] = false;
      } else if (field.type === "multiselect") {
        values[name] = [];
      } else {
        values[name] = "";
      }
    });
  });
  return values;
};

export default function AddMenuPage() {
  const navigate = useNavigate();
  const { id: menuId } = useParams();
  const isEditMode = Boolean(menuId);

  const [initialValues, setInitialValues] = useState(buildInitialValues());
  const [submitting, setSubmitting] = useState(false);

  // Load existing menu item in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    let mounted = true;
    setSubmitting(true);

    menuServices
      .getMenuItemById(menuId)
      .then((data) => {
        if (!mounted || !data) return;
        setInitialValues((prev) => ({
          ...prev,
          ...data,
          nutritionalInfo: {
            protein: "",
            carbs: "",
            fat: "",
            fiber: "",
            ...(data.nutritionalInfo || {}),
          },
          allergens: Array.isArray(data.allergens) ? data.allergens : [],
        }));
      })
      .catch((err) => console.error("Failed to load menu item:", err))
      .finally(() => mounted && setSubmitting(false));

    return () => {
      mounted = false;
    };
  }, [isEditMode, menuId]);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const goToMenuList = useCallback(() => navigate("/menu"), [navigate]);

  const handleSubmit = useCallback(
    async (formData) => {
      setSubmitting(true);

      const submissionData = {
        ...formData,
        menuPrice: parseFloat(formData.menuPrice) || 0,
        discount: parseFloat(formData.discount) || 0,
        finalPrice:
          parseFloat(formData.finalPrice) ||
          parseFloat(formData.menuPrice) ||
          0,
        calories: parseInt(formData.calories) || 0,
        menuCookingTime: parseInt(formData.menuCookingTime) || 0,
        servingSize: parseInt(formData.servingSize) || 1,
        nutritionalInfo: {
          protein: parseFloat(formData["nutritionalInfo.protein"]) || 0,
          carbs: parseFloat(formData["nutritionalInfo.carbs"]) || 0,
          fat: parseFloat(formData["nutritionalInfo.fat"]) || 0,
          fiber: parseFloat(formData["nutritionalInfo.fiber"]) || 0,
        },
        allergens: Array.isArray(formData.allergens) ? formData.allergens : [],
        chefSpecial: Boolean(formData.chefSpecial),
        isPopular: Boolean(formData.isPopular),
        isVegan: Boolean(formData.isVegan),
        isGlutenFree: Boolean(formData.isGlutenFree),
        ...(isEditMode && formData.createdAt
          ? { createdAt: formData.createdAt }
          : {}),
        updatedAt: new Date().toISOString(),
      };

      try {
        if (isEditMode) {
          await menuServices.updateMenuItem(menuId, submissionData);
        } else {
          await menuServices.addMenuItem(submissionData);
        }
        goToMenuList();
      } catch (err) {
        console.error("Submit failed:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [isEditMode, menuId, goToMenuList]
  );

  const sections = useMemo(() => FORM_CONFIG.sections, []);
  const fieldsConfig = useMemo(
    () => sections.flatMap((section) => section.fields),
    [sections]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Menu Item" : "Add New Menu Item"}
        </h1>
      </div>

      <FormContainer
        sections={sections}
        fieldsConfig={fieldsConfig}
        specialCategories={specialCategories}
        initialValues={initialValues}
        validationSchema={null /* replace with your Yup schema */}
        onSubmit={handleSubmit}
        onCancel={goBack}
        isEditMode={isEditMode}
        submitText={isEditMode ? "Update Menu Item" : "Add Menu Item"}
        cancelText="Cancel"
        submitting={submitting}
      />
    </div>
  );
}

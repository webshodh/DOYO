// src/components/form/FormContainer.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import FormSection from "./FormSection";
import { FormCancelButton, FormSubmitButton } from "./FormActions";

export default function FormContainer({
  sections,
  initialValues,
  validationSchema = null,
  onSubmit,
  onCancel,
  isEditMode,
  submitText,
  cancelText,
  submitting,
}) {
  const [data, setData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setData(initialValues);
    setErrors({});
    setDirty(false);
  }, [initialValues]);

  const runValidation = useCallback(
    (values) => {
      try {
        return validationSchema?.validate(values) || {};
      } catch {
        return {};
      }
    },
    [validationSchema],
  );

  useEffect(() => {
    if (dirty) {
      setErrors(runValidation(data));
    }
  }, [data, dirty, runValidation]);

  const handleChange = useCallback((name, value) => {
    setData((prev) => {
      if (name.includes(".")) {
        const [p, c] = name.split(".");
        return { ...prev, [p]: { ...prev[p], [c]: value } };
      }
      return { ...prev, [name]: value };
    });
    setDirty(true);
  }, []);

  const canSubmit = useMemo(() => {
    if (submitting || !dirty) return false;
    const errs = runValidation(data);
    return Object.keys(errs).length === 0;
  }, [data, dirty, submitting, runValidation]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const errs = runValidation(data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      await onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      {sections.map((section) => (
        <FormSection
          key={section.title}
          title={section.title}
          description={section.description}
          icon={section.icon}
          fields={section.fields}
          data={data}
          errors={errors}
          disabled={submitting}
          onChange={handleChange}
        />
      ))}

      <div className="sticky bottom-0 bg-white border-t-2 border-gray-100 shadow-lg p-6 flex justify-between">
        <FormCancelButton
          onCancel={onCancel}
          disabled={submitting}
          text={cancelText}
        />
        <FormSubmitButton
          onClick={handleSubmitForm}
          disabled={!canSubmit}
          isEditMode={isEditMode}
          isLoading={submitting}
          text={submitText}
        />
      </div>
    </form>
  );
}

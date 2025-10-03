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
  fieldsMap, // Add this prop to handle field mapping
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
    [validationSchema]
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
      {sections.map((section) => {
        // Handle field mapping: convert string field keys to actual field arrays
        let actualFields = section.fields;

        // If fieldsMap is provided and section.fields is a string, map it to actual fields
        if (fieldsMap && typeof section.fields === "string") {
          actualFields = fieldsMap[section.fields] || [];
        }

        // If section.fields is already an array, use it directly
        if (Array.isArray(section.fields)) {
          actualFields = section.fields;
        }

        return (
          <FormSection
            key={section.title}
            title={section.title}
            description={section.description}
            icon={section.icon}
            fields={actualFields} // Pass resolved fields array
            data={data}
            errors={errors}
            disabled={submitting}
            onChange={handleChange}
          />
        );
      })}

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

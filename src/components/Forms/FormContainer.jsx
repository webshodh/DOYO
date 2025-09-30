// src/components/form/FormContainer.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import FormSection from "./FormSection";
import { FormCancelButton, FormSubmitButton } from "./FormActions";

export default function FormContainer({
  sections,
  initialValues,
  validationSchema,
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
  const [expanded, setExpanded] = useState({});
  const firstRef = useRef();

  // Expand first section on mount
  useEffect(() => {
    if (sections.length) {
      setExpanded({ [sections[0].title]: true });
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [sections]);

  // Validate when dirty
  useEffect(() => {
    if (dirty) {
      setErrors(validationSchema.validate(data));
    }
  }, [data, dirty, validationSchema]);

  const handleChange = useCallback((name, value) => {
    setData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: { ...prev[parent], [child]: value },
        };
      }
      return { ...prev, [name]: value };
    });
    setDirty(true);
  }, []);

  const toggleSection = useCallback((title) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const canSubmit = useMemo(() => {
    const errs = validationSchema.validate(data);
    return Object.keys(errs).length === 0 && dirty && !submitting;
  }, [data, dirty, submitting, validationSchema]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const errs = validationSchema.validate(data);
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
          isExpanded={expanded[section.title]}
          onToggle={toggleSection}
          onChange={handleChange}
          firstFieldRef={firstRef}
        />
      ))}

      <div className="sticky bottom-0 bg-white border-t-2 border-gray-100 rounded-t-2xl shadow-lg p-6 mt-8 flex justify-between">
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

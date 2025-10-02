// src/components/form/fields/CheckboxField.jsx
import React from "react";

export default function CheckboxField({
  label,
  name,
  value,
  onChange,
  description,
}) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(name, e.target.checked)}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
      />
      <label className="text-sm">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

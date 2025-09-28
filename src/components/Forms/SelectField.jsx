// src/components/form/fields/SelectField.jsx
import React from "react";

export default function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  required,
  placeholder,
  options,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

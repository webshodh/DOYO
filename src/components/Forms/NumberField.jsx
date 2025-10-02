// src/components/form/fields/NumberField.jsx
import React from "react";

export default function NumberField({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  required,
  min,
  max,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 ${
          error ? "border-red-400 bg-red-50" : "border-gray-200"
        }`}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

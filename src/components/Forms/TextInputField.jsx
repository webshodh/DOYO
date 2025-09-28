// src/components/form/fields/TextInputField.jsx
import React from "react";

export default function TextInputField({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  required,
  description,
  inputRef,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 ${
          error ? "border-red-400 bg-red-50" : "border-gray-200"
        }`}
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

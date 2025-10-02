import React, { useState } from "react";

export default function PasswordInputField({
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
  const [showsPassword, setShowsPassword] = useState(false);

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        ref={inputRef}
        type={showsPassword ? "text" : "password"}
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
      <button
        type="button"
        onClick={() => setShowsPassword((s) => !s)}
        className="absolute right-4 top-12 text-gray-500"
      >
        {showsPassword ? "Hide" : "Show"}
      </button>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

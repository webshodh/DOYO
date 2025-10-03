// components/common/FormInput.jsx
import { AlertCircle } from "lucide-react";

const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  min,
  max,
  maxLength,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        required={required}
        min={min}
        max={max}
        maxLength={maxLength}
      />

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default FormInput;

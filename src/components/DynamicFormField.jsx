const DynamicFormField = ({ field, value, onChange }) => {
  const baseClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200";

  return (
    <div className="relative md:col-span-2 mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
      </label>

      {/* Text / Number */}
      {(field.type === "text" || field.type === "number") && (
        <input
          type={field.type}
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseClass}
          placeholder={field.placeholder}
          required={field.required}
          readOnly={field.readOnly}
        />
      )}

      {/* Textarea */}
      {field.type === "textarea" && (
        <textarea
          rows="3"
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseClass}
          placeholder={field.placeholder}
          required={field.required}
        />
      )}

      {/* Select */}
      {field.type === "select" && (
        <select
          name={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseClass}
        >
          <option value="">Select {field.label}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* Checkbox */}
      {field.type === "checkbox" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span>{field.label}</span>
        </div>
      )}

      {/* Radio */}
      {field.type === "radio" && (
        <div className="flex gap-4 flex-wrap">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name={field.name}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {/* Multi-checkbox (for allergens, tags etc.) */}
      {field.type === "multicheckbox" && (
        <div className="flex flex-wrap gap-3">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={() => {
                  if (value.includes(opt)) {
                    onChange(
                      field.name,
                      value.filter((v) => v !== opt)
                    );
                  } else {
                    onChange(field.name, [...value, opt]);
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicFormField
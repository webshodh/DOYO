import { CheckCircle } from "lucide-react";
import { OPTIONS } from "Constants/formConfig";

// Default form values
export const getDefaultFormData = () => ({
  // Basic Information
  menuName: "",
  menuContent: "",
  ingredients: "",
  menuCookingTime: "",
  servingSize: "",

  // Pricing & Timing
  menuPrice: "",
  discount: "",
  finalPrice: "",
  calories: "",

  // Categories & Classification
  mainCategory: "",
  menuCategory: "",
  categoryType: "",
  mealType: "",
  spiceLevel: "",
  portionSize: "",

  // Preparation Details
  preparationMethod: "",
  difficulty: "",
  availability: "Available",
  cuisineType: "",
  tasteProfile: "",
  texture: "",
  cookingStyle: "",

  // Nutritional Information
  nutritionalInfo: {
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
  },

  // File and Image
  file: null,
  existingImageUrl: "",
  imageUrl: "",

  // Special Features (Boolean flags)
  chefSpecial: false,
  isPopular: false,
  isVegan: false,
  isGlutenFree: false,
  isRecommended: false,
  isSugarFree: false,
  isMostOrdered: false,
  isSeasonal: false,
  isLimitedEdition: false,
  isOrganic: false,
  isHighProtein: false,
  isLactoseFree: false,
  isJainFriendly: false,
  isKidsFriendly: false,
  isBeverageAlcoholic: false,

  // Allergens (Array)
  allergens: [],
});

// Utility function to get nested value
export const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

// Utility function to set nested value
export const setNestedValue = (obj, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return { ...obj };
};

// Reusable form field component
export const FormField = ({
  field,
  value,
  onChange,
  externalOptions,
  disabled = false,
}) => {
  const fieldValue = field.name.includes(".")
    ? getNestedValue(value, field.name)
    : value[field.name] ||
      (field.type === "checkbox"
        ? false
        : field.type === "multiselect"
        ? []
        : "");

  const handleChange = (newValue) => {
    if (disabled) return;

    if (field.name.includes(".")) {
      onChange(setNestedValue(value, field.name, newValue));
    } else {
      onChange({ ...value, [field.name]: newValue });
    }
  };

  const getFieldOptions = () => {
    // Handle external options (categories and mainCategories)
    if (typeof field.options === "string") {
      // First check external options
      if (externalOptions?.[field.options]) {
        const options = externalOptions[field.options];
        return Array.isArray(options) ? options : [];
      }

      // Then check static OPTIONS
      if (OPTIONS[field.options]) {
        return OPTIONS[field.options];
      }

      return [];
    }

    // Handle direct array options
    return Array.isArray(field.options) ? field.options : [];
  };

  const fieldOptions = getFieldOptions();

  const getColSpanClass = () => {
    if (!field.colSpan) return "";
    return field.colSpan === 2 ? "md:col-span-2" : `col-span-${field.colSpan}`;
  };

  switch (field.type) {
    case "textarea":
      return (
        <div className={`relative ${getColSpanClass()}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && "*"}
          </label>
          <textarea
            rows={field.rows || 3}
            value={fieldValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder={field.placeholder}
            required={field.required}
          />
          {fieldValue && field.required && (
            <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
          )}
        </div>
      );

    case "select":
      return (
        <div className={`relative ${getColSpanClass()}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && "*"}
          </label>
          <select
            value={fieldValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required={field.required}
          >
            <option value="">
              {field.placeholder || `Select ${field.label.toLowerCase()}`}
            </option>
            {fieldOptions.map((option, index) => {
              // Handle different option structures
              let optionValue, optionLabel;

              if (typeof option === "object" && option !== null) {
                // Handle object options - check various property names
                optionValue =
                  option.value ||
                  option._id ||
                  option.id ||
                  option.categoryName ||
                  option.name;
                optionLabel =
                  option.label ||
                  option.categoryName ||
                  option.name ||
                  option.value;
              } else {
                // Handle string options
                optionValue = option;
                optionLabel = option;
              }

              return (
                <option key={`${field.name}-${index}`} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
          {fieldValue && field.required && (
            <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
          )}
        </div>
      );

    case "checkbox":
      const IconComponent = field.icon;
      return (
        <label
          className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
            disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"
          }`}
        >
          <input
            type="checkbox"
            checked={Boolean(fieldValue)}
            onChange={(e) => handleChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 disabled:cursor-not-allowed"
          />
          <div className="flex items-center gap-2">
            {IconComponent && (
              <IconComponent
                className={`w-4 h-4 text-${field.iconColor || "gray"}-500`}
              />
            )}
            <span className="text-sm font-medium">{field.label}</span>
          </div>
        </label>
      );

    case "multiselect":
      return (
        <div className={getColSpanClass()}>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {field.label} {field.required && "*"}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-32 overflow-y-auto">
            {fieldOptions.map((option, index) => {
              const optionValue =
                typeof option === "object" && option !== null
                  ? option.value || option.name || option
                  : option;
              const isSelected =
                Array.isArray(fieldValue) && fieldValue.includes(optionValue);

              return (
                <label
                  key={`${field.name}-multiselect-${index}`}
                  className={`flex items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                    disabled
                      ? "cursor-not-allowed opacity-75"
                      : "cursor-pointer"
                  } ${
                    isSelected
                      ? "border-red-500 bg-red-100 text-red-700"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (disabled) return;
                      const currentValues = Array.isArray(fieldValue)
                        ? fieldValue
                        : [];
                      const newValues = e.target.checked
                        ? [...currentValues, optionValue]
                        : currentValues.filter((v) => v !== optionValue);
                      handleChange(newValues);
                    }}
                    disabled={disabled}
                    className="sr-only"
                  />
                  <span className="text-center">{optionValue}</span>
                </label>
              );
            })}
          </div>
          {fieldOptions.length === 0 && (
            <p className="text-sm text-gray-500 italic">No options available</p>
          )}
        </div>
      );

    default: // text, number, email, etc.
      return (
        <div className={`relative ${getColSpanClass()}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && "*"}
          </label>
          <input
            type={field.type}
            value={fieldValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled || field.readonly}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              field.readonly ? "bg-gray-100 text-green-600 font-bold" : ""
            }`}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            readOnly={field.readonly}
            required={field.required}
          />
          {fieldValue && field.required && !field.readonly && (
            <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
          )}
        </div>
      );
  }
};

export const FormSection = ({
  section,
  formData,
  onChange,
  externalOptions,
  disabled = false,
}) => {
  const IconComponent = section.icon;
  const bgColorClass = `bg-${section.bgColor}-50`;
  const borderColorClass = `border-${section.bgColor}-200`;
  const iconColorClass = `text-${section.bgColor}-500`;

  return (
    <div
      className={`${bgColorClass} rounded-xl p-6 border ${borderColorClass} ${
        disabled ? "opacity-75" : ""
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <IconComponent className={`w-5 h-5 ${iconColorClass}`} />
        {section.title}
      </h3>

      <div
        className={`grid grid-cols-1 ${
          section.id === "features" ? "space-y-4" : "md:grid-cols-2 gap-4"
        } ${section.id === "nutrition" ? "md:grid-cols-4" : ""}`}
      >
        {section.id === "features" ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {section.fields
                .filter((f) => f.type === "checkbox")
                .map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={formData}
                    onChange={onChange}
                    externalOptions={externalOptions}
                    disabled={disabled}
                  />
                ))}
            </div>
            {section.fields
              .filter((f) => f.type !== "checkbox")
              .map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={formData}
                  onChange={onChange}
                  externalOptions={externalOptions}
                  disabled={disabled}
                />
              ))}
          </>
        ) : (
          section.fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={formData}
              onChange={onChange}
              externalOptions={externalOptions}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
};

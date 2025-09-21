// src/utils/FormUtils.jsx
import { CheckCircle } from "lucide-react";
import { simplifyOptions } from "./ConvertOptions";

// ✅ NEW: Import Firestore-based hooks
import { useOffers } from "../hooks/useOffers";
import { useCategory } from "../hooks/useCategory";
import { useMemo } from "react";

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

// ✅ NEW: Enhanced options hook that combines multiple data sources
const useFormOptions = (hotelName) => {
  // ✅ Use Firestore-based hooks
  const { offers, loading: offersLoading } = useOffers(hotelName);
  const { categories, loading: categoriesLoading } = useCategory(hotelName);

  // ✅ Create simplified options structure for backward compatibility
  const optionsData = useMemo(() => {
    if (offersLoading || categoriesLoading) return {};

    // Build options structure similar to the old API
    const combinedOptions = {};

    // Add categories if available
    if (categories && categories.length > 0) {
      combinedOptions.categories = categories.map(cat => ({
        id: cat.id,
        name: cat.name || cat.categoryName,
        value: cat.name || cat.categoryName,
        label: cat.name || cat.categoryName,
      }));
    }

    // Add offers/deals if available
    if (offers && offers.length > 0) {
      combinedOptions.offers = offers.map(offer => ({
        id: offer.id,
        name: offer.title || offer.name,
        value: offer.title || offer.name,
        label: offer.title || offer.name,
      }));
    }

    // Add static options that don't come from Firestore
    combinedOptions.spiceLevel = [
      "Mild", "Medium", "Spicy", "Extra Spicy"
    ];

    combinedOptions.mealType = [
      "Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Beverage"
    ];

    combinedOptions.cuisineType = [
      "Indian", "Chinese", "Italian", "Mexican", "Thai", "Continental", "Fast Food"
    ];

    combinedOptions.difficulty = [
      "Easy", "Medium", "Hard"
    ];

    combinedOptions.preparationMethod = [
      "Grilled", "Fried", "Baked", "Steamed", "Boiled", "Raw", "Roasted"
    ];

    combinedOptions.cookingStyle = [
      "Traditional", "Modern", "Fusion", "Quick", "Slow Cooked"
    ];

    combinedOptions.tasteProfile = [
      "Sweet", "Salty", "Sour", "Bitter", "Umami", "Spicy"
    ];

    combinedOptions.texture = [
      "Crispy", "Soft", "Chewy", "Smooth", "Crunchy", "Creamy"
    ];

    combinedOptions.portionSize = [
      "Small", "Medium", "Large", "Extra Large"
    ];

    combinedOptions.allergens = [
      "Nuts", "Dairy", "Gluten", "Eggs", "Soy", "Seafood", "Shellfish"
    ];

    combinedOptions.availability = [
      "Available", "Out of Stock", "Seasonal"
    ];

    return combinedOptions;
  }, [categories, offers, categoriesLoading, offersLoading]);

  return {
    optionsData,
    loading: offersLoading || categoriesLoading,
  };
};

// Reusable form field component
export const FormField = ({
  field,
  value,
  onChange,
  externalOptions,
  disabled = false,
  hotelName,
}) => {
  // ✅ UPDATED: Use the new Firestore-based options hook
  const { optionsData, loading: optionsLoading } = useFormOptions(hotelName);
  const OPTIONS = simplifyOptions(optionsData);

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

  // ✅ ENHANCED: Better options handling with Firestore integration
  const getFieldOptions = () => {
    if (typeof field.options === "string") {
      // Debug logs to help identify the issue
      console.log(`Looking for options for field: ${field.options}`);
      console.log('External options available:', Object.keys(externalOptions || {}));
      console.log('Dynamic OPTIONS available:', Object.keys(OPTIONS || {}));
      
      // First check external options (categories, mainCategories passed from parent)
      if (externalOptions?.[field.options]) {
        const options = externalOptions[field.options];
        console.log(`Found in external options:`, options);
        return Array.isArray(options) ? options : [];
      }

      // Then check dynamic options from Firestore (simplified options)
      if (OPTIONS && OPTIONS[field.options]) {
        console.log(`Found in dynamic OPTIONS:`, OPTIONS[field.options]);
        return OPTIONS[field.options];
      }

      // Try common variations of the field name
      const variations = [
        field.options,
        field.options.toLowerCase(),
        field.options.replace(/s$/, ''), // Remove trailing 's'
        field.options + 's', // Add trailing 's'
        field.options.replace(/([A-Z])/g, '_$1').toLowerCase(), // camelCase to snake_case
        field.options.replace(/_/g, ''), // Remove underscores
      ];

      for (const variation of variations) {
        if (OPTIONS && OPTIONS[variation]) {
          console.log(`Found with variation '${variation}':`, OPTIONS[variation]);
          return OPTIONS[variation];
        }
      }

      // ✅ NEW: Enhanced fallback options based on field type
      const fallbackOptions = getFallbackOptions(field.options);
      if (fallbackOptions.length > 0) {
        console.log(`Using fallback options for ${field.options}:`, fallbackOptions);
        return fallbackOptions;
      }

      // Fallback: return empty array if no options found
      console.warn(`No options found for field: ${field.options}`);
      console.warn('Available option keys:', Object.keys(OPTIONS || {}));
      return [];
    }

    // Handle direct array options
    return Array.isArray(field.options) ? field.options : [];
  };

  // ✅ NEW: Provide fallback options for common field types
  const getFallbackOptions = (fieldType) => {
    const fallbacks = {
      spiceLevel: ["Mild", "Medium", "Spicy", "Extra Spicy"],
      mealType: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Beverage"],
      cuisineType: ["Indian", "Chinese", "Italian", "Mexican", "Thai", "Continental"],
      difficulty: ["Easy", "Medium", "Hard"],
      preparationMethod: ["Grilled", "Fried", "Baked", "Steamed", "Boiled"],
      cookingStyle: ["Traditional", "Modern", "Fusion"],
      tasteProfile: ["Sweet", "Salty", "Sour", "Bitter", "Umami", "Spicy"],
      texture: ["Crispy", "Soft", "Chewy", "Smooth", "Crunchy", "Creamy"],
      portionSize: ["Small", "Medium", "Large", "Extra Large"],
      allergens: ["Nuts", "Dairy", "Gluten", "Eggs", "Soy", "Seafood"],
      availability: ["Available", "Out of Stock", "Seasonal"],
      categoryType: ["Main Course", "Appetizer", "Dessert", "Beverage", "Side Dish"],
    };

    return fallbacks[fieldType] || fallbacks[fieldType.toLowerCase()] || [];
  };

  const fieldOptions = getFieldOptions();

  const getColSpanClass = () => {
    if (!field.colSpan) return "";
    return field.colSpan === 2 ? "md:col-span-2" : `col-span-${field.colSpan}`;
  };

  // ✅ NEW: Show loading state for options
  if (optionsLoading && field.type === "select" && typeof field.options === "string") {
    return (
      <div className={`relative ${getColSpanClass()}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label} {field.required && "*"}
        </label>
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-gray-500 text-sm">Loading options...</span>
        </div>
      </div>
    );
  }

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
            disabled={disabled || optionsLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required={field.required}
          >
            <option value="">
              {optionsLoading 
                ? "Loading..." 
                : field.placeholder || `Select ${field.label.toLowerCase()}`}
            </option>
            {fieldOptions.map((option, index) => {
              let optionValue, optionLabel;

              if (typeof option === "object" && option !== null) {
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
          {/* ✅ NEW: Show option count */}
          {fieldOptions.length === 0 && !optionsLoading && (
            <div className="absolute top-10 right-3 text-xs text-gray-400">
              No options
            </div>
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
            {optionsLoading && (
              <span className="ml-2 text-xs text-gray-500">(Loading options...)</span>
            )}
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
                    disabled || optionsLoading
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
                      if (disabled || optionsLoading) return;
                      const currentValues = Array.isArray(fieldValue)
                        ? fieldValue
                        : [];
                      const newValues = e.target.checked
                        ? [...currentValues, optionValue]
                        : currentValues.filter((v) => v !== optionValue);
                      handleChange(newValues);
                    }}
                    disabled={disabled || optionsLoading}
                    className="sr-only"
                  />
                  <span className="text-center">{optionValue}</span>
                </label>
              );
            })}
          </div>
          {fieldOptions.length === 0 && !optionsLoading && (
            <p className="text-sm text-gray-500 italic">
              No options available for {field.label.toLowerCase()}
            </p>
          )}
          {optionsLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm text-gray-500">Loading options...</span>
            </div>
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

// ✅ ENHANCED: FormSection component with better error handling
export const FormSection = ({
  section,
  formData,
  onChange,
  externalOptions,
  disabled = false,
  hotelName,
}) => {
  const IconComponent = section.icon;
  const bgColorClass = `bg-${section.bgColor}-50`;
  const borderColorClass = `border-${section.bgColor}-200`;
  const iconColorClass = `text-${section.bgColor}-500`;

  // ✅ NEW: Get loading state for the section
  const { loading: optionsLoading } = useFormOptions(hotelName);

  return (
    <div
      className={`${bgColorClass} rounded-xl p-6 border ${borderColorClass} ${
        disabled ? "opacity-75" : ""
      } ${optionsLoading ? "relative" : ""}`}
    >
      {/* ✅ NEW: Loading overlay for sections */}
      {optionsLoading && (
        <div className="absolute top-2 right-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <IconComponent className={`w-5 h-5 ${iconColorClass}`} />
        {section.title}
        {optionsLoading && (
          <span className="text-xs text-gray-500">(Loading...)</span>
        )}
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
                    hotelName={hotelName}
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
                  hotelName={hotelName}
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
              hotelName={hotelName}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ✅ NEW: Export the options hook for use in other components
export { useFormOptions };

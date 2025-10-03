import React, { memo } from "react";
import * as Icons from "lucide-react";
import TextInputField from "./TextInputField";
import SelectField from "./SelectField";
import TextareaField from "./TextareaField";
import CheckboxField from "./CheckboxField";
import NumberField from "./NumberField";
import PasswordInputField from "./PasswordInputField";
import DateField from "./DateField";

const componentMap = {
  text: TextInputField,
  email: TextInputField,
  tel: TextInputField,
  url: TextInputField,
  select: SelectField,
  textarea: TextareaField,
  checkbox: CheckboxField,
  number: NumberField,
  password: PasswordInputField,
  date: DateField,
};

export default memo(function FormSection({
  title,
  description,
  icon,
  fields,
  data,
  errors,
  disabled,
  onChange,
  // Add these props to handle the field mapping
  fieldsMap = null, // This would be hotelFormFields or subscriptionFormFields
}) {
  const IconComponent = Icons[icon] || Icons.Info;

  // Handle both patterns: direct array or string key
  let actualFields = fields;

  if (typeof fields === "string" && fieldsMap) {
    actualFields = fieldsMap[fields] || [];
  }

  // Safety check: ensure fields is an array
  if (!Array.isArray(actualFields)) {
    console.error(
      "FormSection: fields must be an array or valid field key, received:",
      typeof fields,
      fields
    );
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <div className="text-red-600">
          <h3 className="font-bold text-lg">Error: Invalid Fields Data</h3>
          <p className="text-sm mt-1">
            Expected an array of fields or valid field key, but received:{" "}
            {typeof fields}
          </p>
        </div>
      </div>
    );
  }

  // Additional safety check for empty array
  if (actualFields.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
        <div className="text-gray-600">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm mt-1">No fields available for this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-4 p-6 bg-blue-50">
        <div className="p-3 rounded-xl bg-blue-500 text-white">
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <div className="p-6 bg-white space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {actualFields.map((field) => {
            // Safety check for each field
            if (!field || !field.name || !field.type) {
              console.warn("Invalid field structure:", field);
              return null;
            }

            const { name, type } = field;
            const Component = componentMap[type];

            // Check if component exists for this field type
            if (!Component) {
              console.warn(`No component found for field type: ${type}`);
              return (
                <div key={name} className="text-red-600 text-sm">
                  Unknown field type: {type}
                </div>
              );
            }

            // Handle nested field values
            const value = name.includes(".")
              ? data[name.split(".")[0]]?.[name.split(".")[1]]
              : data[name];

            const error = errors[name];

            return (
              <Component
                key={name}
                {...field}
                value={value}
                error={error}
                disabled={disabled}
                onChange={onChange}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

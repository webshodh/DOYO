// src/components/form/FormSection.jsx
import React, { memo } from "react";
import * as Icons from "lucide-react";
import TextInputField from "./TextInputField";
import SelectField from "./SelectField";
import TextareaField from "./TextareaField";
import CheckboxField from "./CheckboxField";
import NumberField from "./NumberField";

const componentMap = {
  text: TextInputField,
  email: TextInputField,
  tel: TextInputField,
  url: TextInputField,
  select: SelectField,
  textarea: TextareaField,
  checkbox: CheckboxField,
  number: NumberField,
};

export default memo(function FormSection({
  title,
  description,
  icon,
  fields,
  data,
  errors,
  disabled,
  isExpanded,
  onToggle,
  onChange,
  firstFieldRef,
}) {
  const IconComponent = Icons[icon] || Icons.Info;

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button
        type="button"
        onClick={() => onToggle(title)}
        className={`w-full flex items-center justify-between p-6 text-left ${
          isExpanded ? "bg-blue-50" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              isExpanded
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <span className="text-gray-400">{isExpanded ? "–" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fields.map((field) => {
              const name = field.name;
              const Component = componentMap[field.type];
              const refProp = name === fields[0].name ? firstFieldRef : null;
              return (
                <Component
                  key={name}
                  {...field}
                  value={data[name]}
                  error={errors[name]}
                  disabled={disabled}
                  onChange={onChange}
                  inputRef={refProp}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

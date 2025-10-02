// src/components/form/FormSection.jsx
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
}) {
  const IconComponent = Icons[icon] || Icons.Info;

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
          {fields.map((field) => {
            const { name, type } = field;
            const Component = componentMap[type];
            // nested field?
            const value = name.includes(".")
              ? data[name.split(".")[0]][name.split(".")[1]]
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

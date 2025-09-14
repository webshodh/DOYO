// components/DatePicker/DatePicker.jsx
import React, { memo } from "react";
import { Calendar } from "lucide-react";
import PropTypes from "prop-types";

const DatePicker = memo(
  ({
    value,
    onChange,
    label,
    placeholder,
    disabled = false,
    required = false,
    minDate,
    maxDate,
    className = "",
    containerClassName = "",
    showIcon = true,
    iconPosition = "left",
    size = "md",
    variant = "default",
    error,
    helperText,
    id,
    name,
    autoFocus = false,
    onFocus,
    onBlur,
    ...props
  }) => {
    // Size variants
    const sizeClasses = {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base",
    };

    // Variant styles
    const variantClasses = {
      default:
        "bg-gray-100 border-transparent focus:bg-white focus:border-blue-500",
      outlined: "bg-white border-gray-300 focus:border-blue-500",
      filled: "bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500",
    };

    // Error styles
    const errorClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "focus:ring-blue-500";

    // Icon classes based on position and size
    const iconClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const getDefaultMaxDate = () => {
      return new Date().toISOString().split("T");
    };

    const handleDateChange = (event) => {
      const newDate = event.target.value;
      if (onChange) {
        onChange(newDate);
      }
    };

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id || name}
            className={`text-sm font-medium text-gray-700 ${
              required
                ? "after:content-['*'] after:text-red-500 after:ml-1"
                : ""
            }`}
          >
            {label}
          </label>
        )}

        {/* Date Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {showIcon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar className={`${iconClasses[size]} text-gray-500`} />
            </div>
          )}

          {/* Date Input */}
          <input
            type="date"
            id={id || name}
            name={name}
            value={value || ""}
            onChange={handleDateChange}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            min={minDate}
            max={maxDate || getDefaultMaxDate()}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`
            w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${errorClasses}
            ${showIcon && iconPosition === "left" ? "pl-10" : ""}
            ${showIcon && iconPosition === "right" ? "pr-10" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}
            ${className}
          `}
            {...props}
          />

          {/* Right Icon */}
          {showIcon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar className={`${iconClasses[size]} text-gray-500`} />
            </div>
          )}
        </div>

        {/* Helper Text or Error Message */}
        {(helperText || error) && (
          <p className={`text-xs ${error ? "text-red-500" : "text-gray-500"}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

DatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  showIcon: PropTypes.bool,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  variant: PropTypes.oneOf(["default", "outlined", "filled"]),
  error: PropTypes.string,
  helperText: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  autoFocus: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

export default DatePicker;

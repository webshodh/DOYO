// components/TimePeriodSelector/TimePeriodSelector.jsx
import React, { useState, useCallback, memo } from "react";
import { Calendar, BarChart3, TrendingUp, Activity } from "lucide-react";
import DatePicker from "./Buttons/DatePicker";

const TimePeriodSelector = memo(
  ({
    selectedTimePeriod,
    onTimePeriodChange,
    selectedDate,
    onDateChange,
    className = "2",
    variant = "default", // default, compact, full-width
    showDatePicker = true,
    datePickerProps = {},
    customPeriods = null,
    disableFutureDates = true,
  }) => {
    const [isCustomDateMode, setIsCustomDateMode] = useState(false);

    const defaultPeriods = [
      { key: "daily", label: "Today", icon: Calendar },
      { key: "weekly", label: "This Week", icon: BarChart3 },
      { key: "monthly", label: "This Month", icon: TrendingUp },
      { key: "total", label: "All Time", icon: Activity },
    ];

    const periods = customPeriods || defaultPeriods;

    const handleTimePeriodChange = useCallback(
      (periodKey) => {
        setIsCustomDateMode(false);
        onTimePeriodChange(periodKey);
      },
      [onTimePeriodChange]
    );

    const handleDateChange = useCallback(
      (newDate) => {
        setIsCustomDateMode(true);
        onDateChange(newDate);
      },
      [onDateChange]
    );

    const handleCustomDateClick = useCallback(() => {
      setIsCustomDateMode(true);
      if (!selectedDate) {
        const today = new Date().toISOString().split("T")[0];
        onDateChange(today);
      }
    }, [selectedDate, onDateChange]);

    const getVariantClasses = () => {
      switch (variant) {
        case "compact":
          return "gap-1";
        case "full-width":
          return "gap-2 w-full";
        default:
          return "gap-2";
      }
    };

    const getButtonClasses = (isSelected) => {
      const baseClasses = `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap`;
      const selectedClasses = isSelected
        ? "bg-orange-500 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200";

      if (variant === "compact") {
        return `${baseClasses} px-3 py-1.5 text-xs ${selectedClasses}`;
      }

      if (variant === "full-width") {
        return `${baseClasses} flex-1 justify-center ${selectedClasses}`;
      }

      return `${baseClasses} ${selectedClasses}`;
    };

    const getIconSize = () => {
      return variant === "compact" ? "w-3 h-3" : "w-4 h-4";
    };

    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {/* Time Period Tabs */}
        <div
          className={`flex overflow-x-auto no-scrollbar ${getVariantClasses()}`}
        >
          {periods.map((period) => {
            const IconComponent = period.icon;
            const isSelected =
              selectedTimePeriod === period.key && !isCustomDateMode;

            return (
              <button
                key={period.key}
                onClick={() => handleTimePeriodChange(period.key)}
                className={getButtonClasses(isSelected)}
              >
                <IconComponent className={getIconSize()} />
                {period.label}
              </button>
            );
          })}

          {showDatePicker && (
            <button
              onClick={handleCustomDateClick}
              className={getButtonClasses(isCustomDateMode)}
            >
              <Calendar className={getIconSize()} />
              Custom Date
            </button>
          )}
        </div>

        {/* Date Picker */}
        {showDatePicker && isCustomDateMode && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Select Date:
            </span>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              size="md"
              variant="outlined"
              showIcon={true}
              iconPosition="left"
              containerClassName="w-full sm:w-auto"
              className="min-w-[160px]"
              maxDate={
                disableFutureDates
                  ? new Date().toISOString().split("T")[0]
                  : undefined
              }
              {...datePickerProps}
            />

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  handleDateChange(today);
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  handleDateChange(yesterday.toISOString().split("T")[0]);
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Yesterday
              </button>
            </div>
          </div>
        )}

        {/* Current Selection */}
        <div className="text-sm text-gray-600 font-medium break-words">
          {isCustomDateMode && selectedDate
            ? `Showing data for ${new Date(selectedDate).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}`
            : `Showing ${
                periods
                  .find((p) => p.key === selectedTimePeriod)
                  ?.label?.toLowerCase() || "all"
              } data`}
        </div>
      </div>
    );
  }
);

TimePeriodSelector.displayName = "TimePeriodSelector";

export default TimePeriodSelector;

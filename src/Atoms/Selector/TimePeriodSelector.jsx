import React, { useState, useCallback, memo } from "react";
import { Calendar, BarChart3, TrendingUp, Activity } from "lucide-react";

// Mock DatePicker component for demo
const DatePicker = ({ value, onChange, maxDate, className }) => (
  <input
    type="date"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    max={maxDate}
    className={`px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all ${className}`}
  />
);

const TimePeriodSelector = memo(
  ({
    selectedTimePeriod = "daily",
    onTimePeriodChange = () => {},
    selectedDate,
    onDateChange = () => {},
    className = "",
    variant = "default",
    showDatePicker = true,
    datePickerProps = {},
    customPeriods = null,
    disableFutureDates = true,
  }) => {
    const [isCustomDateMode, setIsCustomDateMode] = useState(false);

    const defaultPeriods = [
      { key: "daily", label: "Today", icon: Calendar, color: "orange" },
      { key: "weekly", label: "This Week", icon: BarChart3, color: "blue" },
      {
        key: "monthly",
        label: "This Month",
        icon: TrendingUp,
        color: "purple",
      },
      { key: "total", label: "All Time", icon: Activity, color: "green" },
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

    const getButtonClasses = (isSelected, periodColor) => {
      if (variant === "compact") {
        return `group relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
          isSelected
            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105"
            : "bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md border border-gray-200"
        }`;
      }
    };

    const getIconSize = () => {
      return variant === "compact" ? "w-3.5 h-3.5" : "w-4 h-4";
    };

    return (
      <div className={`w-full ${className}`}>
        {/* Main Card Container */}
        <div className=" p-4 sm:p-6">
          {/* Time Period Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-1">
            {periods.map((period) => {
              const IconComponent = period.icon;
              const isSelected =
                selectedTimePeriod === period.key && !isCustomDateMode;

              return (
                <button
                  key={period.key}
                  onClick={() => handleTimePeriodChange(period.key)}
                  className={getButtonClasses(isSelected, period.color)}
                >
                  <IconComponent
                    className={`${getIconSize()} transition-transform duration-300 ${
                      isSelected ? "rotate-0" : "group-hover:rotate-12"
                    }`}
                  />
                  <span className="hidden sm:inline">{period.label}</span>
                  <span className="sm:hidden">
                    {period.label.split(" ")[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
                  )}
                </button>
              );
            })}

            {showDatePicker && (
              <button
                onClick={handleCustomDateClick}
                className={getButtonClasses(isCustomDateMode)}
              >
                <Calendar
                  className={`${getIconSize()} transition-transform duration-300 ${
                    isCustomDateMode ? "rotate-0" : "group-hover:rotate-12"
                  }`}
                />
                <span className="hidden sm:inline">Custom Date</span>
                <span className="sm:hidden">Custom</span>
                {isCustomDateMode && (
                  <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
                )}
              </button>
            )}
          </div>

          {/* Date Picker Section */}
          {showDatePicker && isCustomDateMode && (
            <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-100 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  Select Date:
                </span>
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    maxDate={
                      disableFutureDates
                        ? new Date().toISOString().split("T")[0]
                        : undefined
                    }
                    className="flex-1"
                    {...datePickerProps}
                  />

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        handleDateChange(today);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        handleDateChange(yesterday.toISOString().split("T")[0]);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:scale-105"
                    >
                      Yesterday
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Selection Display */}
          {/* <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-gray-700">
                {isCustomDateMode && selectedDate
                  ? `Viewing: ${new Date(selectedDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}`
                  : `Viewing: ${
                      periods.find((p) => p.key === selectedTimePeriod)
                        ?.label || "All Time"
                    } Data`}
              </p>
            </div>
          </div> */}
        </div>

        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          .hover\\:scale-102:hover {
            transform: scale(1.02);
          }
        `}</style>
      </div>
    );
  }
);

TimePeriodSelector.displayName = "TimePeriodSelector";

export default TimePeriodSelector;

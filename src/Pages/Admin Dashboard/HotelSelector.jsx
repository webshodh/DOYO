// src/components/HotelSelector.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ✅ NEW: Import Firestore-based hooks and contexts
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { useAdmin } from "../../hooks/useAdmin";

import { Spinner } from "atoms";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import {
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

const HotelSelector = ({
  adminId,
  selectedHotelName,
  onHotelSelect,
  variant = "default", // default, compact, detailed
  showDetails = false,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isAuthenticated } = useAuth();
  const {
    hotels,
    selectedHotel,
    selectHotel,
    selectHotelById,
    loading: hotelsLoading,
    error: hotelsError,
  } = useHotelContext();

  // ✅ NEW: Use admin hook for additional admin data
  const {
    admin,
    adminHotels,
    loading: adminLoading,
    error: adminError,
    connectionStatus,
    refreshAdmin,
    canManageHotel,
    hasHotels,
    hotelCount,
    isActive,
    canRetry,
    isRetrying,
  } = useAdmin(adminId || currentUser?.uid);

  // ✅ ENHANCED: Determine active admin ID
  const activeAdminId = adminId || currentUser?.uid;

  // ✅ ENHANCED: Combine hotel data from context and admin hook
  const availableHotels = useMemo(() => {
    // Priority: adminHotels > context hotels
    let hotelsList = [];

    if (adminHotels?.length > 0) {
      hotelsList = adminHotels;
    } else if (hotels?.length > 0) {
      hotelsList = hotels;
    }

    // Ensure it's an array
    const hotelsArray = Array.isArray(hotelsList)
      ? hotelsList
      : hotelsList
      ? Object.values(hotelsList)
      : [];

    // Filter hotels the admin can manage
    return hotelsArray
      .filter((hotel) => {
        const hotelId = hotel.id || hotel.hotelId;

        // If we have admin data, check permissions
        if (admin?.managedHotels) {
          return admin.managedHotels.includes(hotelId);
        }

        // Check if admin created the hotel
        if (hotel.createdBy === activeAdminId) {
          return true;
        }

        // For superadmin or if no specific restrictions
        if (admin?.role === "superadmin") {
          return true;
        }

        // Default: assume they can manage if hotel is in their list
        return true;
      })
      .sort((a, b) =>
        (a.name || a.hotelName || a.businessName || "").localeCompare(
          b.name || b.hotelName || b.businessName || ""
        )
      );
  }, [adminHotels, hotels, admin, activeAdminId]);

  // ✅ NEW: Enhanced loading and error states
  const isLoading = hotelsLoading || adminLoading;
  const hasError = hotelsError || adminError;

  // ✅ ENHANCED: Handle hotel selection with better navigation
  const handleHotelClick = useCallback(
    (hotel) => {
      if (disabled) return;

      const hotelId = hotel.id || hotel.hotelId;
      const hotelName = hotel.name || hotel.hotelName || hotel.businessName;

      // Check if admin can manage this hotel
      if (!canManageHotel(hotelId)) {
        alert("You don't have permission to access this hotel.");
        return;
      }

      // Update context
      selectHotel(hotel);

      // Call parent callback if provided
      if (onHotelSelect) {
        onHotelSelect(hotelName, hotel);
      }

      setIsOpen(false);

      // Navigate to hotel dashboard
      if (hotelId) {
        navigate(`/admin/hotel/${hotelId}/dashboard`, {
          state: {
            hotelData: hotel,
            hotelName: hotelName,
          },
          replace: false,
        });
      }
    },
    [disabled, selectHotel, onHotelSelect, navigate, canManageHotel]
  );

  // ✅ NEW: Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const selector = document.querySelector(".hotel-selector");
      if (selector && !selector.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // ✅ NEW: Keyboard navigation
  const handleKeyDown = useCallback(
    (event) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          setIsOpen(!isOpen);
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          if (isOpen && availableHotels.length > 0) {
            event.preventDefault();
            // Focus first hotel option
            const firstOption = document.querySelector(".hotel-option");
            firstOption?.focus();
          }
          break;
      }
    },
    [disabled, isOpen, availableHotels.length]
  );

  // ✅ NEW: Get current hotel display name
  const currentHotelName = useMemo(() => {
    if (selectedHotelName) return selectedHotelName;
    if (selectedHotel) {
      return (
        selectedHotel.name ||
        selectedHotel.hotelName ||
        selectedHotel.businessName
      );
    }
    return null;
  }, [selectedHotelName, selectedHotel]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatus = () => {
    if (connectionStatus === "connecting" || isRetrying) {
      return <Wifi className="w-3 h-3 animate-pulse text-yellow-500" />;
    } else if (connectionStatus === "error") {
      return <WifiOff className="w-3 h-3 text-red-500" />;
    } else if (connectionStatus === "connected") {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    return null;
  };

  // ✅ ENHANCED: Loading state
  if (isLoading) {
    return (
      <div className={`relative hotel-selector ${className}`}>
        <div
          className={`px-3 py-2 bg-orange-600 rounded-md flex items-center justify-center min-w-[120px] ${
            variant === "compact" ? "px-2 py-1 text-sm" : ""
          }`}
        >
          <Spinner size="sm" className="text-white" />
          <span className="ml-2 text-white">Loading...</span>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Error state
  if (hasError && connectionStatus === "error") {
    return (
      <div className={`relative hotel-selector ${className}`}>
        <div
          className={`px-3 py-2 bg-red-600 rounded-md flex items-center cursor-pointer ${
            variant === "compact" ? "px-2 py-1 text-sm" : ""
          }`}
          onClick={canRetry ? refreshAdmin : undefined}
          title={canRetry ? "Click to retry" : "Max retries reached"}
        >
          <AlertTriangle className="w-4 h-4 text-white mr-2" />
          <span className="text-white">
            {canRetry ? "Error - Retry" : "Error"}
          </span>
        </div>
      </div>
    );
  }

  // ✅ NEW: No hotels available state
  if (!availableHotels.length && !isLoading) {
    return (
      <div className={`relative hotel-selector ${className}`}>
        <div
          className={`px-3 py-2 bg-gray-500 rounded-md flex items-center ${
            variant === "compact" ? "px-2 py-1 text-sm" : ""
          }`}
        >
          <Building2 className="w-4 h-4 text-white mr-2" />
          <span className="text-white">No Hotels</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative hotel-selector ${className}`}>
      {/* ✅ ENHANCED: Selector button with better styling and accessibility */}
      <div
        className={`px-3 py-2 bg-orange-600 rounded-md cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          variant === "compact" ? "px-2 py-1 text-sm" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${
          isOpen ? "bg-orange-700 ring-2 ring-orange-500" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select hotel"
      >
        <div className="flex items-center min-w-0 flex-1">
          <Building2 className="w-4 h-4 text-white mr-2 flex-shrink-0" />
          <span className="text-white truncate">
            {currentHotelName || "Select Hotel"}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <ConnectionStatus />
          <ChevronDown
            className={`w-4 h-4 text-white transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* ✅ ENHANCED: Dropdown with better styling and functionality */}
      {isOpen && (
        <div
          className={`absolute mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto ${
            variant === "compact" ? "w-48" : "w-64"
          }`}
          role="listbox"
          aria-label="Hotel options"
        >
          {availableHotels.length > 0 ? (
            availableHotels.map((hotel, index) => {
              const hotelId = hotel.id || hotel.hotelId;
              const hotelName =
                hotel.name || hotel.hotelName || hotel.businessName;
              const isSelected = currentHotelName === hotelName;
              const canManage = canManageHotel(hotelId);

              return (
                <div
                  key={hotelId || hotelName || index}
                  className={`hotel-option px-3 py-2 cursor-pointer transition-colors duration-150 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                    isSelected
                      ? "bg-orange-50 border-l-4 border-orange-500"
                      : ""
                  } ${variant === "compact" ? "px-2 py-1 text-sm" : ""} ${
                    !canManage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => canManage && handleHotelClick(hotel)}
                  onKeyDown={(e) => {
                    if (canManage && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleHotelClick(hotel);
                    }
                  }}
                  tabIndex={0}
                  role="option"
                  aria-selected={isSelected}
                  title={!canManage ? "Access restricted" : undefined}
                >
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span
                          className={`font-medium text-gray-900 truncate ${
                            variant === "compact" ? "text-sm" : ""
                          }`}
                        >
                          {hotelName}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-orange-500 ml-2 flex-shrink-0" />
                        )}
                        {!canManage && (
                          <AlertTriangle className="w-4 h-4 text-red-500 ml-2 flex-shrink-0" />
                        )}
                      </div>

                      {/* ✅ NEW: Additional hotel details */}
                      {showDetails && variant !== "compact" && (
                        <div className="mt-1 text-xs text-gray-500 space-y-1">
                          {hotel.address && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate">{hotel.address}</span>
                            </div>
                          )}
                          {hotel.primaryContact && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              <span>{hotel.primaryContact}</span>
                            </div>
                          )}
                          {hotel.businessHours && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{hotel.businessHours}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className={`px-3 py-2 text-gray-500 italic ${
                variant === "compact" ? "px-2 py-1 text-sm" : ""
              }`}
            >
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                No hotels available
              </div>
            </div>
          )}

          {/* ✅ NEW: Footer with connection status */}
          {connectionStatus && (
            <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>
                  {availableHotels.length} hotel
                  {availableHotels.length !== 1 ? "s" : ""} available
                </span>
                <div className="flex items-center gap-1">
                  <ConnectionStatus />
                  <span className="capitalize">{connectionStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ NEW: Add default props
HotelSelector.defaultProps = {
  variant: "default",
  showDetails: false,
  className: "",
  disabled: false,
};

export default HotelSelector;

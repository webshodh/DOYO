import React from "react";
import {
  Search,
  CheckCircle,
  UserPlus,
  Building,
  MapPin,
  CreditCard,
  User,
} from "lucide-react";
import {
  validateEmail,
  validateContact,
  validatePassword,
} from "../../Validation/hotelValidation";

const HotelFormModal = ({
  hotelName,
  hotelData = {},
  admin,
  onHotelNameChange,
  onHotelDataChange = () => {},
  onUpdateAdmin,
  onSearchAdmin,
  onCreateNewAdmin,
  onSubmit,
  onReset,
  submitting,
  searching,
  getAdminValidationStatus,
  getHotelValidationStatus = () => true,
  adminExists,
}) => {
  const handleHotelDataChange = (field, value) => {
    if (onHotelDataChange && typeof onHotelDataChange === "function") {
      onHotelDataChange(field, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const categoryOptions = [
    { value: "", label: "Select Category" },
    { value: "restaurant", label: "Restaurant" },
    { value: "cafe", label: "Cafe" },
    { value: "bar", label: "Bar & Pub" },
    { value: "fast_food", label: "Fast Food" },
    { value: "fine_dining", label: "Fine Dining" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Add Restaurant with Admin Management
          </h1>
          <p className="text-gray-600 text-lg">
            Complete the form below to register a new restaurant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Restaurant Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Building className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">
                  Basic Restaurant Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => onHotelNameChange(e.target.value)}
                    placeholder="Enter Restaurant Name"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                      !hotelName.trim()
                        ? "border-red-300 focus:border-red-500"
                        : "border-green-300 focus:border-indigo-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {!hotelName.trim() && (
                    <p className="text-red-500 text-sm font-medium">
                      Restaurant name is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={hotelData?.category || ""}
                    onChange={(e) =>
                      handleHotelDataChange("category", e.target.value)
                    }
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                      !hotelData?.category
                        ? "border-red-300 focus:border-red-500"
                        : "border-green-300 focus:border-indigo-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {!hotelData?.category && (
                    <p className="text-red-500 text-sm font-medium">
                      Please select a category
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={hotelData?.contact || ""}
                    onChange={(e) =>
                      handleHotelDataChange("contact", e.target.value)
                    }
                    placeholder="Enter 10-digit contact"
                    maxLength="10"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                      hotelData?.contact && !validateContact(hotelData.contact)
                        ? "border-red-300 focus:border-red-500"
                        : hotelData?.contact &&
                          validateContact(hotelData.contact)
                        ? "border-green-300 focus:border-indigo-500"
                        : "border-gray-300 focus:border-indigo-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {hotelData?.contact &&
                    !validateContact(hotelData.contact) && (
                      <p className="text-red-500 text-sm font-medium">
                        Valid 10-digit contact number is required
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={hotelData?.description || ""}
                  onChange={(e) =>
                    handleHotelDataChange("description", e.target.value)
                  }
                  placeholder="Enter restaurant description and specialties"
                  disabled={submitting}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 ${
                    submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">
                  Location Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={hotelData?.address || ""}
                  onChange={(e) =>
                    handleHotelDataChange("address", e.target.value)
                  }
                  placeholder="Enter complete address"
                  disabled={submitting}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                    !hotelData?.address?.trim()
                      ? "border-red-300 focus:border-red-500"
                      : "border-green-300 focus:border-emerald-500"
                  } ${
                    submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                />
                {!hotelData?.address?.trim() && (
                  <p className="text-red-500 text-sm font-medium">
                    Address is required
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotelData?.city || ""}
                    onChange={(e) =>
                      handleHotelDataChange("city", e.target.value)
                    }
                    placeholder="Enter city"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                      !hotelData?.city?.trim()
                        ? "border-red-300 focus:border-red-500"
                        : "border-green-300 focus:border-emerald-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {!hotelData?.city?.trim() && (
                    <p className="text-red-500 text-sm font-medium">
                      City is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotelData?.district || ""}
                    onChange={(e) =>
                      handleHotelDataChange("district", e.target.value)
                    }
                    placeholder="Enter district"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                      !hotelData?.district?.trim()
                        ? "border-red-300 focus:border-red-500"
                        : "border-green-300 focus:border-emerald-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {!hotelData?.district?.trim() && (
                    <p className="text-red-500 text-sm font-medium">
                      District is required
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotelData?.state || ""}
                    onChange={(e) =>
                      handleHotelDataChange("state", e.target.value)
                    }
                    placeholder="Enter state"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                      !hotelData?.state?.trim()
                        ? "border-red-300 focus:border-red-500"
                        : "border-green-300 focus:border-emerald-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {!hotelData?.state?.trim() && (
                    <p className="text-red-500 text-sm font-medium">
                      State is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotelData?.pincode || ""}
                    onChange={(e) =>
                      handleHotelDataChange("pincode", e.target.value)
                    }
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                      hotelData?.pincode &&
                      (hotelData.pincode.length !== 6 ||
                        !/^\d{6}$/.test(hotelData.pincode))
                        ? "border-red-300 focus:border-red-500"
                        : hotelData?.pincode &&
                          hotelData.pincode.length === 6 &&
                          /^\d{6}$/.test(hotelData.pincode)
                        ? "border-green-300 focus:border-emerald-500"
                        : "border-gray-300 focus:border-emerald-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {hotelData?.pincode &&
                    (hotelData.pincode.length !== 6 ||
                      !/^\d{6}$/.test(hotelData.pincode)) && (
                      <p className="text-red-500 text-sm font-medium">
                        Valid 6-digit pincode is required
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">
                  Business Details
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={hotelData?.website || ""}
                    onChange={(e) =>
                      handleHotelDataChange("website", e.target.value)
                    }
                    placeholder="https://example.com"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Restaurant Email
                  </label>
                  <input
                    type="email"
                    value={hotelData?.email || ""}
                    onChange={(e) =>
                      handleHotelDataChange("email", e.target.value)
                    }
                    placeholder="restaurant@example.com"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-100 ${
                      hotelData?.email &&
                      hotelData.email.trim() &&
                      !validateEmail(hotelData.email)
                        ? "border-red-300 focus:border-red-500"
                        : hotelData?.email &&
                          hotelData.email.trim() &&
                          validateEmail(hotelData.email)
                        ? "border-green-300 focus:border-orange-500"
                        : "border-gray-300 focus:border-orange-500"
                    } ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {hotelData?.email &&
                    hotelData.email.trim() &&
                    !validateEmail(hotelData.email) && (
                      <p className="text-red-500 text-sm font-medium">
                        Valid email format required
                      </p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Average Cost for Two
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hotelData?.avgCostForTwo || ""}
                    onChange={(e) =>
                      handleHotelDataChange("avgCostForTwo", e.target.value)
                    }
                    placeholder="Enter average cost (₹)"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  <p className="text-gray-500 text-sm">
                    Approximate cost for two people
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={hotelData?.gstNumber || ""}
                    onChange={(e) =>
                      handleHotelDataChange("gstNumber", e.target.value)
                    }
                    placeholder="Enter GST number"
                    maxLength="15"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    FSSAI License Number
                  </label>
                  <input
                    type="text"
                    value={hotelData?.fssaiNumber || ""}
                    onChange={(e) =>
                      handleHotelDataChange("fssaiNumber", e.target.value)
                    }
                    placeholder="Enter FSSAI license number"
                    maxLength="14"
                    disabled={submitting}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 ${
                      submitting ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  <p className="text-gray-500 text-sm">
                    Food Safety and Standards Authority license
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Search and Management */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">
                  Admin Management
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Admin Email Search */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Search Admin by Email{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="email"
                      value={admin.email}
                      onChange={(e) => onUpdateAdmin("email", e.target.value)}
                      placeholder="Enter admin email to search"
                      disabled={submitting}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                        admin.email.trim() && !validateEmail(admin.email)
                          ? "border-red-300 focus:border-red-500"
                          : admin.email.trim() && validateEmail(admin.email)
                          ? "border-green-300 focus:border-purple-500"
                          : "border-gray-300 focus:border-purple-500"
                      } ${
                        submitting
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={onSearchAdmin}
                      disabled={
                        !admin.email.trim() ||
                        !validateEmail(admin.email) ||
                        searching ||
                        submitting
                      }
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {searching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Search</span>
                        </>
                      )}
                    </button>
                  </div>
                  {admin.email.trim() && !validateEmail(admin.email) && (
                    <p className="text-red-500 text-sm font-medium">
                      Valid email is required
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Details */}
              {admin.email.trim() && validateEmail(admin.email) && (
                <div
                  className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                    getAdminValidationStatus()
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >
                  <div className="bg-white px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Admin Details
                        </h3>
                        {admin.isExisting && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Existing Admin Found
                          </span>
                        )}
                        {!admin.isExisting && admin.searched && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <UserPlus className="w-4 h-4 mr-1" />
                            New Admin (Will be created)
                          </span>
                        )}
                      </div>
                      {!admin.isExisting && admin.searched && (
                        <button
                          type="button"
                          onClick={onCreateNewAdmin}
                          disabled={submitting}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Create New Admin</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {admin.isExisting && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          <p className="text-blue-800 font-medium">
                            This admin already exists and will be assigned to
                            this restaurant.
                          </p>
                        </div>
                        {admin.existingHotels &&
                          admin.existingHotels.length > 0 && (
                            <p className="text-blue-700 text-sm">
                              <strong>Currently managing restaurants:</strong>{" "}
                              {admin.existingHotels.join(", ")}
                            </p>
                          )}
                      </div>
                    )}

                    {!admin.isExisting && admin.searched && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-5 h-5 text-yellow-600" />
                          <p className="text-yellow-800 font-medium">
                            Admin with this email doesn't exist. Please fill in
                            the details below to create a new admin.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Admin Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={admin.name}
                          onChange={(e) =>
                            onUpdateAdmin("name", e.target.value)
                          }
                          placeholder="Enter admin name"
                          disabled={admin.isExisting || submitting}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                            !admin.name.trim()
                              ? "border-red-300 focus:border-red-500"
                              : "border-green-300 focus:border-purple-500"
                          } ${
                            admin.isExisting || submitting
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          }`}
                        />
                        {!admin.name.trim() && (
                          <p className="text-red-500 text-sm font-medium">
                            Admin name is required
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={admin.contact}
                          onChange={(e) =>
                            onUpdateAdmin("contact", e.target.value)
                          }
                          placeholder="Enter 10-digit contact"
                          maxLength="10"
                          disabled={admin.isExisting || submitting}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                            !admin.contact.trim() ||
                            !validateContact(admin.contact)
                              ? "border-red-300 focus:border-red-500"
                              : "border-green-300 focus:border-purple-500"
                          } ${
                            admin.isExisting || submitting
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          }`}
                        />
                        {(!admin.contact.trim() ||
                          !validateContact(admin.contact)) && (
                          <p className="text-red-500 text-sm font-medium">
                            Valid 10-digit contact number is required
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Password{" "}
                          {admin.isExisting
                            ? "(Not Required - Existing Admin)"
                            : "*"}
                        </label>
                        <input
                          type="password"
                          value={admin.password}
                          onChange={(e) =>
                            onUpdateAdmin("password", e.target.value)
                          }
                          placeholder="Enter password (min 6 characters)"
                          disabled={admin.isExisting || submitting}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                            !admin.isExisting &&
                            (!admin.password.trim() ||
                              !validatePassword(admin.password))
                              ? "border-red-300 focus:border-red-500"
                              : "border-green-300 focus:border-purple-500"
                          } ${
                            admin.isExisting || submitting
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          }`}
                        />
                        {!admin.isExisting && (
                          <p className="text-gray-500 text-sm">
                            Password must be at least 6 characters long
                          </p>
                        )}
                        {!admin.isExisting &&
                          (!admin.password.trim() ||
                            !validatePassword(admin.password)) && (
                            <p className="text-red-500 text-sm font-medium">
                              Password must be at least 6 characters
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={
                submitting ||
                !getAdminValidationStatus() ||
                !hotelName.trim() ||
                (getHotelValidationStatus && !getHotelValidationStatus())
              }
              className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Restaurant with Admin"
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={submitting}
              className="flex-1 sm:flex-none px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Reset Form
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    hotelName.trim() ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    hotelName.trim() ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  Basic Info
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    hotelData?.address?.trim() &&
                    hotelData?.city?.trim() &&
                    hotelData?.state?.trim()
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    hotelData?.address?.trim() &&
                    hotelData?.city?.trim() &&
                    hotelData?.state?.trim()
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  Location
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    getAdminValidationStatus() ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    getAdminValidationStatus()
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  Admin
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelFormModal;

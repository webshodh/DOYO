import React from "react";
import {
  Search,
  CheckCircle,
  UserPlus,
  User,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import {
  validateEmail,
  validateContact,
  validatePassword,
} from "../../validation/hotelValidation";
import { FormSection } from "utils/FormUtilityFunctions";
import { hotelFormConfig } from "Constants/ConfigForms/addHotelFormConfig";
import useHotel from "../../hooks/useHotel";

const HotelFormModal = ({ isOpen = true, onClose, editMode = false }) => {
  // Use the custom hook for all hotel and admin management
  const {
    // Hotel form state
    formData,
    setFormData,

    // Admin state
    admin,
    updateAdmin,
    searchAdmin,
    createNewAdmin,

    // Loading states
    submitting,
    searching,

    // Actions
    submitHotelWithAdmin,
    resetForm,

    // Validation
    getAdminValidationStatus,
    getFormValidationStatus,

    // Utilities
    adminExists,
  } = useHotel();

  // Get default form data from config
  const getDefaultFormData = () => {
    const defaultData = {};
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        defaultData[field.name] = field.defaultValue || "";
      });
    });
    return defaultData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create combined data for submission
    const hotelData = {
      ...formData,
      // Map businessName to hotelName for backward compatibility
      hotelName: formData.businessName,
    };

    const result = await submitHotelWithAdmin(hotelData);

    if (result.success) {
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
    setFormData(getDefaultFormData());
    onClose();
  };

  const handleReset = () => {
    resetForm();
    setFormData(getDefaultFormData());
  };

  // Validate required hotel fields based on config
  const isHotelFormValid = () => {
    // Get all required fields from config
    const requiredFields = [];
    hotelFormConfig.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required) {
          requiredFields.push(field.name);
        }
      });
    });

    // Check if all required fields have values
    return requiredFields.every((fieldName) =>
      formData[fieldName]?.toString().trim()
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {editMode ? "Edit Restaurant" : "Add Restaurant with Admin"}
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Restaurant Information */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                      Restaurant Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {hotelFormConfig.sections.map((section) => (
                        <FormSection
                          key={section.id}
                          section={section}
                          formData={formData}
                          onChange={setFormData}
                          disabled={submitting}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Search and Management */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                            value={admin.email || ""}
                            onChange={(e) =>
                              updateAdmin("email", e.target.value)
                            }
                            placeholder="Enter admin email to search"
                            disabled={submitting}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                              admin.email?.trim() && !validateEmail(admin.email)
                                ? "border-red-300 focus:border-red-500"
                                : admin.email?.trim() &&
                                  validateEmail(admin.email)
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
                            onClick={searchAdmin}
                            disabled={
                              !admin.email?.trim() ||
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
                                {/* <span>Search</span> */}
                              </>
                            )}
                          </button>
                        </div>
                        {admin.email?.trim() && !validateEmail(admin.email) && (
                          <p className="text-red-500 text-sm font-medium">
                            Valid email is required
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Admin Details */}
                    {admin.email?.trim() && validateEmail(admin.email) && (
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
                                onClick={createNewAdmin}
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
                                  This admin already exists and will be assigned
                                  to this restaurant.
                                </p>
                              </div>
                              {admin.existingHotels &&
                                admin.existingHotels.length > 0 && (
                                  <p className="text-blue-700 text-sm">
                                    <strong>
                                      Currently managing restaurants:
                                    </strong>{" "}
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
                                  Admin with this email doesn't exist. Please
                                  fill in the details below to create a new
                                  admin.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Admin Name{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={admin.name || ""}
                                onChange={(e) =>
                                  updateAdmin("name", e.target.value)
                                }
                                placeholder="Enter admin name"
                                disabled={admin.isExisting || submitting}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                                  !admin.name?.trim()
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-green-300 focus:border-purple-500"
                                } ${
                                  admin.isExisting || submitting
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "bg-white"
                                }`}
                              />
                              {!admin.name?.trim() && (
                                <p className="text-red-500 text-sm font-medium">
                                  Admin name is required
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">
                                Contact Number{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                value={admin.contact || ""}
                                onChange={(e) =>
                                  updateAdmin("contact", e.target.value)
                                }
                                placeholder="Enter 10-digit contact"
                                maxLength="10"
                                disabled={admin.isExisting || submitting}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                                  !admin.contact?.trim() ||
                                  !validateContact(admin.contact)
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-green-300 focus:border-purple-500"
                                } ${
                                  admin.isExisting || submitting
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "bg-white"
                                }`}
                              />
                              {(!admin.contact?.trim() ||
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
                                value={admin.password || ""}
                                onChange={(e) =>
                                  updateAdmin("password", e.target.value)
                                }
                                placeholder="Enter password (min 6 characters)"
                                disabled={admin.isExisting || submitting}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                                  !admin.isExisting &&
                                  (!admin.password?.trim() ||
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
                                (!admin.password?.trim() ||
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
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>* Required fields</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={submitting}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset Form
                    </button>

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !getAdminValidationStatus() ||
                        !isHotelFormValid()
                      }
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {submitting
                        ? "Saving..."
                        : editMode
                        ? "Update Restaurant"
                        : "Create Restaurant"}
                    </button>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
                  <div className="flex items-center justify-center space-x-8">
                    {hotelFormConfig.sections.map((section, index) => {
                      // Check if section is complete based on its required fields
                      const sectionComplete = section.fields
                        .filter((field) => field.required)
                        .every((field) =>
                          formData[field.name]?.toString().trim()
                        );

                      return (
                        <div
                          key={section.id}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              sectionComplete ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              sectionComplete
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {section.title}
                          </span>
                        </div>
                      );
                    })}

                    {/* Admin section indicator */}
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          getAdminValidationStatus()
                            ? "bg-green-500"
                            : "bg-gray-300"
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
        </div>
      </div>
    </div>
  );
};

export default HotelFormModal;

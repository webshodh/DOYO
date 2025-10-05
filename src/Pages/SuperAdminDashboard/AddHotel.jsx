// src/pages/AddHotelPage.jsx (UPDATED)
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormContainer from "../../components/Forms/FormContainer";
import {
  hotelFormSections,
  hotelFormFields,
  hotelFormInitialValues,
  getHotelValidationSchema,
} from "../../Constants/ConfigForms/addHotelFormConfig";
import { hotelServices } from "../../services/api/hotelServices";
import { PageTitle } from "atoms";
import { t } from "i18next";
import { toast } from "react-toastify";

export default function AddHotelPage() {
  const navigate = useNavigate();
  const { id: hotelId } = useParams();
  const isEditMode = Boolean(hotelId);

  const [initialValues, setInitialValues] = useState({
    ...hotelFormInitialValues,
    isOrderEnabled: false, // Ensure default value
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  // If editing, fetch existing hotel data
  useEffect(() => {
    if (isEditMode) {
      const loadHotelData = async () => {
        setLoading(true);
        try {
          const data = await hotelServices.getHotelById(hotelId);

          if (data) {
            // Process the data to match form structure
            const formData = {
              ...hotelFormInitialValues,
              ...data,
              // Handle isOrderEnabled specifically
              isOrderEnabled: Boolean(data?.isOrderEnabled),
              // Convert status for form compatibility
              isActive: data.status === "active" ? "active" : "in_active",
              // Handle nested social media object
              socialMedia: {
                facebook: data.socialMedia?.facebook || "",
                instagram: data.socialMedia?.instagram || "",
                twitter: data.socialMedia?.twitter || "",
              },
            };

            setInitialValues(formData);
          } else {
            toast.error("Hotel not found", {
              position: toast.POSITION.TOP_RIGHT,
            });
            navigate("/super-admin/view-hotel");
          }
        } catch (err) {
          console.error("Failed to load hotel:", err);
          toast.error("Failed to load hotel data", {
            position: toast.POSITION.TOP_RIGHT,
          });
          navigate("/super-admin/view-hotel");
        } finally {
          setLoading(false);
        }
      };

      loadHotelData();
    }
  }, [hotelId, isEditMode, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      // Process form data before submission
      const processedData = {
        ...formData,
        // Ensure isOrderEnabled is a proper boolean
        isOrderEnabled: Boolean(formData.isOrderEnabled),
        // Convert empty strings to null for optional fields
        alternateContact: formData.alternateContact?.trim() || null,
        gstNumber: formData.gstNumber?.trim() || null,
        fssaiNumber: formData.fssaiNumber?.trim() || null,
        website: formData.website?.trim() || null,
        coordinates: formData.coordinates?.trim() || null,
        specialInstructions: formData.specialInstructions?.trim() || null,
      };

      let result;
      if (isEditMode) {
        result = await hotelServices.updateHotel(hotelId, processedData);
        if (result) {
          toast.success("Hotel updated successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
          navigate("/super-admin/view-hotel");
        } else {
          throw new Error("Failed to update hotel");
        }
      } else {
        result = await hotelServices.addHotel(processedData);
        if (result.success) {
          toast.success("Hotel created successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
          navigate("/super-admin/view-hotel");
        } else {
          throw new Error(result.error || "Failed to create hotel");
        }
      }
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error(
        `Failed to ${isEditMode ? "update" : "create"} hotel: ${err.message}`,
        {
          position: toast.POSITION.TOP_RIGHT,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Show loading spinner while fetching data in edit mode
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading hotel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-6">
        <PageTitle
          pageTitle={
            isEditMode
              ? t("pages.editHotel", "Edit Hotel")
              : t("pages.addHotel", "Add Hotel")
          }
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
          description={
            isEditMode
              ? t(
                  "descriptions.editHotel",
                  "Update hotel information and settings"
                )
              : t("descriptions.addHotel", "Add a new hotel to the system")
          }
        />

        {/* Breadcrumb */}
        <nav className="text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <button
                onClick={() => navigate("/super-admin")}
                className="hover:text-orange-200 transition-colors"
              >
                Dashboard
              </button>
            </li>
            <li className="text-orange-200">/</li>
            <li>
              <button
                onClick={() => navigate("/super-admin/view-hotel")}
                className="hover:text-orange-200 transition-colors"
              >
                Hotels
              </button>
            </li>
            <li className="text-orange-200">/</li>
            <li className="text-orange-200">
              {isEditMode ? "Edit Hotel" : "Add Hotel"}
            </li>
          </ol>
        </nav>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <FormContainer
            sections={hotelFormSections}
            fieldsMap={hotelFormFields}
            initialValues={initialValues}
            validationSchema={getHotelValidationSchema()}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditMode={isEditMode}
            submitText={isEditMode ? "Update Hotel" : "Create Hotel"}
            cancelText="Cancel"
            submitting={submitting}
          />
        </div>
      </div>

      {/* Order Status Info Card */}
      {isEditMode && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                initialValues.isOrderEnabled ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <h3 className="text-lg font-semibold text-gray-800">
              Current Order Status:{" "}
              {initialValues.isOrderEnabled ? "ENABLED" : "DISABLED"}
            </h3>
          </div>
          <p className="text-gray-600 mt-2">
            {initialValues.isOrderEnabled
              ? "✅ Customers can place orders from this hotel."
              : "❌ Online ordering is currently disabled for this hotel."}
          </p>
        </div>
      )}

      {/* Quick Actions Card for Edit Mode */}
      {isEditMode && (
        <div className="mt-4 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/super-admin/hotels/${hotelId}/details`)}
              className="flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <span className="mr-2">👁️</span>
              View Details
            </button>
            <button
              onClick={() => navigate(`/super-admin/hotels/${hotelId}/admins`)}
              className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <span className="mr-2">👥</span>
              Manage Admins
            </button>
            <button
              onClick={() => navigate(`/super-admin/hotels/${hotelId}/menu`)}
              className="flex items-center justify-center px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <span className="mr-2">📋</span>
              View Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

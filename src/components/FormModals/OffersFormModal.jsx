import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import PageTitle from "../../atoms/PageTitle";
import { validateOfferForm } from "../../validation/offeresValidation";

const OffersFormModal = ({
  show,
  onClose,
  onSubmit,
  editOffer = null,
  title = "Add Offer",
  submitting = false,
  hotelName,
}) => {
  const [offerData, setOfferData] = useState({
    offerName: "",
    offerDescription: "",
    offerType: "percentage", // percentage, fixed, buy_one_get_one, combo
    discountValue: "",
    minimumOrderAmount: "",
    validFrom: "",
    validUntil: "",
    maxUsageCount: "",
    usagePerCustomer: "",
    applicableCategories: [],
    applicableMenuItems: [],
    isActive: true,
    terms: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditMode = Boolean(editOffer);

  // Offer types for dropdown
  const offerTypes = [
    { value: "percentage", label: "Percentage Discount" },
    { value: "fixed", label: "Fixed Amount Discount" },
    { value: "buy_one_get_one", label: "Buy One Get One" },
    { value: "combo", label: "Combo Offer" },
    { value: "free_delivery", label: "Free Delivery" },
  ];

  // Set offer data when editing or reset when adding
  useEffect(() => {
    if (editOffer) {
      setOfferData({
        offerName: editOffer.offerName || "",
        offerDescription: editOffer.offerDescription || "",
        offerType: editOffer.offerType || "percentage",
        discountValue: editOffer.discountValue || "",
        minimumOrderAmount: editOffer.minimumOrderAmount || "",
        validFrom: editOffer.validFrom ? editOffer.validFrom.split("T")[0] : "",
        validUntil: editOffer.validUntil
          ? editOffer.validUntil.split("T")[0]
          : "",
        maxUsageCount: editOffer.maxUsageCount || "",
        usagePerCustomer: editOffer.usagePerCustomer || "",
        applicableCategories: editOffer.applicableCategories || [],
        applicableMenuItems: editOffer.applicableMenuItems || [],
        isActive: editOffer.isActive !== undefined ? editOffer.isActive : true,
        terms: editOffer.terms || "",
      });
    } else {
      setOfferData({
        offerName: "",
        offerDescription: "",
        offerType: "percentage",
        discountValue: "",
        minimumOrderAmount: "",
        validFrom: "",
        validUntil: "",
        maxUsageCount: "",
        usagePerCustomer: "",
        applicableCategories: [],
        applicableMenuItems: [],
        isActive: true,
        terms: "",
      });
    }
    setValidationErrors({});
  }, [editOffer, show]);

  // Real-time validation
  useEffect(() => {
    if (
      Object.values(offerData).some((value) => value !== "" && value !== false)
    ) {
      const validation = validateOfferForm(offerData);
      setValidationErrors(validation.errors || {});
    } else {
      setValidationErrors({});
    }
  }, [offerData]);

  const handleInputChange = (field, value) => {
    setOfferData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submit
    const validation = validateOfferForm(offerData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSubmit(offerData, editOffer?.offerId);
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting offer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOfferData({
      offerName: "",
      offerDescription: "",
      offerType: "percentage",
      discountValue: "",
      minimumOrderAmount: "",
      validFrom: "",
      validUntil: "",
      maxUsageCount: "",
      usagePerCustomer: "",
      applicableCategories: [],
      applicableMenuItems: [],
      isActive: true,
      terms: "",
    });
    setValidationErrors({});
    onClose();
  };

  const hasErrors = Object.keys(validationErrors).length > 0;
  const canSubmit =
    !hasErrors && !isSubmitting && !submitting && offerData.offerName.trim();

  if (!show) return null;

  return (
    <Modal title={title} handleClose={handleClose}>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <PageTitle pageTitle={isEditMode ? "Edit Offer" : "Add Offer"} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Offer Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer Name *
              </label>
              <input
                type="text"
                value={offerData.offerName}
                onChange={(e) => handleInputChange("offerName", e.target.value)}
                placeholder="Enter offer name"
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.offerName
                    ? "border-red-300 focus:ring-red-500"
                    : offerData.offerName.trim()
                    ? "border-green-300 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isSubmitting || submitting}
                required
                maxLength={100}
                autoFocus
              />
              {validationErrors.offerName && (
                <span className="text-red-500 text-sm">
                  {validationErrors.offerName}
                </span>
              )}
            </div>

            {/* Offer Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={offerData.offerDescription}
                onChange={(e) =>
                  handleInputChange("offerDescription", e.target.value)
                }
                placeholder="Enter offer description"
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.offerDescription
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isSubmitting || submitting}
                rows={3}
                maxLength={500}
              />
              {validationErrors.offerDescription && (
                <span className="text-red-500 text-sm">
                  {validationErrors.offerDescription}
                </span>
              )}
            </div>

            {/* Offer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer Type *
              </label>
              <select
                value={offerData.offerType}
                onChange={(e) => handleInputChange("offerType", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || submitting}
                required
              >
                {offerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {offerData.offerType === "percentage"
                  ? "Discount %"
                  : offerData.offerType === "fixed"
                  ? "Discount Amount"
                  : "Discount Value"}{" "}
                *
              </label>
              <input
                type="number"
                value={offerData.discountValue}
                onChange={(e) =>
                  handleInputChange("discountValue", e.target.value)
                }
                placeholder={
                  offerData.offerType === "percentage"
                    ? "e.g., 10"
                    : offerData.offerType === "fixed"
                    ? "e.g., 100"
                    : "Enter value"
                }
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.discountValue
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={
                  isSubmitting ||
                  submitting ||
                  offerData.offerType === "free_delivery"
                }
                min="0"
                max={offerData.offerType === "percentage" ? "100" : undefined}
                step={offerData.offerType === "percentage" ? "0.01" : "1"}
              />
              {validationErrors.discountValue && (
                <span className="text-red-500 text-sm">
                  {validationErrors.discountValue}
                </span>
              )}
            </div>

            {/* Minimum Order Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <input
                type="number"
                value={offerData.minimumOrderAmount}
                onChange={(e) =>
                  handleInputChange("minimumOrderAmount", e.target.value)
                }
                placeholder="e.g., 500"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || submitting}
                min="0"
                step="1"
              />
            </div>

            {/* Max Usage Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Total Usage
              </label>
              <input
                type="number"
                value={offerData.maxUsageCount}
                onChange={(e) =>
                  handleInputChange("maxUsageCount", e.target.value)
                }
                placeholder="e.g., 100 (leave empty for unlimited)"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || submitting}
                min="1"
                step="1"
              />
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From *
              </label>
              <input
                type="date"
                value={offerData.validFrom}
                onChange={(e) => handleInputChange("validFrom", e.target.value)}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.validFrom
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isSubmitting || submitting}
                required
              />
              {validationErrors.validFrom && (
                <span className="text-red-500 text-sm">
                  {validationErrors.validFrom}
                </span>
              )}
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until *
              </label>
              <input
                type="date"
                value={offerData.validUntil}
                onChange={(e) =>
                  handleInputChange("validUntil", e.target.value)
                }
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.validUntil
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isSubmitting || submitting}
                required
                min={offerData.validFrom}
              />
              {validationErrors.validUntil && (
                <span className="text-red-500 text-sm">
                  {validationErrors.validUntil}
                </span>
              )}
            </div>

            {/* Usage Per Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Per Customer
              </label>
              <input
                type="number"
                value={offerData.usagePerCustomer}
                onChange={(e) =>
                  handleInputChange("usagePerCustomer", e.target.value)
                }
                placeholder="e.g., 1 (leave empty for unlimited)"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || submitting}
                min="1"
                step="1"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={offerData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="mr-2"
                  disabled={isSubmitting || submitting}
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Offer
                </span>
              </label>
            </div>

            {/* Terms and Conditions */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={offerData.terms}
                onChange={(e) => handleInputChange("terms", e.target.value)}
                placeholder="Enter terms and conditions for this offer"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || submitting}
                rows={4}
                maxLength={1000}
              />
              <div className="text-right">
                <span className="text-gray-400 text-sm">
                  {offerData.terms.length}/1000
                </span>
              </div>
            </div>
          </div>

          {/* Offer Preview */}
          {offerData.offerName && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md border-l-4 border-blue-500">
              <h6 className="font-semibold text-blue-800 mb-2">
                Offer Preview:
              </h6>
              <p className="text-blue-700">
                <strong>{offerData.offerName}</strong>
                {offerData.offerType === "percentage" &&
                  offerData.discountValue &&
                  ` - ${offerData.discountValue}% off`}
                {offerData.offerType === "fixed" &&
                  offerData.discountValue &&
                  ` - ₹${offerData.discountValue} off`}
                {offerData.minimumOrderAmount &&
                  ` on orders above ₹${offerData.minimumOrderAmount}`}
              </p>
              {offerData.offerDescription && (
                <p className="text-blue-600 text-sm mt-1">
                  {offerData.offerDescription}
                </p>
              )}
            </div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-6 py-2 text-white rounded-md transition-colors ${
                canSubmit
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting || submitting
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? "Update Offer"
                : "Add Offer"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || submitting}
              className={`px-6 py-2 text-white rounded-md transition-colors ${
                isSubmitting || submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Cancel
            </button>
          </div>

          {/* Additional info for edit mode */}
          {isEditMode && editOffer && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <p>
                  <strong>Offer ID:</strong> {editOffer.offerId}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      editOffer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {editOffer.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
                {editOffer.createdAt && (
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(editOffer.createdAt).toLocaleDateString()}
                  </p>
                )}
                {editOffer.updatedAt && (
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(editOffer.updatedAt).toLocaleDateString()}
                  </p>
                )}
                {editOffer.currentUsageCount !== undefined && (
                  <p>
                    <strong>Times Used:</strong> {editOffer.currentUsageCount}
                  </p>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default OffersFormModal;

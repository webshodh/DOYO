import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Modal from "components/Modal";
import { calculateFinalPrice } from "../../Validation/menuValidation";

const MenuFormModal = ({
  show,
  onClose,
  onSubmit,
  categories,
  mainCategories,
  editMode = false,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    menuName: "",
    menuCookingTime: "",
    menuPrice: "",
    discount: "",
    finalPrice: "",
    menuCategory: "",
    menuContent: "",
    availability: "Available",
    mainCategory: "",
    file: null,
    existingImageUrl: "",
  });

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData && editMode) {
      setFormData({
        menuName: initialData.menuName || "",
        menuCookingTime: initialData.menuCookingTime || "",
        menuPrice: initialData.menuPrice || "",
        discount: initialData.discount || "",
        finalPrice: initialData.finalPrice || "",
        menuCategory: initialData.menuCategory || "",
        menuContent: initialData.menuContent || "",
        availability: initialData.availability || "Available",
        mainCategory: initialData.mainCategory || "",
        file: null,
        existingImageUrl: initialData.imageUrl || "",
      });
    } else {
      // Reset form for new entry
      setFormData({
        menuName: "",
        menuCookingTime: "",
        menuPrice: "",
        discount: "",
        finalPrice: "",
        menuCategory: "",
        menuContent: "",
        availability: "Available",
        mainCategory: "",
        file: null,
        existingImageUrl: "",
      });
    }
  }, [initialData, editMode, show]);

  // Calculate final price when price or discount changes
  useEffect(() => {
    if (formData.menuPrice) {
      const finalPrice = calculateFinalPrice(
        formData.menuPrice,
        formData.discount
      );
      setFormData((prev) => ({ ...prev, finalPrice: finalPrice.toString() }));
    }
  }, [formData.menuPrice, formData.discount]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFormData((prev) => ({ ...prev, file: selectedFile }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      menuName: "",
      menuCookingTime: "",
      menuPrice: "",
      discount: "",
      finalPrice: "",
      menuCategory: "",
      menuContent: "",
      availability: "Available",
      mainCategory: "",
      file: null,
      existingImageUrl: "",
    });
    onClose();
  };

  if (!show) return null;

  return (
    <Modal
      title={editMode ? "Edit Menu" : "Add Menu"}
      handleClose={handleClose}
      children={
        <div className="bg-white p-6 w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Menu Name */}
              <div className="relative col-span-2">
                <label
                  htmlFor="menuName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Menu Name *
                </label>
                <input
                  type="text"
                  id="menuName"
                  value={formData.menuName}
                  onChange={handleInputChange("menuName")}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formData.menuName ? "border-green-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                  placeholder="Enter Menu Name"
                  required
                />
                {formData.menuName && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500 top-6">
                    <FaCheckCircle />
                  </div>
                )}
              </div>

              {/* Menu Price */}
              <div className="relative">
                <label
                  htmlFor="menuPrice"
                  className="block text-sm font-medium text-gray-700"
                >
                  Menu Price *
                </label>
                <input
                  type="number"
                  id="menuPrice"
                  value={formData.menuPrice}
                  onChange={handleInputChange("menuPrice")}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formData.menuPrice ? "border-green-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                  placeholder="Enter Price"
                  min="0"
                  step="0.01"
                  required
                />
                {formData.menuPrice && (
                  <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                )}
              </div>

              {/* Cooking Time */}
              <div className="relative">
                <label
                  htmlFor="cookingTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cooking Time (mins) *
                </label>
                <input
                  type="number"
                  id="cookingTime"
                  value={formData.menuCookingTime}
                  onChange={handleInputChange("menuCookingTime")}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formData.menuCookingTime
                      ? "border-green-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                  placeholder="Enter cooking time"
                  min="1"
                  required
                />
                {formData.menuCookingTime && (
                  <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                )}
              </div>

              {/* Discount */}
              <div className="relative">
                <label
                  htmlFor="discount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  value={formData.discount}
                  onChange={handleInputChange("discount")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter discount percentage"
                  min="0"
                  max="100"
                />
              </div>

              {/* Final Price */}
              <div className="relative">
                <label
                  htmlFor="finalPrice"
                  className="block text-sm font-medium text-gray-700"
                >
                  Final Price
                </label>
                <input
                  type="number"
                  id="finalPrice"
                  value={formData.finalPrice}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  placeholder="Auto-calculated"
                />
              </div>

              {/* Menu Category */}
              <div className="relative">
                <label
                  htmlFor="menuCategory"
                  className="block text-sm font-medium text-gray-700"
                >
                  Menu Category *
                </label>
                <select
                  id="menuCategory"
                  value={formData.menuCategory}
                  onChange={handleInputChange("menuCategory")}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formData.menuCategory
                      ? "border-green-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat, index) => (
                    <option
                      key={index}
                      value={cat.categoryName || cat.name || cat}
                    >
                      {cat.categoryName || cat.name || cat}
                    </option>
                  ))}
                </select>
                {formData.menuCategory && (
                  <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                )}
              </div>

              {/* Main Category */}
              <div className="relative">
                <label
                  htmlFor="mainCategory"
                  className="block text-sm font-medium text-gray-700"
                >
                  Main Category *
                </label>
                <select
                  id="mainCategory"
                  value={formData.mainCategory}
                  onChange={handleInputChange("mainCategory")}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formData.mainCategory
                      ? "border-green-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                  required
                >
                  <option value="">Select main category</option>
                  {mainCategories.map((cat, index) => (
                    <option
                      key={index}
                      value={cat.categoryName || cat.name || cat}
                    >
                      {cat.categoryName || cat.name || cat}
                    </option>
                  ))}
                </select>
                {formData.mainCategory && (
                  <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                )}
              </div>

              {/* Availability */}
              <div className="relative">
                <label
                  htmlFor="availability"
                  className="block text-sm font-medium text-gray-700"
                >
                  Availability
                </label>
                <select
                  id="availability"
                  value={formData.availability}
                  onChange={handleInputChange("availability")}
                  className="mt-1 block w-full px-3 py-2 border border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              {/* File Upload */}
              <div className="relative">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Image
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {formData.existingImageUrl && !formData.file && (
                  <p className="mt-1 text-sm text-gray-500">
                    Current image will be kept if no new image is selected
                  </p>
                )}
              </div>

              {/* Menu Content */}
              <div className="relative col-span-2">
                <label
                  htmlFor="menuContent"
                  className="block text-sm font-medium text-gray-700"
                >
                  Menu Content *
                </label>
                <textarea
                  id="menuContent"
                  rows="3"
                  value={formData.menuContent}
                  onChange={handleInputChange("menuContent")}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    formData.menuContent
                      ? "border-green-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                  placeholder="Enter menu description"
                  required
                />
                {formData.menuContent && (
                  <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                )}
              </div>

              {/* Submit Buttons */}
              <div className="col-span-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {editMode ? "Update Menu" : "Add Menu"}
                </button>
              </div>
            </div>
          </form>
        </div>
      }
    />
  );
};

export default MenuFormModal;

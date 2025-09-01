import React, { useState, useEffect } from "react";
import { FORM_CONFIG, OPTIONS } from "Constants/formConfig";

import { Upload, ChefHat, AlertCircle, X, Save } from "lucide-react";
import { FormSection, getDefaultFormData } from "utility/FormUtilityFunctions";

const MenuFormModal = ({
  show,
  onClose,
  onSubmit,
  categories,
  mainCategories,
  editMode = false,
  initialData = null,
}) => {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [previewImage, setPreviewImage] = useState(null);

  // Initialize form data
  useEffect(() => {
    if (initialData && editMode) {
      setFormData({ ...getDefaultFormData(), ...initialData });
      setPreviewImage(initialData.imageUrl);
    } else {
      setFormData(getDefaultFormData());
      setPreviewImage(null);
    }
  }, [initialData, editMode, show]);

  // Calculate final price
  useEffect(() => {
    if (formData.menuPrice) {
      const price = parseFloat(formData.menuPrice);
      const discountPercent = parseFloat(formData.discount) || 0;
      const finalPrice = price - (price * discountPercent) / 100;
      setFormData((prev) => ({ ...prev, finalPrice: finalPrice.toFixed(2) }));
    }
  }, [formData.menuPrice, formData.discount]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData((prev) => ({ ...prev, file: selectedFile }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData).then((success) => {
      if (success) {
        onClose();
      }
    });
  };

  const handleClose = () => {
    setFormData(getDefaultFormData());
    setPreviewImage(null);
    onClose();
  };

  if (!show) return null;

  // Create external options object with proper structure
  const externalOptions = { 
    categories: categories || [], 
    mainCategories: mainCategories || [] 
  };

  // Debug logging (remove in production)
  console.log('External Options:', externalOptions);
  console.log('Categories:', categories);
  console.log('Main Categories:', mainCategories);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editMode ? "Edit Menu Item" : "Add New Menu Item"}
                </h2>
                <p className="text-orange-100">
                  {editMode
                    ? "Update menu details"
                    : "Create a delicious new menu item"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Upload */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-500" />
                  Menu Image
                </h3>

                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors duration-200">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData((prev) => ({ ...prev, file: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="file"
                      className="block p-8 text-center cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Click to upload image
                      </p>
                      <p className="text-gray-400 text-sm">
                        PNG, JPG up to 10MB
                      </p>
                    </label>
                  )}
                  <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Form Sections */}
            <div className="lg:col-span-2 space-y-6">
              {FORM_CONFIG.sections.map((section) => (
                <FormSection
                  key={section.id}
                  section={section}
                  formData={formData}
                  onChange={setFormData}
                  externalOptions={externalOptions}
                />
              ))}

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
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {editMode ? "Update Menu Item" : "Create Menu Item"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuFormModal;
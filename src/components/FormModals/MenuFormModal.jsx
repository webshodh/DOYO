import React, { useState, useEffect } from "react";
import { FORM_CONFIG } from "Constants/addMenuFormConfig";
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
  hotelName,
}) => {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (initialData && editMode) {
      // Ensure all nested objects are properly initialized
      const sanitizedData = {
        ...getDefaultFormData(),
        ...initialData,
        // Ensure nutritionalInfo is properly initialized
        nutritionalInfo: {
          protein: "",
          carbs: "",
          fat: "",
          fiber: "",
          ...(initialData.nutritionalInfo || {}),
        },
        // Ensure allergens is an array
        allergens: Array.isArray(initialData.allergens)
          ? initialData.allergens
          : [],
      };

      setFormData(sanitizedData);
      setPreviewImage(initialData.imageUrl || initialData.existingImageUrl);
    } else {
      setFormData(getDefaultFormData());
      setPreviewImage(null);
    }
  }, [initialData, editMode, show]);

  // Calculate final price
  useEffect(() => {
    if (formData.menuPrice) {
      const price = parseFloat(formData.menuPrice);
      const discountPercent = parseFloat(formData.discount);
      const finalPrice = price - (price * discountPercent) / 100;

      setFormData((prev) => ({
        ...prev,
        finalPrice: finalPrice.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        finalPrice: "",
      }));
    }
  }, [formData.menuPrice, formData.discount]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Please select a valid image file (JPG, PNG, GIF, WEBP)");
        return;
      }

      // Validate file size (2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (selectedFile.size > maxSize) {
        alert("File size must be less than 2MB");
        return;
      }

      setFormData((prev) => ({ ...prev, file: selectedFile }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "menuName", label: "Menu Name" },
      { field: "menuContent", label: "Description" },
      { field: "menuCookingTime", label: "Cooking Time" },
      { field: "menuPrice", label: "Base Price" },
      { field: "menuCategory", label: "Menu Category" },
      { field: "categoryType", label: "Category Type" },
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ label }) => label).join(", ");
      alert(`Please fill in the following required fields: ${fieldNames}`);
      return false;
    }

    return true;
  };

  const prepareFormDataForSubmission = () => {
    console.log("Raw form data before preparation:", formData); // Debug log

    // Create a comprehensive copy ensuring ALL fields are included and properly typed
    const submissionData = {
      // Basic Information
      menuName: String(formData.menuName || "").trim(),
      menuContent: String(formData.menuContent || "").trim(),
      ingredients: String(formData.ingredients || "").trim(),
      menuCookingTime: parseInt(formData.menuCookingTime),
      servingSize: parseInt(formData.servingSize) || 1,

      // Pricing & Timing
      menuPrice: parseFloat(formData.menuPrice),
      discount: parseFloat(formData.discount),
      finalPrice:
        parseFloat(formData.finalPrice) || parseFloat(formData.menuPrice),
      calories: parseInt(formData.calories),

      // Categories & Classification - CRITICAL: Ensure these are strings, not empty
      mainCategory: String(formData.mainCategory || ""),
      menuCategory: String(formData.menuCategory || ""),
      categoryType: String(formData.categoryType || ""),
      mealType: String(formData.mealType || ""),
      spiceLevel: String(formData.spiceLevel || ""),
      portionSize: String(formData.portionSize || ""),

      // Preparation Details - CRITICAL: Ensure all preparation fields are included
      preparationMethod: String(formData.preparationMethod || ""),
      difficulty: String(formData.difficulty || ""),
      availability: String(formData.availability || "Available"),
      cuisineType: String(formData.cuisineType || ""),
      tasteProfile: String(formData.tasteProfile || ""),
      texture: String(formData.texture || ""),
      cookingStyle: String(formData.cookingStyle || ""),

      // Nutritional Information - CRITICAL: Ensure nested object structure
      nutritionalInfo: {
        protein: parseFloat(formData.nutritionalInfo?.protein),
        carbs: parseFloat(formData.nutritionalInfo?.carbs),
        fat: parseFloat(formData.nutritionalInfo?.fat),
        fiber: parseFloat(formData.nutritionalInfo?.fiber),
      },

      // Special Features - CRITICAL: Ensure ALL boolean flags are explicitly set
      chefSpecial: Boolean(formData.chefSpecial),
      isPopular: Boolean(formData.isPopular),
      isVegan: Boolean(formData.isVegan),
      isGlutenFree: Boolean(formData.isGlutenFree),
      isRecommended: Boolean(formData.isRecommended),
      isSugarFree: Boolean(formData.isSugarFree),
      isMostOrdered: Boolean(formData.isMostOrdered),
      isSeasonal: Boolean(formData.isSeasonal),
      isLimitedEdition: Boolean(formData.isLimitedEdition),
      isOrganic: Boolean(formData.isOrganic),
      isHighProtein: Boolean(formData.isHighProtein),
      isLactoseFree: Boolean(formData.isLactoseFree),
      isJainFriendly: Boolean(formData.isJainFriendly),
      isKidsFriendly: Boolean(formData.isKidsFriendly),
      isBeverageAlcoholic: Boolean(formData.isBeverageAlcoholic),

      // Allergens - CRITICAL: Ensure it's always an array
      allergens: Array.isArray(formData.allergens)
        ? [...formData.allergens]
        : [],

      // File and Image handling
      file: formData.file || null,
      existingImageUrl: String(
        formData.existingImageUrl || formData.imageUrl || ""
      ),
      imageUrl: String(formData.imageUrl || formData.existingImageUrl || ""),

      // System timestamps
      createdAt: editMode
        ? formData.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Preserve UUID if editing
      ...(editMode && formData.uuid && { uuid: formData.uuid }),
    };

    // Additional validation: ensure no undefined values
    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key] === undefined) {
        console.warn(`Warning: Field ${key} is undefined, setting to default`);
        // Set appropriate defaults based on expected type
        if (typeof formData[key] === "boolean") {
          submissionData[key] = false;
        } else if (typeof formData[key] === "number") {
          submissionData[key] = 0;
        } else if (Array.isArray(formData[key])) {
          submissionData[key] = [];
        } else {
          submissionData[key] = "";
        }
      }
    });

    // Validate critical fields are present
    const criticalFields = [
      "menuName",
      "menuContent",
      "menuPrice",
      "menuCategory",
      "categoryType",
      "mainCategory",
      "spiceLevel",
      "portionSize",
      "preparationMethod",
      "difficulty",
      "cuisineType",
      "nutritionalInfo",
      "allergens",
    ];

    criticalFields.forEach((field) => {
      if (!(field in submissionData)) {
        console.error(
          `Critical field ${field} is missing from submission data`
        );
      }
    });

    return submissionData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Current form data on submit:", formData); // Debug log

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = prepareFormDataForSubmission();
      console.log("Final submission data:", submissionData);
      console.log(
        "Number of fields being submitted:",
        Object.keys(submissionData).length
      );

      // Ensure we're passing all the data correctly
      const success = await onSubmit(submissionData);

      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(getDefaultFormData());
    setPreviewImage(null);
    setIsSubmitting(false);
    onClose();
  };

  if (!show) return null;

  // Create external options object with proper structure
  const externalOptions = {
    categories: categories || [],
    mainCategories: mainCategories || [],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ marginTop: "100px" }}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? handleClose : undefined}
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
              disabled={isSubmitting}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Upload */}
              {/* Image/GIF Upload */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-orange-500" />
                    Menu Image/GIF
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
                            setFormData((prev) => ({
                              ...prev,
                              file: null,
                              existingImageUrl: "",
                            }));
                          }}
                          disabled={isSubmitting}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="file"
                        className={`block p-8 text-center ${
                          isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                          Click to upload image or GIF
                        </p>
                        <p className="text-gray-400 text-sm">
                          PNG, JPG, GIF, WEBP up to 2MB
                        </p>
                      </label>
                    )}
                    <input
                      type="file"
                      id="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    hotelName={hotelName}
                  />
                ))}

                {/* Form Actions */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>* Required fields</span>
                  </div>
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting
                        ? "Saving..."
                        : editMode
                        ? "Update"
                        : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuFormModal;

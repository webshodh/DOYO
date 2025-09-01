import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Upload, 
  Clock, 
  DollarSign, 
  Tag, 
  FileText, 
  ChefHat, 
  Star,
  Utensils,
  Leaf,
  AlertCircle,
  X,
  Save,
  Eye
} from "lucide-react";

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
    categoryType: "",
    file: null,
    existingImageUrl: "",
    // New fields for comprehensive menu management
    servingSize: "1",
    spiceLevel: "Medium",
    calories: "",
    preparationMethod: "Fried",
    chefSpecial: false,
    isVegan: false,
    isGlutenFree: false,
    allergens: [],
    nutritionalInfo: {
      protein: "",
      carbs: "",
      fat: "",
      fiber: ""
    },
    ingredients: "",
    portionSize: "Regular",
    mealType: "Main Course",
    difficulty: "Medium",
    isPopular: false
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Predefined options
  const spiceLevels = ["Mild", "Medium", "Hot", "Extra Hot"];
  const preparationMethods = ["Fried", "Grilled", "Baked", "Steamed", "Roasted", "Boiled", "Raw"];
  const portionSizes = ["Small", "Regular", "Large", "Family"];
  const mealTypes = ["Appetizer", "Main Course", "Dessert", "Beverage", "Snack", "Soup", "Salad"];
  const difficultyLevels = ["Easy", "Medium", "Hard"];
  const allergenOptions = ["Nuts", "Dairy", "Gluten", "Eggs", "Soy", "Shellfish", "Fish"];

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
        categoryType: initialData.categoryType || "",
        file: null,
        existingImageUrl: initialData.imageUrl || "",
        servingSize: initialData.servingSize || "1",
        spiceLevel: initialData.spiceLevel || "Medium",
        calories: initialData.calories || "",
        preparationMethod: initialData.preparationMethod || "Fried",
        chefSpecial: initialData.chefSpecial || false,
        isVegan: initialData.isVegan || false,
        isGlutenFree: initialData.isGlutenFree || false,
        allergens: initialData.allergens || [],
        nutritionalInfo: initialData.nutritionalInfo || { protein: "", carbs: "", fat: "", fiber: "" },
        ingredients: initialData.ingredients || "",
        portionSize: initialData.portionSize || "Regular",
        mealType: initialData.mealType || "Main Course",
        difficulty: initialData.difficulty || "Medium",
        isPopular: initialData.isPopular || false
      });
      setPreviewImage(initialData.imageUrl);
    } else {
      resetForm();
    }
  }, [initialData, editMode, show]);

  const resetForm = () => {
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
      categoryType: "",
      file: null,
      existingImageUrl: "",
      servingSize: "1",
      spiceLevel: "Medium",
      calories: "",
      preparationMethod: "Fried",
      chefSpecial: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: [],
      nutritionalInfo: { protein: "", carbs: "", fat: "", fiber: "" },
      ingredients: "",
      portionSize: "Regular",
      mealType: "Main Course",
      difficulty: "Medium",
      isPopular: false
    });
    setPreviewImage(null);
  };

  // Calculate final price when price or discount changes
  useEffect(() => {
    if (formData.menuPrice) {
      const price = parseFloat(formData.menuPrice);
      const discountPercent = parseFloat(formData.discount) || 0;
      const finalPrice = price - (price * discountPercent / 100);
      setFormData((prev) => ({ ...prev, finalPrice: finalPrice.toFixed(2) }));
    }
  }, [formData.menuPrice, formData.discount]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNutritionChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      nutritionalInfo: { ...prev.nutritionalInfo, [field]: value }
    }));
  };

  const handleCheckboxChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleAllergenChange = (allergen) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData((prev) => ({ ...prev, file: selectedFile }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
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
                  {editMode ? "Update menu details" : "Create a delicious new menu item"}
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image Upload */}
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
                          setFormData(prev => ({ ...prev, file: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file" className="block p-8 text-center cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Click to upload image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
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

            {/* Right Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Menu Name */}
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menu Name *
                    </label>
                    <input
                      type="text"
                      value={formData.menuName}
                      onChange={handleInputChange("menuName")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., Butter Chicken, Margherita Pizza"
                      required
                    />
                    {formData.menuName && (
                      <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Menu Content */}
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows="3"
                      value={formData.menuContent}
                      onChange={handleInputChange("menuContent")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Describe the dish, ingredients, and what makes it special..."
                      required
                    />
                    {formData.menuContent && (
                      <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Ingredients */}
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Ingredients
                    </label>
                    <input
                      type="text"
                      value={formData.ingredients}
                      onChange={handleInputChange("ingredients")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., Chicken, Tomatoes, Onions, Spices"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Time */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Pricing & Timing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Menu Price */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.menuPrice}
                      onChange={handleInputChange("menuPrice")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="199"
                      min="0"
                      step="0.01"
                      required
                    />
                    {formData.menuPrice && (
                      <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Discount */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={handleInputChange("discount")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="10"
                      min="0"
                      max="100"
                    />
                  </div>

                  {/* Final Price */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Price (₹)
                    </label>
                    <input
                      type="text"
                      value={formData.finalPrice}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-green-600 font-bold"
                      placeholder="Auto-calculated"
                    />
                  </div>

                  {/* Cooking Time */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cooking Time (mins) *
                    </label>
                    <input
                      type="number"
                      value={formData.menuCookingTime}
                      onChange={handleInputChange("menuCookingTime")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="25"
                      min="1"
                      required
                    />
                    {formData.menuCookingTime && (
                      <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Serving Size */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serves
                    </label>
                    <input
                      type="number"
                      value={formData.servingSize}
                      onChange={handleInputChange("servingSize")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  {/* Calories */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={handleInputChange("calories")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="450"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500" />
                  Categories & Classification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Main Category */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Category
                    </label>
                    <select
                      value={formData.mainCategory}
                      onChange={handleInputChange("mainCategory")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="">Select main category</option>
                      {mainCategories?.map((cat, index) => (
                        <option key={index} value={cat.categoryName || cat.name || cat}>
                          {cat.categoryName || cat.name || cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Menu Category */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menu Category *
                    </label>
                    <select
                      value={formData.menuCategory}
                      onChange={handleInputChange("menuCategory")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select category</option>
                      {categories?.map((cat, index) => (
                        <option key={index} value={cat.categoryName || cat.name || cat}>
                          {cat.categoryName || cat.name || cat}
                        </option>
                      ))}
                    </select>
                    {formData.menuCategory && (
                      <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Category Type */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Type *
                    </label>
                    <select
                      value={formData.categoryType}
                      onChange={handleInputChange("categoryType")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="veg">🥬 Vegetarian</option>
                      <option value="nonveg">🍖 Non-Vegetarian</option>
                    </select>
                    {formData.categoryType && (
                      <CheckCircle className="absolute top-10 right-3 w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Meal Type */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Type
                    </label>
                    <select
                      value={formData.mealType}
                      onChange={handleInputChange("mealType")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      {mealTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Spice Level */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spice Level
                    </label>
                    <select
                      value={formData.spiceLevel}
                      onChange={handleInputChange("spiceLevel")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      {spiceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level} {level === "Mild" ? "🟢" : level === "Medium" ? "🟡" : level === "Hot" ? "🟠" : "🔴"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Portion Size */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portion Size
                    </label>
                    <select
                      value={formData.portionSize}
                      onChange={handleInputChange("portionSize")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      {portionSizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preparation Details */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  Preparation Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Preparation Method */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Method
                    </label>
                    <select
                      value={formData.preparationMethod}
                      onChange={handleInputChange("preparationMethod")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    >
                      {preparationMethods.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={handleInputChange("difficulty")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    >
                      {difficultyLevels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Availability */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      value={formData.availability}
                      onChange={handleInputChange("availability")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    >
                      <option value="Available">✅ Available</option>
                      <option value="Not Available">❌ Not Available</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nutritional Information */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Nutritional Information
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.protein}
                      onChange={handleNutritionChange("protein")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                      placeholder="25"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.carbs}
                      onChange={handleNutritionChange("carbs")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                      placeholder="40"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.fat}
                      onChange={handleNutritionChange("fat")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                      placeholder="15"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.fiber}
                      onChange={handleNutritionChange("fiber")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Special Features */}
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-red-500" />
                  Special Features & Dietary Info
                </h3>
                
                <div className="space-y-4">
                  {/* Special Tags */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={formData.chefSpecial}
                        onChange={handleCheckboxChange("chefSpecial")}
                        className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">Chef's Special</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={handleCheckboxChange("isPopular")}
                        className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Popular</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={formData.isVegan}
                        onChange={handleCheckboxChange("isVegan")}
                        className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Vegan</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={formData.isGlutenFree}
                        onChange={handleCheckboxChange("isGlutenFree")}
                        className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Gluten Free</span>
                      </div>
                    </label>
                  </div>

                  {/* Allergens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Contains Allergens
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                      {allergenOptions.map((allergen) => (
                        <label
                          key={allergen}
                          className={`flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 text-sm font-medium ${
                            formData.allergens.includes(allergen)
                              ? "border-red-500 bg-red-100 text-red-700"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.allergens.includes(allergen)}
                            onChange={() => handleAllergenChange(allergen)}
                            className="sr-only"
                          />
                          {allergen}
                        </label>
                      ))}
                    </div>
                  </div>
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
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {editMode ? "Update Menu Item" : "Create Menu Item"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


export default MenuFormModal;
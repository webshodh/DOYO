import {
  DollarSign,
  Tag,
  FileText,
  ChefHat,
  Star,
  Utensils,
  Leaf,
  AlertCircle,
} from "lucide-react";

// Configuration object for form sections and fields
export const FORM_CONFIG = {
  sections: [
    {
      id: "basic",
      title: "Basic Information",
      icon: FileText,
      bgColor: "blue",
      fields: [
        {
          name: "menuName",
          label: "Menu Name",
          type: "text",
          required: true,
          placeholder: "e.g., Butter Chicken, Margherita Pizza",
          colSpan: 2,
        },
        {
          name: "menuContent",
          label: "Description",
          type: "textarea",
          required: true,
          placeholder:
            "Describe the dish, ingredients, and what makes it special...",
          rows: 3,
          colSpan: 2,
        },
        {
          name: "ingredients",
          label: "Key Ingredients",
          type: "text",
          placeholder: "e.g., Chicken, Tomatoes, Onions, Spices",
          colSpan: 2,
        },
        {
          name: "menuCookingTime",
          label: "Cooking Time (mins)",
          type: "number",
          required: true,
          placeholder: "25",
          min: "1",
        },
        {
          name: "servingSize",
          label: "Serves",
          type: "number",
          placeholder: "1",
          min: "1",
        },
      ],
    },
    {
      id: "pricing",
      title: "Pricing & Timing",
      icon: DollarSign,
      bgColor: "green",
      fields: [
        {
          name: "menuPrice",
          label: "Base Price (₹)",
          type: "number",
          required: true,
          placeholder: "199",
          min: "0",
          step: "0.01",
        },
        {
          name: "discount",
          label: "Discount (%)",
          type: "number",
          placeholder: "10",
          min: "0",
          max: "100",
        },
        {
          name: "finalPrice",
          label: "Final Price (₹)",
          type: "text",
          readonly: true,
          placeholder: "Auto-calculated",
        },

        {
          name: "calories",
          label: "Calories (kcal)",
          type: "number",
          placeholder: "450",
          min: "0",
        },
      ],
    },
    {
      id: "categories",
      title: "Categories & Classification",
      icon: Tag,
      bgColor: "purple",
      fields: [
        {
          name: "mainCategory",
          label: "Main Category",
          type: "select",
          options: "mainCategories",
        },
        {
          name: "menuCategory",
          label: "Menu Category",
          type: "select",
          required: true,
          options: "categories",
        },
        {
          name: "categoryType",
          label: "Category Type",
          type: "select",
          required: true,
          options: [
            { value: "veg", label: "🥬 Vegetarian" },
            { value: "nonveg", label: "🍖 Non-Vegetarian" },
          ],
        },
        {
          name: "mealType",
          label: "Meal Type",
          type: "select",
          options: "mealTypes",
        },
        {
          name: "spiceLevel",
          label: "Spice Level",
          type: "select",
          options: "spiceLevels",
        },
        {
          name: "portionSize",
          label: "Portion Size",
          type: "select",
          options: "portionSizes",
        },
      ],
    },
    {
      id: "preparation",
      title: "Preparation Details",
      icon: Utensils,
      bgColor: "orange",
      fields: [
        {
          name: "preparationMethod",
          label: "Preparation Method",
          type: "select",
          options: "preparationMethods",
        },
        {
          name: "difficulty",
          label: "Difficulty Level",
          type: "select",
          options: "difficultyLevels",
        },
        {
          name: "availability",
          label: "Availability",
          type: "select",
          options: [
            { value: "Available", label: "✅ Available" },
            { value: "Not Available", label: "❌ Not Available" },
          ],
        },
        {
          name: "cuisineType",
          label: "Cuisine Type",
          type: "select",
          options: "cuisineTypes",
        },
        {
          name: "tasteProfile",
          label: "Taste Profile ",
          type: "select",
          options: "tasteProfiles",
        },
        {
          name: "texture",
          label: "Texture",
          type: "select",
          options: "textures",
        },
        {
          name: "cookingStyle",
          label: "Cooking Style",
          type: "select",
          options: "cookingStyles",
        },
      ],
    },
    {
      id: "nutrition",
      title: "Nutritional Information",
      icon: Star,
      bgColor: "yellow",
      fields: [
        {
          name: "nutritionalInfo.protein",
          label: "Protein (g)",
          type: "number",
          placeholder: "25",
          min: "0",
        },
        {
          name: "nutritionalInfo.carbs",
          label: "Carbs (g)",
          type: "number",
          placeholder: "40",
          min: "0",
        },
        {
          name: "nutritionalInfo.fat",
          label: "Fat (g)",
          type: "number",
          placeholder: "15",
          min: "0",
        },
        {
          name: "nutritionalInfo.fiber",
          label: "Fiber (g)",
          type: "number",
          placeholder: "5",
          min: "0",
        },
      ],
    },
    {
      id: "features",
      title: "Special Features",
      icon: Leaf,
      bgColor: "red",
      fields: [
        {
          name: "chefSpecial",
          label: "Chef's Special",
          type: "checkbox",
          icon: ChefHat,
          iconColor: "orange",
        },
        {
          name: "isPopular",
          label: "Popular",
          type: "checkbox",
          icon: Star,
          iconColor: "yellow",
        },

        {
          name: "isRecommended",
          label: "Recommended",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },

        {
          name: "isMostOrdered",
          label: "Most Ordered",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },
        {
          name: "isSeasonal",
          label: "Seasonal",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },

        {
          name: "isLimitedEdition",
          label: "Limited Edition",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },
      ],
    },
    {
      id: "Dietary",
      title: "Dietary Info",
      icon: Leaf,
      bgColor: "orange",
      fields: [
        {
          name: "isVegan",
          label: "Vegan",
          type: "checkbox",
          icon: Leaf,
          iconColor: "green",
        },
        {
          name: "isGlutenFree",
          label: "Gluten Free",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },

        {
          name: "isSugarFree",
          label: "Sugar Free",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },

        {
          name: "isOrganic",
          label: "Organic",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },
        {
          name: "isHighProtein",
          label: "High Protein",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },
        {
          name: "isLactoseFree",
          label: "Lactose Free",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },
        {
          name: "isJainFriendly",
          label: "Jain Friendly",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },
        {
          name: "isKidsFriendly",
          label: "Kids Friendly ",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },
        {
          name: "isBeverageAlcoholic",
          label: "Beverage Alcoholic",
          type: "checkbox",
          icon: AlertCircle,
          iconColor: "blue",
        },

        {
          name: "allergens",
          label: "Contains Allergens",
          type: "multiselect",
          options: "allergenOptions",
          colSpan: 2,
        },
      ],
    },
  ],
};

// Predefined options
export const OPTIONS = {
  // Spice Levels
  spiceLevels: ["None", "Mild", "Medium", "Hot", "Extra Hot", "Extreme"],

  // Preparation Methods
  preparationMethods: [
    "Fried",
    "Grilled",
    "Baked",
    "Steamed",
    "Roasted",
    "Boiled",
    "Raw",
    "Smoked",
    "Poached",
    "Sous Vide",
    "Stir-Fried",
    "Tandoor",
    "Slow Cooked",
  ],

  // Portion Sizes
  portionSizes: [
    "Kids",
    "Small",
    "Regular",
    "Large",
    "Family",
    "Party Platter",
  ],

  // Meal Types
  mealTypes: [
    "Appetizer",
    "Main Course",
    "Dessert",
    "Beverage",
    "Snack",
    "Soup",
    "Salad",
    "Side Dish",
    "Breakfast",
    "Brunch",
    "Lunch",
    "Dinner",
    "Late Night",
  ],

  // Difficulty Levels
  difficultyLevels: ["Easy", "Medium", "Hard", "Expert"],

  // Allergen Options
  allergenOptions: [
    "Nuts",
    "Dairy",
    "Gluten",
    "Eggs",
    "Soy",
    "Shellfish",
    "Fish",
    "Sesame",
    "Mustard",
    "Corn",
    "Peanuts",
    "Wheat",
    "Sulphites",
  ],

  // Cuisine Types
  cuisineTypes: [
    "Indian",
    "Chinese",
    "Italian",
    "Mexican",
    "Thai",
    "Japanese",
    "Korean",
    "Mediterranean",
    "American",
    "French",
    "Middle Eastern",
    "Spanish",
    "Fusion",
    "Continental",
  ],

  // Taste Profiles
  tasteProfiles: [
    "Sweet",
    "Savory",
    "Spicy",
    "Tangy",
    "Bitter",
    "Umami",
    "Sour",
    "Smoky",
    "Earthy",
  ],

  // Texture Types
  textures: [
    "Crispy",
    "Crunchy",
    "Creamy",
    "Chewy",
    "Soft",
    "Fluffy",
    "Juicy",
    "Tender",
    "Silky",
    "Sticky",
  ],

  // Cooking Styles
  cookingStyles: [
    "Tandoor",
    "Stir-Fry",
    "Deep-Fry",
    "Grill",
    "BBQ",
    "Stew",
    "Curry",
    "Pan-Seared",
    "Oven-Roasted",
  ],

  // Food Category Tags
  foodCategoryTags: [
    "Healthy",
    "Street Food",
    "Comfort Food",
    "Luxury",
    "Budget-Friendly",
    "Signature Dish",
    "Festive",
    "Quick Bite",
    "Viral",
    "Traditional",
    "Fusion",
  ],
};

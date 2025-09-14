import {
  AlertCircle,
  Star,
  Shield,
  Leaf,
  Heart,
  ChefHat,
  Utensils,
  Info,
} from "lucide-react";

// Pre-configured section configurations with enhanced items
export const getDietaryItems = () => [
  {
    label: "Vegan",
    key: "isVegan",
    type: "boolean",
    labelColor: "text-green-600",
    icon: Leaf,
  },
  {
    label: "Gluten Free",
    key: "isGlutenFree",
    type: "boolean",
    labelColor: "text-blue-600",
    icon: Shield,
  },
  {
    label: "Sugar Free",
    key: "isSugarFree",
    type: "boolean",
    labelColor: "text-purple-600",
    icon: Heart,
  },
  {
    label: "Lactose Free",
    key: "isLactoseFree",
    type: "boolean",
    labelColor: "text-orange-600",
    icon: Shield,
  },
  {
    label: "Jain Friendly",
    key: "isJainFriendly",
    type: "boolean",
    labelColor: "text-yellow-600",
    icon: Star,
  },
  {
    label: "Organic",
    key: "isOrganic",
    type: "boolean",
    labelColor: "text-green-600",
    icon: Leaf,
  },
  {
    label: "Kids Friendly",
    key: "isKidsFriendly",
    type: "boolean",
    labelColor: "text-blue-600",
    icon: Heart,
  },
];

export const getAdditionalDetails = () => [
  {
    label: "Menu Category",
    key: "menuCategory",
    type: "badge",
    icon: Utensils,
  },
  {
    label: "Meal Type",
    key: "mealType",
    type: "badge",
    icon: ChefHat,
  },
  {
    label: "Cuisine Type",
    key: "cuisineType",
    type: "conditional",
    icon: Star,
  },
  {
    label: "Spice Level",
    key: "spiceLevel",
    type: "conditional",
    icon: AlertCircle,
  },
];

export const getPreparationItems = () => [
  {
    label: "Preparation Method",
    key: "preparationMethod",
    type: "conditional",
    icon: ChefHat,
  },
  {
    label: "Cooking Style",
    key: "cookingStyle",
    type: "conditional",
    icon: Utensils,
  },
  {
    label: "Taste Profile",
    key: "tasteProfile",
    type: "conditional",
    icon: Star,
  },
  {
    label: "Texture",
    key: "texture",
    type: "conditional",
    icon: Info,
  },
];

export const getNutritionItems = () => [
  {
    label: "Calories",
    key: "calories",
    type: "number",
    labelColor: "text-orange-600",
    customRenderer: (value) => `${value || 0} kcal`,
  },
  {
    label: "Protein",
    key: "protein",
    type: "number",
    labelColor: "text-blue-600",
    customRenderer: (value) => `${value || 0}g`,
  },
  {
    label: "Carbs",
    key: "carbs",
    type: "number",
    labelColor: "text-green-600",
    customRenderer: (value) => `${value || 0}g`,
  },
  {
    label: "Fat",
    key: "fat",
    type: "number",
    labelColor: "text-red-600",
    customRenderer: (value) => `${value || 0}g`,
  },
];

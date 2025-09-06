import React from "react";
import { Leaf } from "lucide-react";

// Simple, reliable ingredient tag component
const SimpleIngredientsDisplay = ({ ingredients }) => {
  // Don't render if no ingredients
  if (!ingredients || ingredients.trim() === "") return null;

  // Simple splitting - just by comma and semicolon
  const ingredientsList = ingredients
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Predefined colors that definitely work
  const colors = [
    { bg: "bg-red-500", text: "text-white" },
    { bg: "bg-blue-500", text: "text-white" },
    { bg: "bg-green-500", text: "text-white" },
    { bg: "bg-purple-500", text: "text-white" },
    { bg: "bg-pink-500", text: "text-white" },
    { bg: "bg-indigo-500", text: "text-white" },
    { bg: "bg-yellow-500", text: "text-black" },
    { bg: "bg-teal-500", text: "text-white" },
    { bg: "bg-orange-500", text: "text-white" },
    { bg: "bg-cyan-500", text: "text-white" },
    { bg: "bg-lime-500", text: "text-black" },
    { bg: "bg-rose-500", text: "text-white" },
  ];

  return (
    <div className="border-t border-orange-200 pt-4">
      <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-green-500" />
        Key Ingredients:
      </p>

      <div className="flex flex-wrap gap-2">
        {ingredientsList.map((ingredient, index) => {
          const colorIndex = index % colors.length;
          const color = colors[colorIndex];

          return (
            <span
              key={`ingredient-${index}`}
              className={`
                inline-block px-3 py-1 rounded-full text-sm font-medium
                ${color.bg} ${color.text}
                shadow-sm hover:shadow-md
                transform transition-all duration-200 hover:scale-105
              `}
            >
              {ingredient}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Alternative with gradients using inline styles (more reliable)
const GradientIngredientsDisplay = ({ ingredients }) => {
  if (!ingredients || ingredients.trim() === "") return null;

  const ingredientsList = ingredients
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Gradient styles as inline CSS (more reliable than Tailwind gradients)
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)",
    "linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)",
    "linear-gradient(135deg, #b794f6 0%, #f093fb 100%)",
    "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    "linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)",
  ];

  return (
    <div className="border-t border-orange-200 pt-4">
      <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-green-500" />
        Key Ingredients:
      </p>

      <div className="flex flex-wrap gap-2">
        {ingredientsList.map((ingredient, index) => {
          const gradientIndex = index % gradients.length;

          return (
            <span
              key={`gradient-ingredient-${index}`}
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white shadow-sm hover:shadow-md transform transition-all duration-200 hover:scale-105"
              style={{
                background: gradients[gradientIndex],
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {ingredient}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Debug version to help troubleshoot
const DebugIngredientsDisplay = ({ ingredients }) => {
  console.log("DebugIngredientsDisplay received:", {
    ingredients,
    type: typeof ingredients,
  });

  if (!ingredients) {
    return (
      <div className="border-t border-orange-200 pt-4">
        <p className="text-red-500">No ingredients provided</p>
      </div>
    );
  }

  if (ingredients.trim() === "") {
    return (
      <div className="border-t border-orange-200 pt-4">
        <p className="text-red-500">Empty ingredients string</p>
      </div>
    );
  }

  const ingredientsList = ingredients
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  console.log("Processed ingredients list:", ingredientsList);

  return (
    <div className="border-t border-orange-200 pt-4">
      <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-green-500" />
        Key Ingredients: ({ingredientsList.length} found)
      </p>

      <div className="mb-2 text-xs text-gray-500">
        Raw: {JSON.stringify(ingredients)}
      </div>

      <div className="flex flex-wrap gap-2">
        {ingredientsList.length === 0 ? (
          <p className="text-red-500">No ingredients after processing</p>
        ) : (
          ingredientsList.map((ingredient, index) => (
            <span
              key={`debug-ingredient-${index}`}
              className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white shadow-sm"
            >
              {ingredient} (#{index})
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export {
  SimpleIngredientsDisplay,
  GradientIngredientsDisplay,
  DebugIngredientsDisplay,
};

import React, { memo, useMemo, useState } from "react";
import {
  Leaf,
  ChefHat,
  Sparkles,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  Plus,
} from "lucide-react";

// Constants moved outside components for better performance
const INGREDIENT_COLORS = [
  { bg: "bg-red-500", text: "text-white", hover: "hover:bg-red-600" },
  { bg: "bg-blue-500", text: "text-white", hover: "hover:bg-blue-600" },
  { bg: "bg-green-500", text: "text-white", hover: "hover:bg-green-600" },
  { bg: "bg-purple-500", text: "text-white", hover: "hover:bg-purple-600" },
  { bg: "bg-pink-500", text: "text-white", hover: "hover:bg-pink-600" },
  { bg: "bg-indigo-500", text: "text-white", hover: "hover:bg-indigo-600" },
  { bg: "bg-yellow-500", text: "text-black", hover: "hover:bg-yellow-600" },
  { bg: "bg-teal-500", text: "text-white", hover: "hover:bg-teal-600" },
  { bg: "bg-orange-500", text: "text-white", hover: "hover:bg-orange-600" },
  { bg: "bg-cyan-500", text: "text-white", hover: "hover:bg-cyan-600" },
  { bg: "bg-lime-500", text: "text-black", hover: "hover:bg-lime-600" },
  { bg: "bg-rose-500", text: "text-white", hover: "hover:bg-rose-600" },
  { bg: "bg-emerald-500", text: "text-white", hover: "hover:bg-emerald-600" },
  { bg: "bg-sky-500", text: "text-white", hover: "hover:bg-sky-600" },
  { bg: "bg-violet-500", text: "text-white", hover: "hover:bg-violet-600" },
];

const GRADIENT_STYLES = [
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
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)",
];

// Utility function for parsing ingredients
const parseIngredients = (ingredients) => {
  if (!ingredients || typeof ingredients !== "string") return [];

  return ingredients
    .split(/[,;|\n]/) // Support comma, semicolon, pipe, and newline separators
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 20); // Limit to 20 ingredients for performance
};

// Individual ingredient tag component
const IngredientTag = memo(
  ({
    ingredient,
    index,
    variant = "solid",
    size = "md",
    interactive = false,
    onTagClick,
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-2 text-base",
    };

    const handleClick = () => {
      if (interactive && onTagClick) {
        onTagClick(ingredient, index);
      }
    };

    const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-full
    transition-all duration-200 transform select-none
    ${sizeClasses[size]}
    ${
      interactive
        ? "cursor-pointer hover:scale-105 active:scale-95"
        : "cursor-default"
    }
    ${isHovered && interactive ? "shadow-lg" : "shadow-sm"}
  `;

    if (variant === "gradient") {
      const gradient = GRADIENT_STYLES[index % GRADIENT_STYLES.length];

      return (
        <span
          className={`${baseClasses} text-white`}
          style={{
            background: gradient,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: isHovered
              ? "0 8px 16px rgba(0,0,0,0.15)"
              : "0 2px 8px rgba(0,0,0,0.1)",
          }}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={
            interactive ? `Click to view details for ${ingredient}` : undefined
          }
        >
          {ingredient}
        </span>
      );
    }

    if (variant === "outline") {
      const color = INGREDIENT_COLORS[index % INGREDIENT_COLORS.length];

      return (
        <span
          className={`
          ${baseClasses} border-2 bg-white transition-colors duration-200
          ${color.bg.replace("bg-", "border-")} ${color.bg.replace(
            "bg-",
            "text-"
          )}
          ${interactive ? `hover:${color.bg} hover:text-white` : ""}
        `}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={
            interactive ? `Click to view details for ${ingredient}` : undefined
          }
        >
          {ingredient}
        </span>
      );
    }

    // Default solid variant
    const color = INGREDIENT_COLORS[index % INGREDIENT_COLORS.length];

    return (
      <span
        className={`
        ${baseClasses}
        ${color.bg} ${color.text} ${interactive ? color.hover : ""}
      `}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={
          interactive ? `Click to view details for ${ingredient}` : undefined
        }
      >
        {ingredient}
      </span>
    );
  }
);

IngredientTag.displayName = "IngredientTag";

// Enhanced ingredients display with multiple variants
const EnhancedIngredientsDisplay = memo(
  ({
    ingredients,
    variant = "solid", // solid, gradient, outline
    size = "md", // sm, md, lg
    title = "Key Ingredients",
    icon: CustomIcon,
    showCount = true,
    maxDisplay = 15,
    collapsible = false,
    interactive = false,
    onIngredientClick,
    className = "",
    style = {},
  }) => {
    const [isExpanded, setIsExpanded] = useState(!collapsible);

    const ingredientsList = useMemo(
      () => parseIngredients(ingredients),
      [ingredients]
    );

    if (ingredientsList.length === 0) return null;

    const Icon = CustomIcon || Leaf;
    const displayItems = isExpanded
      ? ingredientsList
      : ingredientsList.slice(0, maxDisplay);
    const hasMore = ingredientsList.length > maxDisplay;

    const handleIngredientClick = (ingredient, index) => {
      if (onIngredientClick) {
        onIngredientClick(ingredient, index, ingredientsList);
      }
    };

    return (
      <section
        className={`border-t border-orange-200 pt-6 pb-2 ${className}`}
        style={style}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-gray-700 font-semibold text-base">
            <Icon
              className="w-5 h-5 text-green-500 flex-shrink-0"
              aria-hidden="true"
            />
            {title}
            {showCount && (
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {ingredientsList.length}
              </span>
            )}
          </h3>

          {collapsible && hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
              aria-label={
                isExpanded ? "Show less ingredients" : "Show more ingredients"
              }
            >
              {isExpanded ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show All ({ingredientsList.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Ingredients Grid */}
        <div className="flex flex-wrap gap-2 mb-2">
          {displayItems.map((ingredient, index) => (
            <IngredientTag
              key={`ingredient-${index}`}
              ingredient={ingredient}
              index={index}
              variant={variant}
              size={size}
              interactive={interactive}
              onTagClick={handleIngredientClick}
            />
          ))}
        </div>

        {/* Show more button for non-collapsible */}
        {!collapsible && hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors flex items-center gap-1"
            aria-label={`Show ${
              ingredientsList.length - maxDisplay
            } more ingredients`}
          >
            <Plus className="w-4 h-4" />
            Show {ingredientsList.length - maxDisplay} more
          </button>
        )}

        {/* Interactive helper text */}
        {interactive && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Click on ingredients for more details
          </p>
        )}
      </section>
    );
  }
);

EnhancedIngredientsDisplay.displayName = "EnhancedIngredientsDisplay";

// Simplified version for basic use cases
const SimpleIngredientsDisplay = memo(({ ingredients, className = "" }) => {
  return (
    <EnhancedIngredientsDisplay
      ingredients={ingredients}
      variant="solid"
      size="md"
      className={className}
      showCount={false}
      collapsible={false}
    />
  );
});

SimpleIngredientsDisplay.displayName = "SimpleIngredientsDisplay";

// Gradient version
const GradientIngredientsDisplay = memo(({ ingredients, className = "" }) => {
  return (
    <EnhancedIngredientsDisplay
      ingredients={ingredients}
      variant="gradient"
      size="md"
      title="Premium Ingredients"
      icon={Sparkles}
      className={className}
      showCount={true}
      collapsible={false}
    />
  );
});

GradientIngredientsDisplay.displayName = "GradientIngredientsDisplay";

// Interactive version with click handlers
const InteractiveIngredientsDisplay = memo(
  ({ ingredients, onIngredientClick, className = "" }) => {
    return (
      <EnhancedIngredientsDisplay
        ingredients={ingredients}
        variant="outline"
        size="md"
        title="Chef's Selection"
        icon={ChefHat}
        className={className}
        showCount={true}
        collapsible={true}
        interactive={true}
        onIngredientClick={onIngredientClick}
        maxDisplay={8}
      />
    );
  }
);

InteractiveIngredientsDisplay.displayName = "InteractiveIngredientsDisplay";

// Debug version for development
const DebugIngredientsDisplay = memo(({ ingredients }) => {
  const ingredientsList = useMemo(
    () => parseIngredients(ingredients),
    [ingredients]
  );

  if (!ingredients) {
    return (
      <section className="border-t border-red-200 pt-4 bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">Debug: No ingredients provided</span>
        </div>
        <p className="text-sm text-red-500">
          Ingredients prop is null or undefined
        </p>
      </section>
    );
  }

  if (typeof ingredients !== "string") {
    return (
      <section className="border-t border-red-200 pt-4 bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">
            Debug: Invalid ingredients format
          </span>
        </div>
        <p className="text-sm text-red-500">
          Expected string, received: {typeof ingredients}
        </p>
        <pre className="text-xs mt-2 bg-red-100 p-2 rounded border overflow-auto">
          {JSON.stringify(ingredients, null, 2)}
        </pre>
      </section>
    );
  }

  if (ingredients.trim() === "") {
    return (
      <section className="border-t border-red-200 pt-4 bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">Debug: Empty ingredients string</span>
        </div>
        <p className="text-sm text-red-500">
          Ingredients string is empty or contains only whitespace
        </p>
      </section>
    );
  }

  if (ingredientsList.length === 0) {
    return (
      <section className="border-t border-red-200 pt-4 bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">
            Debug: No valid ingredients found
          </span>
        </div>
        <p className="text-sm text-red-500">
          No ingredients found after parsing
        </p>
        <p className="text-xs mt-2 text-red-400">Raw input: "{ingredients}"</p>
      </section>
    );
  }

  return (
    <section className="border-t border-blue-200 pt-4 bg-blue-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 text-blue-600 mb-4">
        <Info className="w-4 h-4" />
        <span className="font-semibold">Debug: Ingredients Analysis</span>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-blue-800">Raw input:</span>
          <pre className="bg-blue-100 p-2 rounded mt-1 text-xs overflow-auto border">
            {ingredients}
          </pre>
        </div>

        <div>
          <span className="font-medium text-blue-800">Parsed count:</span>
          <span className="ml-2 text-blue-600">
            {ingredientsList.length} ingredients
          </span>
        </div>

        <div>
          <span className="font-medium text-blue-800">Parsed ingredients:</span>
          <div className="flex flex-wrap gap-1 mt-2">
            {ingredientsList.map((ingredient, index) => (
              <span
                key={`debug-${index}`}
                className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-medium"
              >
                {index + 1}. {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

DebugIngredientsDisplay.displayName = "DebugIngredientsDisplay";

// Export all variants
export {
  // Main enhanced component
  EnhancedIngredientsDisplay,

  // Simple variants
  SimpleIngredientsDisplay,
  GradientIngredientsDisplay,
  InteractiveIngredientsDisplay,

  // Utility components
  IngredientTag,
  DebugIngredientsDisplay,

  // Utility function
  parseIngredients,

  // Constants for customization
  INGREDIENT_COLORS,
  GRADIENT_STYLES,
};

// Default export
export default EnhancedIngredientsDisplay;

// src/components/atoms/QuantityControls/QuantityControls.jsx
import React, { memo, useCallback } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

const QuantityControls = memo(
  ({
    // Quantity value (supports both direct value and item object)
    quantity,
    item,

    // Event handlers (flexible API)
    onIncrease,
    onDecrease,
    onQuantityChange, // Alternative handler that passes item and delta
    onRemove, // Optional remove handler

    // State and validation
    isUpdating = false,
    isAvailable = true,
    minQuantity = 0,
    maxQuantity = 99,

    // Styling options
    variant = "default", // "default" | "cart" | "menu" | "minimal"
    size = "md", // "sm" | "md" | "lg"
    color = "orange", // "orange" | "gray" | "blue" | "green"

    // Behavior options
    showTrashIcon = true, // Show trash when quantity is at minimum
    showQuantityWhenZero = false, // Show component even when quantity is 0

    // Custom styling
    className = "",
  }) => {
    // Normalize quantity value (support both direct quantity and item.quantity)
    const currentQuantity =
      quantity !== undefined ? quantity : item?.quantity || 0;

    // Validation
    const canDecrease =
      currentQuantity > minQuantity && isAvailable && !isUpdating;
    const canIncrease =
      currentQuantity < maxQuantity && isAvailable && !isUpdating;
    const isAtMinimum = currentQuantity <= minQuantity;
    const showTrash = showTrashIcon && isAtMinimum && canDecrease;

    // FIXED: Move all hooks before any early returns
    // Event handlers - moved before early return
    const handleDecrease = useCallback(() => {
      if (!canDecrease) return;

      if (onQuantityChange && item) {
        onQuantityChange(item, -1);
      } else if (onDecrease) {
        onDecrease();
      } else if (onRemove && isAtMinimum) {
        onRemove(item || { quantity: currentQuantity });
      }
    }, [
      canDecrease,
      onQuantityChange,
      onDecrease,
      onRemove,
      item,
      isAtMinimum,
      currentQuantity,
    ]);

    const handleIncrease = useCallback(() => {
      if (!canIncrease) return;

      if (onQuantityChange && item) {
        onQuantityChange(item, 1);
      } else if (onIncrease) {
        onIncrease();
      }
    }, [canIncrease, onQuantityChange, onIncrease, item]);

    // Early return AFTER all hooks
    if (currentQuantity === 0 && !showQuantityWhenZero) {
      return null;
    }

    // Size configurations
    const sizeConfig = {
      sm: {
        button: "p-1 text-xs",
        display: "px-2 py-1 text-xs min-w-[28px]",
        icon: 12,
      },
      md: {
        button: "p-1.5 text-sm",
        display: "px-3 py-1.5 text-sm min-w-[32px]",
        icon: 14,
      },
      lg: {
        button: "p-2 text-base",
        display: "px-4 py-2 text-base min-w-[40px]",
        icon: 16,
      },
    };

    // Color schemes
    const colorSchemes = {
      orange: {
        container: "bg-orange-50 border-orange-200",
        text: "text-orange-700",
        button: "text-orange-600 hover:bg-orange-100 focus:ring-orange-500",
        buttonDisabled: "text-orange-300",
      },
      gray: {
        container: "bg-gray-50 border-gray-200",
        text: "text-gray-700",
        button: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
        buttonDisabled: "text-gray-300",
      },
      blue: {
        container: "bg-blue-50 border-blue-200",
        text: "text-blue-700",
        button: "text-blue-600 hover:bg-blue-100 focus:ring-blue-500",
        buttonDisabled: "text-blue-300",
      },
      green: {
        container: "bg-green-50 border-green-200",
        text: "text-green-700",
        button: "text-green-600 hover:bg-green-100 focus:ring-green-500",
        buttonDisabled: "text-green-300",
      },
    };

    // Variant styles
    const variantStyles = {
      default: "rounded-lg border shadow-sm",
      cart: "rounded-lg border shadow-sm",
      menu: "rounded-md border",
      minimal: "rounded border-0 bg-transparent",
    };

    const currentSize = sizeConfig[size];
    const currentColor = colorSchemes[color];
    const currentVariant = variantStyles[variant];

    return (
      <div
        className={`
          flex items-center
          ${currentColor.container}
          ${currentVariant}
          ${className}
        `}
        role="group"
        aria-label="Quantity controls"
      >
        {/* Decrease Button */}
        <button
          onClick={handleDecrease}
          disabled={!canDecrease}
          className={`
            ${currentSize.button}
            ${canDecrease ? currentColor.button : currentColor.buttonDisabled}
            rounded-l-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-inset
          `}
          aria-label={showTrash ? "Remove item" : "Decrease quantity"}
          title={showTrash ? "Remove item" : "Decrease quantity"}
        >
          {showTrash ? (
            <Trash2 size={currentSize.icon} />
          ) : (
            <Minus size={currentSize.icon} />
          )}
        </button>

        {/* Quantity Display */}
        <div
          className={`
            ${currentSize.display}
            ${currentColor.text}
            font-semibold text-center
            select-none
          `}
          aria-live="polite"
          aria-label={`Quantity: ${currentQuantity}`}
        >
          {isUpdating ? "..." : currentQuantity}
        </div>

        {/* Increase Button */}
        <button
          onClick={handleIncrease}
          disabled={!canIncrease}
          className={`
            ${currentSize.button}
            ${canIncrease ? currentColor.button : currentColor.buttonDisabled}
            rounded-r-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-inset
          `}
          aria-label="Increase quantity"
          title="Increase quantity"
        >
          <Plus size={currentSize.icon} />
        </button>
      </div>
    );
  },
);

QuantityControls.displayName = "QuantityControls";

export default QuantityControls;

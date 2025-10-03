import React, { memo } from "react";
import { Plus } from "lucide-react";

const AddToCartButton = memo(
  ({ onClick, isAvailable = true, isLoading = false }) => {
    return (
      <button
        onClick={onClick}
        disabled={!isAvailable || isLoading}
        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95"
        aria-label="Add item to cart"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <Plus size={16} />
        )}
      </button>
    );
  },
);

AddToCartButton.displayName = "AddToCartButton";

export default AddToCartButton;

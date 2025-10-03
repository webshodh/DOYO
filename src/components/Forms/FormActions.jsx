// src/components/form/FormActions.jsx
import React from "react";
import { ArrowLeft, Plus, Save, Loader } from "lucide-react";

export function FormCancelButton({ onCancel, disabled, text }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      disabled={disabled}
      className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
    >
      <ArrowLeft className="w-4 h-4" /> {text}
    </button>
  );
}

export function FormSubmitButton({
  onClick,
  disabled,
  isEditMode,
  isLoading,
  text,
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl text-white transition-all duration-200 ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : isEditMode
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isLoading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : isEditMode ? (
        <Save className="w-4 h-4" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      {text}
    </button>
  );
}

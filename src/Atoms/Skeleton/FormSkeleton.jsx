import React, { memo } from "react";

const FormSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    {/* Form Header */}
    <div className="mb-6">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>

    {/* Form Fields */}
    <div className="space-y-6">
      {[1, 2, 3, 4].map((item) => (
        <div key={item}>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
      ))}

      {/* Textarea Field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-24 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>

    {/* Form Actions */}
    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
      <div className="h-10 bg-gray-200 rounded w-20" />
      <div className="h-10 bg-gray-200 rounded w-24" />
    </div>
  </div>
));

FormSkeleton.displayName = "FormSkeleton";

export default FormSkeleton;

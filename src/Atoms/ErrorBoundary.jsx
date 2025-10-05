import React, { memo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorBoundary = memo(({ error, onRetry }) => (
  <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Something went wrong
        </h3>
        <p className="text-gray-600 max-w-md">
          {error?.message ||
            "An unexpected error occurred while loading the dashboard data."}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}

      <details className="mt-4 text-left">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Technical Details
        </summary>
        <pre className="mt-2 text-xs text-gray-700 bg-gray-50 p-3 rounded border overflow-x-auto">
          {error?.stack ||
            error?.toString() ||
            "No additional details available"}
        </pre>
      </details>
    </div>
  </div>
));

ErrorBoundary.displayName = "ErrorBoundary";

export default ErrorBoundary;

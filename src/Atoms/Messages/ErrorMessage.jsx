import React from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

const ErrorMessage = ({
  message,
  error,
  onRetry,
  title = "Error Loading Data",
  retryText = "Try Again",
  showRetryButton = true,
  className = "",
  containerClassName = "container mx-auto px-4 py-8",
  variant = "default", // 'default', 'compact', 'inline'
}) => {
  // Don't render if no error message or error object
  if (!message && !error) return null;

  const errorMessage = message || error?.message || "Something went wrong";

  // Compact variant for smaller spaces
  if (variant === "compact") {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
          {showRetryButton && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              <LoaderCircle className="w-3 h-3" />
              {retryText}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline variant for form errors or small components
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{errorMessage}</span>
        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="text-red-500 hover:text-red-600 underline text-sm ml-2"
          >
            {retryText}
          </button>
        )}
      </div>
    );
  }

  // Default variant - full error page
  return (
    <div className={containerClassName}>
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}
      >
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
        <p className="text-red-600 mb-4">{errorMessage}</p>
        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LoaderCircle className="w-4 h-4" />
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

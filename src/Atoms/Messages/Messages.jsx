// src/components/ui/Messages.jsx
import React, { memo, useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  WifiOff,
  ShoppingCart,
  Star,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";

// Utility function for class merging
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ===============================
// BASE MESSAGE COMPONENT
// ===============================
const BaseMessage = memo(
  ({
    children,
    variant = "info",
    size = "medium",
    icon,
    title,
    onClose,
    dismissible = false,
    className = "",
    showIcon = true,
    fullWidth = true,
    bordered = true,
    ...props
  }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) return null;

    const baseStyles =
      "flex items-start gap-3 rounded-lg transition-all duration-200";

    const variants = {
      success: {
        bg: "bg-green-50 border-green-200",
        text: "text-green-800",
        title: "text-green-900",
        icon: CheckCircle,
        iconColor: "text-green-500",
      },
      error: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        title: "text-red-900",
        icon: AlertCircle,
        iconColor: "text-red-500",
      },
      warning: {
        bg: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-800",
        title: "text-yellow-900",
        icon: AlertTriangle,
        iconColor: "text-yellow-500",
      },
      info: {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-800",
        title: "text-blue-900",
        icon: Info,
        iconColor: "text-blue-500",
      },
      neutral: {
        bg: "bg-gray-50 border-gray-200",
        text: "text-gray-800",
        title: "text-gray-900",
        icon: Info,
        iconColor: "text-gray-500",
      },
    };

    const sizes = {
      small: "p-3 text-sm",
      medium: "p-4 text-sm",
      large: "p-6 text-base",
    };

    const iconSizes = {
      small: 16,
      medium: 20,
      large: 24,
    };

    const variantConfig = variants[variant] || variants.info;
    const IconComponent = icon || variantConfig.icon;

    return (
      <div
        className={cn(
          baseStyles,
          variantConfig.bg,
          bordered && `border ${variantConfig.bg.split(" ")[1]}`,
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        role="alert"
        {...props}
      >
        {showIcon && IconComponent && (
          <IconComponent
            size={iconSizes[size]}
            className={cn("flex-shrink-0 mt-0.5", variantConfig.iconColor)}
          />
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn("font-semibold mb-1", variantConfig.title)}>
              {title}
            </h4>
          )}
          <div className={variantConfig.text}>{children}</div>
        </div>

        {dismissible && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
            aria-label="Close message"
          >
            <X size={16} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    );
  }
);

// ===============================
// TOAST MESSAGE COMPONENT
// ===============================
const ToastMessage = memo(
  ({
    children,
    variant = "info",
    position = "top-right",
    duration = 5000,
    onClose,
    className = "",
    ...props
  }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) return null;

    const positions = {
      "top-right": "fixed top-4 right-4 z-50",
      "top-left": "fixed top-4 left-4 z-50",
      "bottom-right": "fixed bottom-4 right-4 z-50",
      "bottom-left": "fixed bottom-4 left-4 z-50",
      "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
      "bottom-center":
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
    };

    return (
      <div className={cn(positions[position], "max-w-sm", className)}>
        <BaseMessage
          variant={variant}
          dismissible={true}
          onClose={handleClose}
          className="shadow-lg animate-in slide-in-from-top-2"
          {...props}
        >
          {children}
        </BaseMessage>
      </div>
    );
  }
);

// ===============================
// OVERLAY MESSAGE COMPONENT
// ===============================
const OverlayMessage = memo(
  ({
    children,
    variant = "error",
    icon,
    className = "",
    backdrop = true,
    ...props
  }) => {
    const variants = {
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-white",
      info: "bg-blue-500 text-white",
      success: "bg-green-500 text-white",
      unavailable: "bg-red-500 text-white",
    };

    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center z-10",
          backdrop && "bg-black bg-opacity-70 backdrop-blur-sm",
          "rounded-lg",
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        <div className="text-center">
          {icon && (
            <div className="mx-auto mb-2">
              {React.cloneElement(icon, {
                className: cn("w-6 h-6 text-red-400", icon.props?.className),
              })}
            </div>
          )}
          <span
            className={cn(
              variants[variant] || variants.error,
              "px-3 py-2 text-sm font-bold rounded-lg shadow-lg"
            )}
          >
            {children}
          </span>
        </div>
      </div>
    );
  }
);

// ===============================
// INLINE MESSAGE COMPONENT
// ===============================
const InlineMessage = memo(
  ({
    children,
    variant = "error",
    size = "small",
    icon,
    className = "",
    ...props
  }) => {
    const variants = {
      error: "text-red-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      info: "text-blue-600",
    };

    const sizes = {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
    };

    const iconSizes = {
      small: 14,
      medium: 16,
      large: 20,
    };

    const variantConfig = {
      error: AlertCircle,
      success: CheckCircle,
      warning: AlertTriangle,
      info: Info,
    };

    const IconComponent = icon || variantConfig[variant];

    return (
      <div
        className={cn(
          "flex items-center gap-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {IconComponent && (
          <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
        )}
        <span className="font-medium">{children}</span>
      </div>
    );
  }
);

// ===============================
// SPECIALIZED MESSAGE COMPONENTS
// ===============================

// Previously: AlertMessage (Bootstrap style)
const AlertMessage = memo(
  ({ message, type = "warning", icon, linkText, linkUrl, onClose }) => {
    const typeMap = {
      warning: "warning",
      danger: "error",
      info: "info",
      success: "success",
    };

    return (
      <BaseMessage
        variant={typeMap[type]}
        dismissible={true}
        onClose={onClose}
        icon={icon}
        className="mb-0"
      >
        <strong>{message}</strong>
        {linkUrl && (
          <>
            {" "}
            <a
              href={linkUrl}
              className="underline hover:no-underline inline-flex items-center gap-1"
            >
              {linkText}
              <ExternalLink size={12} />
            </a>
          </>
        )}
      </BaseMessage>
    );
  }
);

// Previously: AvailabilityOverlay
const AvailabilityOverlay = memo(({ availability }) => {
  if (availability === "Available") return null;

  return (
    <OverlayMessage
      variant="unavailable"
      icon={<AlertCircle />}
      backdrop={true}
    >
      {availability}
    </OverlayMessage>
  );
});

// Previously: ConnectionStatus
const ConnectionStatus = memo(({ isOnline }) => {
  if (isOnline) return null;

  return (
    <BaseMessage
      variant="error"
      icon={<WifiOff />}
      size="small"
      className="text-center border-0 bg-red-100"
      bordered={true}
    >
      No internet connection. Some features may not work.
    </BaseMessage>
  );
});

// Previously: EmptyCartMessage
const EmptyCartMessage = memo(
  ({
    onGoBack,
    title = "Cart is empty",
    description = "Add some items to proceed with checkout",
    buttonText = "Back to Menu",
  }) => {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{title}</h3>
          <p className="text-gray-500 mb-6">{description}</p>
          <button
            onClick={onGoBack}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }
);

// Previously: EmptyState
const EmptyState = memo(
  ({
    icon: Icon,
    title,
    description,
    hasActiveFilters,
    onClearFilters,
    className = "",
    children,
  }) => (
    <div className={cn("text-center py-12", className)}>
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {Icon && <Icon className="w-10 h-10 text-gray-400" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {hasActiveFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          Clear All Filters
        </button>
      )}
      {children}
    </div>
  )
);

// Previously: ErrorMessage with variants
const ErrorMessage = memo(
  ({
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
    if (!message && !error) return null;

    const errorMessage = message || error?.message || "Something went wrong";

    if (variant === "compact") {
      return (
        <BaseMessage variant="error" size="small" className={className}>
          <div className="flex items-center justify-between w-full">
            <p>{errorMessage}</p>
            {showRetryButton && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors ml-3"
              >
                <LoaderCircle size={12} />
                {retryText}
              </button>
            )}
          </div>
        </BaseMessage>
      );
    }

    if (variant === "inline") {
      return (
        <InlineMessage variant="error" className={className}>
          {errorMessage}
          {showRetryButton && onRetry && (
            <button
              onClick={onRetry}
              className="text-red-500 hover:text-red-600 underline text-sm ml-2"
            >
              {retryText}
            </button>
          )}
        </InlineMessage>
      );
    }

    // Default variant - full error page
    return (
      <div className={containerClassName}>
        <div className={cn("text-center", className)}>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          {showRetryButton && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LoaderCircle size={16} />
              {retryText}
            </button>
          )}
        </div>
      </div>
    );
  }
);

// Previously: ErrorState
const ErrorState = memo(
  ({ size = "medium", message = "Error loading data", className = "" }) => {
    const sizeVariants = {
      small: {
        container: "p-3",
        gap: "gap-2",
        iconContainer: "w-8 h-8",
        icon: "w-4 h-4",
        valueText: "text-sm",
        labelText: "text-xs",
      },
      medium: {
        container: "p-4",
        gap: "gap-3",
        iconContainer: "w-10 h-10",
        icon: "w-5 h-5",
        valueText: "text-base",
        labelText: "text-sm",
      },
      large: {
        container: "p-6",
        gap: "gap-4",
        iconContainer: "w-12 h-12",
        icon: "w-6 h-6",
        valueText: "text-lg",
        labelText: "text-base",
      },
    };

    const sizeConfig = sizeVariants[size] || sizeVariants.medium;

    return (
      <div
        className={cn(
          "bg-white rounded-lg shadow-sm border border-red-200 flex items-start",
          sizeConfig.container,
          sizeConfig.gap,
          className
        )}
      >
        <div
          className={cn(
            sizeConfig.iconContainer,
            "bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"
          )}
        >
          <AlertCircle className={cn(sizeConfig.icon, "text-white")} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              sizeConfig.valueText,
              "font-bold text-red-800 leading-tight"
            )}
          >
            Error
          </p>
          <p
            className={cn(
              sizeConfig.labelText,
              "text-red-600 font-medium mt-1 leading-tight"
            )}
          >
            {message}
          </p>
        </div>
      </div>
    );
  }
);

// Previously: FooterMessage
const FooterMessage = memo(
  ({
    message = "Thank you for your order! We're preparing it with care. 🍽️",
    showBorder = true,
    className = "",
  }) => {
    return (
      <div
        className={cn(
          "mt-6",
          showBorder && "pt-4 border-t border-gray-200",
          className
        )}
      >
        <p className="text-xs text-gray-500">{message}</p>
      </div>
    );
  }
);

// Previously: ImportantNotes
const ImportantNotes = memo(
  ({
    title = "Important Information",
    icon: IconComponent = Star,
    notes = null,
    variant = "orange",
  }) => {
    const defaultNotes = [
      "Please remain at your table during preparation",
      "Your order will be served hot and fresh",
      "Kitchen staff will notify you when ready",
      "Contact staff if you need any assistance",
    ];

    const notesList = notes || defaultNotes;

    return (
      <BaseMessage
        variant={variant === "orange" ? "warning" : variant}
        title={
          <div className="flex items-center gap-2">
            <IconComponent size={16} />
            {title}
          </div>
        }
        showIcon={false}
        className="mb-6"
      >
        <ul className="space-y-2 text-sm">
          {notesList.map((note, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </BaseMessage>
    );
  }
);

// Previously: OrderInfoAlert
const OrderInfoAlert = memo(
  ({
    title = "Order Information:",
    items = [
      "Estimated preparation time: 15-25 minutes",
      "Your order will be prepared fresh",
      "Please ensure table number is correct",
      "Order cannot be modified after submission",
    ],
  }) => {
    return (
      <BaseMessage
        variant="info"
        title={title}
        size="medium"
        className="rounded-xl"
      >
        <ul className="space-y-1 text-xs">
          {items.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </BaseMessage>
    );
  }
);

// Previously: UnavailableNotice
const UnavailableNotice = memo(({ message = "Currently Unavailable" }) => (
  <BaseMessage
    variant="error"
    size="large"
    fullWidth={true}
    className="justify-center mb-4 font-semibold text-lg"
  >
    {message}
  </BaseMessage>
));

// ===============================
// COMPONENT DISPLAY NAMES
// ===============================
BaseMessage.displayName = "BaseMessage";
ToastMessage.displayName = "ToastMessage";
OverlayMessage.displayName = "OverlayMessage";
InlineMessage.displayName = "InlineMessage";
AlertMessage.displayName = "AlertMessage"; // Previously: AlertMessage
AvailabilityOverlay.displayName = "AvailabilityOverlay"; // Previously: AvailabilityOverlay
ConnectionStatus.displayName = "ConnectionStatus"; // Previously: ConnectionStatus
EmptyCartMessage.displayName = "EmptyCartMessage"; // Previously: EmptyCartMessage
EmptyState.displayName = "EmptyState"; // Previously: EmptyState
ErrorMessage.displayName = "ErrorMessage"; // Previously: ErrorMessage
ErrorState.displayName = "ErrorState"; // Previously: ErrorState
FooterMessage.displayName = "FooterMessage"; // Previously: FooterMessage
ImportantNotes.displayName = "ImportantNotes"; // Previously: ImportantNotes
OrderInfoAlert.displayName = "OrderInfoAlert"; // Previously: OrderInfoAlert
UnavailableNotice.displayName = "UnavailableNotice"; // Previously: UnavailableNotice

// ===============================
// EXPORTS
// ===============================
export {
  // Core Components
  BaseMessage, // Main reusable message component
  ToastMessage, // Toast/notification messages
  OverlayMessage, // Overlay messages with backdrop
  InlineMessage, // Small inline messages

  // Specialized Components (with previous names in comments)
  AlertMessage, // Previously: AlertMessage (Bootstrap style)
  AvailabilityOverlay, // Previously: AvailabilityOverlay
  ConnectionStatus, // Previously: ConnectionStatus
  EmptyCartMessage, // Previously: EmptyCartMessage
  EmptyState, // Previously: EmptyState
  ErrorMessage, // Previously: ErrorMessage (with variants)
  ErrorState, // Previously: ErrorState (with size variants)
  FooterMessage, // Previously: FooterMessage
  ImportantNotes, // Previously: ImportantNotes
  OrderInfoAlert, // Previously: OrderInfoAlert
  UnavailableNotice, // Previously: UnavailableNotice
};

// Default export for convenience
export default {
  BaseMessage,
  ToastMessage,
  OverlayMessage,
  InlineMessage,
  AlertMessage,
  AvailabilityOverlay,
  ConnectionStatus,
  EmptyCartMessage,
  EmptyState,
  ErrorMessage,
  ErrorState,
  FooterMessage,
  ImportantNotes,
  OrderInfoAlert,
  UnavailableNotice,
};

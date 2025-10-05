// src/components/ui/Buttons.jsx
import React, { memo, useState, useEffect, useRef } from "react";
import {
  Eye,
  AlertCircle,
  Plus,
  ShoppingCart,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Building2,
  Users,
  Package,
  BarChart3,
  Zap,
  Calendar,
} from "lucide-react";

// Utility function for class merging
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ===============================
// BASE BUTTON COMPONENT
// ===============================
const BaseButton = memo(
  ({
    children,
    variant = "primary",
    size = "medium",
    loading = false,
    disabled = false,
    onClick,
    type = "button",
    className = "",
    loadingText = "Loading...",
    icon,
    iconPosition = "right",
    fullWidth = false,
    pill = false,
    ...props
  }) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none";

    const variants = {
      primary:
        "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md hover:shadow-lg",
      secondary:
        "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 shadow-md hover:shadow-lg",
      success:
        "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-md hover:shadow-lg",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-lg",
      warning:
        "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-md hover:shadow-lg",
      info: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-md hover:shadow-lg",
      outline:
        "bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
      gradient:
        "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 focus:ring-orange-500 shadow-md hover:shadow-lg",
    };

    const sizes = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2 text-sm",
      large: "px-6 py-3 text-base",
      xlarge: "px-8 py-4 text-lg",
    };

    const iconSizes = {
      small: 14,
      medium: 16,
      large: 20,
      xlarge: 24,
    };

    const loadingSpinner = (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          pill && "rounded-full",
          className
        )}
        {...props}
      >
        {loading && loadingSpinner}
        {!loading && icon && iconPosition === "left" && (
          <span className="mr-2">
            {React.cloneElement(icon, { size: iconSizes[size] })}
          </span>
        )}
        <span>{loading ? loadingText : children}</span>
        {!loading && icon && iconPosition === "right" && (
          <span className="ml-2">
            {React.cloneElement(icon, { size: iconSizes[size] })}
          </span>
        )}
      </button>
    );
  }
);

// ===============================
// ICON BUTTON COMPONENT
// ===============================
const IconButton = memo(
  ({
    icon,
    variant = "primary",
    size = "medium",
    loading = false,
    disabled = false,
    onClick,
    className = "",
    ariaLabel,
    pill = true,
    ...props
  }) => {
    const sizeStyles = {
      small: "p-1.5",
      medium: "p-2",
      large: "p-3",
      xlarge: "p-4",
    };

    const variants = {
      primary:
        "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
      secondary:
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
      success:
        "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none shadow-md hover:shadow-lg",
          variants[variant],
          sizeStyles[size],
          pill ? "rounded-full" : "rounded-lg",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : (
          icon
        )}
      </button>
    );
  }
);

// ===============================
// FLOATING ACTION BUTTON
// ===============================
const FloatingActionButton = memo(
  ({
    icon,
    onClick,
    variant = "primary",
    position = "bottom-right",
    size = "large",
    badge,
    loading = false,
    className = "",
    ...props
  }) => {
    const positions = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-6 right-6",
      "top-left": "fixed top-6 left-6",
    };

    const variants = {
      primary:
        "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl",
      success:
        "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl",
      danger:
        "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl",
    };

    const sizes = {
      medium: "w-12 h-12",
      large: "w-16 h-16",
      xlarge: "w-20 h-20",
    };

    return (
      <button
        onClick={onClick}
        className={cn(
          positions[position],
          variants[variant],
          sizes[size],
          "rounded-full flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-110 active:scale-95 z-50",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
        ) : (
          icon
        )}
        {badge && (
          <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>
    );
  }
);

// ===============================
// SPECIALIZED BUTTON COMPONENTS
// ===============================

// Previously: ActionButton
const ViewDetailsButton = memo(
  ({ isAvailable, onClick, loading = false, size = "medium", ...props }) => {
    if (!isAvailable) {
      return (
        <BaseButton
          variant="secondary"
          size={size}
          disabled={true}
          icon={<AlertCircle />}
          iconPosition="left"
          className="cursor-not-allowed"
          {...props}
        >
          <span className="hidden sm:inline">Unavailable</span>
          <span className="sm:hidden">Unavailable</span>
        </BaseButton>
      );
    }

    return (
      <BaseButton
        variant="gradient"
        size={size}
        loading={loading}
        loadingText="Loading..."
        onClick={onClick}
        icon={<Eye />}
        iconPosition="left"
        className="transform hover:scale-105"
        {...props}
      >
        <span className="hidden sm:inline">View Details</span>
        <span className="sm:hidden">View</span>
      </BaseButton>
    );
  }
);

// Previously: AddToCartButton
const AddToCartButton = memo(
  ({
    onClick,
    isAvailable = true,
    loading = false,
    size = "medium",
    ...props
  }) => {
    return (
      <IconButton
        icon={<Plus />}
        onClick={onClick}
        disabled={!isAvailable}
        loading={loading}
        variant="primary"
        size={size}
        ariaLabel="Add item to cart"
        {...props}
      />
    );
  }
);

// Previously: CartButton
const CartButton = memo(
  ({ totalItems, totalAmount, onGoToCart, isMobile = false }) => {
    if (isMobile && totalItems === 0) return null;

    if (isMobile) {
      return (
        <FloatingActionButton
          icon={<ShoppingCart />}
          onClick={onGoToCart}
          position="bottom-right"
          badge={totalItems > 0 ? totalItems : null}
          variant="primary"
        />
      );
    }

    return (
      <BaseButton
        variant="primary"
        size="medium"
        onClick={onGoToCart}
        icon={<ShoppingCart />}
        iconPosition="left"
        className="relative"
      >
        ₹{totalAmount}
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </BaseButton>
    );
  }
);

// Previously: BackToTop
const BackToTopButton = memo(() => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const backToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <button
      onClick={backToTop}
      className={cn(
        "fixed right-4 bottom-4 z-50 bg-blue-600 hover:bg-blue-500 w-10 h-10 rounded flex items-center justify-center transition-all duration-400 ease-in-out",
        scroll > 100 ? "visible opacity-100" : "invisible opacity-0"
      )}
    >
      <i className="bi bi-arrow-up-short text-white text-2xl leading-none"></i>
    </button>
  );
});

// Previously: CloseButton
const CloseButton = memo(({ onClose, className = "" }) => (
  <button
    onClick={onClose}
    className={cn(
      "absolute top-4 right-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
      className
    )}
    aria-label="Close modal"
  >
    <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
  </button>
));

// Previously: CopyButton
const CopyButton = memo(
  ({
    textToCopy,
    label = "Copy",
    copiedLabel = "Copied!",
    variant = "secondary",
    size = "medium",
  }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = React.useCallback(async () => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }, [textToCopy]);

    return (
      <BaseButton
        onClick={handleCopy}
        variant={variant}
        size={size}
        icon={copied ? <Check /> : <Copy />}
        iconPosition="left"
      >
        {copied ? copiedLabel : label}
      </BaseButton>
    );
  }
);

// Previously: ScrollButton
const NavigationButton = memo(
  ({ direction, onClick, disabled, className = "" }) => {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        aria-label={`Scroll ${direction}`}
      >
        <Icon className="w-4 h-4 text-gray-600" />
      </button>
    );
  }
);

// Previously: TabButton
const TabButton = memo(
  ({ label, count, isActive, onClick, disabled = false, className = "" }) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200 transform hover:scale-105 active:scale-95",
          isActive
            ? "bg-orange-500 text-white border-transparent shadow-lg"
            : "bg-white text-gray-600 border-gray-300 hover:shadow-md hover:border-gray-400",
          className
        )}
      >
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        {typeof count === "number" && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);

// Previously: PlaceOrderButton
const PlaceOrderButton = memo(
  ({
    onSubmit,
    isSubmitting,
    isLoading,
    finalTotal,
    buttonText = "Place Order",
    loadingText = "Placing Order...",
    disclaimerText = "By placing this order, you confirm the items and table number are correct.",
  }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <BaseButton
          onClick={onSubmit}
          disabled={isSubmitting || isLoading}
          loading={isSubmitting || isLoading}
          loadingText={loadingText}
          variant="success"
          size="large"
          fullWidth
          icon={<CheckCircle />}
          iconPosition="left"
        >
          {buttonText} - ₹{finalTotal}
        </BaseButton>

        {disclaimerText && (
          <p className="text-xs text-gray-500 text-center mt-3">
            {disclaimerText}
          </p>
        )}
      </div>
    );
  }
);

// Previously: QuickActions buttons
const QuickActionButton = memo(
  ({
    title,
    description,
    icon: IconComponent,
    onClick,
    color = "bg-orange-500",
  }) => {
    return (
      <button
        onClick={onClick}
        className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left group"
      >
        <div className={cn(color, "bg-opacity-20 p-2 rounded-lg mb-3 w-fit")}>
          <IconComponent
            className={cn("text-lg", color.replace("bg-", "text-"))}
          />
        </div>
        <h4 className="font-semibold text-gray-800 group-hover:text-gray-900">
          {title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </button>
    );
  }
);

// Previously: OrderActionButtons
const StatusActionButton = memo(({ status, orderId, onStatusChange }) => {
  const handleStatusChange = (newStatus) => {
    if (newStatus === "rejected") {
      const reason = prompt("Please enter rejection reason:");
      if (reason !== null) {
        onStatusChange(orderId, newStatus, { rejectionReason: reason });
      }
    } else {
      onStatusChange(orderId, newStatus);
    }
  };

  const statusActions = {
    received: [
      { label: "Start Preparing", action: "preparing", variant: "info" },
      { label: "Reject Order", action: "rejected", variant: "danger" },
    ],
    preparing: [{ label: "Mark Ready", action: "ready", variant: "success" }],
    ready: [
      { label: "Mark Served", action: "completed", variant: "secondary" },
    ],
  };

  return (
    <div className="flex flex-wrap gap-2">
      {statusActions[status]?.map((action, index) => (
        <BaseButton
          key={index}
          onClick={() => handleStatusChange(action.action)}
          variant={action.variant}
          size="small"
        >
          {action.label}
        </BaseButton>
      ))}
    </div>
  );
});

// Previously: MenuToggleButton
const MenuToggleButton = memo(({ onToggle, isOpen }) => (
  <button
    onClick={onToggle}
    className="lg:hidden p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
  >
    <div className="relative w-6 h-6">
      <span
        className={cn(
          "absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300",
          isOpen ? "rotate-45 top-3" : "top-1"
        )}
      />
      <span
        className={cn(
          "absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300",
          isOpen ? "opacity-0" : "top-3"
        )}
      />
      <span
        className={cn(
          "absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300",
          isOpen ? "-rotate-45 top-3" : "top-5"
        )}
      />
    </div>
  </button>
));

// ===============================
// DATE PICKER BUTTON COMPONENT
// ===============================
const DatePickerButton = memo(
  ({
    value,
    onChange,
    label,
    placeholder = "Select date",
    disabled = false,
    required = false,
    minDate,
    maxDate,
    size = "medium",
    variant = "secondary",
    showIcon = true,
    iconPosition = "left",
    error,
    helperText,
    id,
    name,
    autoFocus = false,
    onFocus,
    onBlur,
    className = "",
    containerClassName = "",
    ...props
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dateInputRef = useRef(null);

    // Size configurations matching BaseButton
    const sizes = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2 text-sm",
      large: "px-6 py-3 text-base",
      xlarge: "px-8 py-4 text-lg",
    };

    const iconSizes = {
      small: 14,
      medium: 16,
      large: 20,
      xlarge: 24,
    };

    // Variant styles matching BaseButton patterns
    const variants = {
      primary:
        "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md hover:shadow-lg",
      secondary:
        "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 shadow-md hover:shadow-lg",
      outline:
        "bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    };

    const getDefaultMaxDate = () => {
      return new Date().toISOString().split("T")[0];
    };

    const handleButtonClick = () => {
      if (!disabled && dateInputRef.current) {
        dateInputRef.current.showPicker?.() || dateInputRef.current.focus();
      }
    };

    const handleDateChange = (event) => {
      const newDate = event.target.value;
      if (onChange) {
        onChange(newDate);
      }
    };

    const formatDisplayDate = (dateString) => {
      if (!dateString) return placeholder;
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none relative";

    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "";

    return (
      <div className={cn("flex flex-col gap-1", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id || name}
            className={cn(
              "text-sm font-medium text-gray-700",
              required && "after:content-['*'] after:text-red-500 after:ml-1"
            )}
          >
            {label}
          </label>
        )}

        {/* Date Picker Button */}
        <div className="relative">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[size],
              errorStyles,
              "w-full text-left justify-between",
              !value && "text-gray-500",
              className
            )}
            {...props}
          >
            <div className="flex items-center">
              {showIcon && iconPosition === "left" && (
                <Calendar
                  size={iconSizes[size]}
                  className="mr-2 flex-shrink-0"
                />
              )}
              <span className="truncate">{formatDisplayDate(value)}</span>
            </div>

            {showIcon && iconPosition === "right" && (
              <Calendar size={iconSizes[size]} className="ml-2 flex-shrink-0" />
            )}
          </button>

          {/* Hidden Date Input */}
          <input
            ref={dateInputRef}
            type="date"
            id={id || name}
            name={name}
            value={value || ""}
            onChange={handleDateChange}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            min={minDate}
            max={maxDate || getDefaultMaxDate()}
            autoFocus={autoFocus}
            className="absolute inset-0 opacity-0 pointer-events-none"
            tabIndex={-1}
          />
        </div>

        {/* Helper Text or Error Message */}
        {(helperText || error) && (
          <p
            className={cn("text-xs", error ? "text-red-500" : "text-gray-500")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePickerButton.displayName = "DatePickerButton";

// ===============================
// COMPONENT DISPLAY NAMES
// ===============================
BaseButton.displayName = "BaseButton";
IconButton.displayName = "IconButton";
FloatingActionButton.displayName = "FloatingActionButton";
ViewDetailsButton.displayName = "ViewDetailsButton"; // Previously: ActionButton
AddToCartButton.displayName = "AddToCartButton";
CartButton.displayName = "CartButton";
BackToTopButton.displayName = "BackToTopButton"; // Previously: BackToTop
CloseButton.displayName = "CloseButton";
CopyButton.displayName = "CopyButton";
NavigationButton.displayName = "NavigationButton"; // Previously: ScrollButton
TabButton.displayName = "TabButton";
PlaceOrderButton.displayName = "PlaceOrderButton";
QuickActionButton.displayName = "QuickActionButton"; // Previously: QuickActions buttons
StatusActionButton.displayName = "StatusActionButton"; // Previously: OrderActionButtons
MenuToggleButton.displayName = "MenuToggleButton";
DatePickerButton.displayName = "DatePickerButton";

// ===============================
// EXPORTS
// ===============================
export {
  // Core Components
  BaseButton, // Main reusable button component
  IconButton, // Icon-only buttons
  FloatingActionButton, // FAB with badge support

  // Specialized Components (with previous names in comments)
  ViewDetailsButton, // Previously: ActionButton
  AddToCartButton, // Previously: AddToCartButton
  CartButton, // Previously: CartButton
  BackToTopButton, // Previously: BackToTop
  CloseButton, // Previously: CloseButton
  CopyButton, // Previously: CopyButton
  NavigationButton, // Previously: ScrollButton
  TabButton, // Previously: TabButton
  PlaceOrderButton, // Previously: PlaceOrderButton
  QuickActionButton, // Previously: QuickActions buttons
  StatusActionButton, // Previously: OrderActionButtons
  MenuToggleButton, // Previously: MenuToggleButton
  DatePickerButton, // Date picker with button-style interface
};

// Default export for convenience
export default {
  BaseButton,
  IconButton,
  FloatingActionButton,
  ViewDetailsButton,
  AddToCartButton,
  CartButton,
  BackToTopButton,
  CloseButton,
  CopyButton,
  NavigationButton,
  TabButton,
  PlaceOrderButton,
  QuickActionButton,
  StatusActionButton,
  MenuToggleButton,
  DatePickerButton,
};

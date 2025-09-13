import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
  forwardRef,
} from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

// Color theme configuration
const THEME_CONFIG = {
  default: {
    headerBg: "bg-gradient-to-r from-gray-500 to-gray-600",
    headerText: "text-white",
    closeButtonHover: "hover:bg-white/20",
    border: "border-gray-200",
  },
  primary: {
    headerBg: "bg-gradient-to-r from-blue-500 to-blue-600",
    headerText: "text-white",
    closeButtonHover: "hover:bg-white/20",
    border: "border-blue-200",
  },
  success: {
    headerBg: "bg-gradient-to-r from-green-500 to-green-600",
    headerText: "text-white",
    closeButtonHover: "hover:bg-white/20",
    border: "border-green-200",
  },
  warning: {
    headerBg: "bg-gradient-to-r from-yellow-500 to-orange-500",
    headerText: "text-white",
    closeButtonHover: "hover:bg-white/20",
    border: "border-yellow-200",
  },
  danger: {
    headerBg: "bg-gradient-to-r from-red-500 to-red-600",
    headerText: "text-white",
    closeButtonHover: "hover:bg-white/20",
    border: "border-red-200",
  },
  orange: {
    headerBg: "bg-gradient-to-r from-orange-400 to-orange-500",
    headerText: "text-white",
    closeButtonHover: "hover:bg-white/20",
    border: "border-orange-200",
  },
};

// Size configuration
const SIZE_CONFIG = {
  xs: {
    maxWidth: "max-w-sm",
    padding: "p-4",
    headerPadding: "px-4 py-3",
    bodyPadding: "px-4 py-4",
    footerPadding: "px-4 py-3",
  },
  sm: {
    maxWidth: "max-w-md",
    padding: "p-4",
    headerPadding: "px-5 py-4",
    bodyPadding: "px-5 py-5",
    footerPadding: "px-5 py-4",
  },
  md: {
    maxWidth: "max-w-2xl",
    padding: "p-4",
    headerPadding: "px-6 py-4",
    bodyPadding: "px-6 py-6",
    footerPadding: "px-6 py-4",
  },
  lg: {
    maxWidth: "max-w-4xl",
    padding: "p-4 sm:p-6",
    headerPadding: "px-6 py-4",
    bodyPadding: "px-6 py-6",
    footerPadding: "px-6 py-4",
  },
  xl: {
    maxWidth: "max-w-6xl",
    padding: "p-4 sm:p-6",
    headerPadding: "px-8 py-5",
    bodyPadding: "px-8 py-8",
    footerPadding: "px-8 py-5",
  },
  full: {
    maxWidth: "max-w-[95vw]",
    padding: "p-2 sm:p-4",
    headerPadding: "px-4 py-3 sm:px-6 sm:py-4",
    bodyPadding: "px-4 py-4 sm:px-6 sm:py-6",
    footerPadding: "px-4 py-3 sm:px-6 sm:py-4",
  },
};

// Focus trap hook
const useFocusTrap = (isOpen) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the currently focused element
    previousFocus.current = document.activeElement;

    const modal = modalRef.current;
    if (!modal) return;

    // Get all focusable elements
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Set initial focus
    if (firstElement) {
      setTimeout(() => firstElement.focus(), 100);
    }

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener("keydown", handleTabKey);

    return () => {
      modal.removeEventListener("keydown", handleTabKey);
      // Restore focus to previous element
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [isOpen]);

  return modalRef;
};

// Close button component
const CloseButton = memo(
  ({
    onClose,
    theme = "default",
    className = "",
    ariaLabel = "Close modal",
  }) => {
    const themeConfig = THEME_CONFIG[theme] || THEME_CONFIG.default;

    return (
      <button
        onClick={onClose}
        className={`p-2 ${themeConfig.headerText} ${themeConfig.closeButtonHover} rounded-lg transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50 ${className}`}
        aria-label={ariaLabel}
        type="button"
      >
        <X size={20} />
      </button>
    );
  }
);

CloseButton.displayName = "CloseButton";

// Modal header component
const ModalHeader = memo(
  ({
    title,
    onClose,
    theme = "default",
    size = "md",
    showCloseButton = true,
    icon: Icon = null,
    className = "",
  }) => {
    const themeConfig = THEME_CONFIG[theme] || THEME_CONFIG.default;
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    return (
      <div
        className={`flex items-center justify-between ${sizeConfig.headerPadding} border-b ${themeConfig.border} ${themeConfig.headerBg} ${className}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && (
            <Icon
              className={`w-5 h-5 ${themeConfig.headerText} flex-shrink-0`}
            />
          )}
          <h2
            className={`text-lg sm:text-xl font-semibold ${themeConfig.headerText} truncate`}
          >
            {title}
          </h2>
        </div>
        {showCloseButton && (
          <CloseButton
            onClose={onClose}
            theme={theme}
            ariaLabel={`Close ${title || "modal"}`}
          />
        )}
      </div>
    );
  }
);

ModalHeader.displayName = "ModalHeader";

// Modal body component
const ModalBody = memo(
  ({
    children,
    size = "md",
    maxHeight = "max-h-[60vh]",
    className = "",
    scrollable = true,
  }) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    return (
      <div
        className={`${sizeConfig.bodyPadding} ${
          scrollable ? `overflow-y-auto ${maxHeight}` : ""
        } ${className}`}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = "ModalBody";

// Modal footer component
const ModalFooter = memo(
  ({
    children,
    size = "md",
    alignment = "right", // left, center, right, between
    className = "",
  }) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const alignmentClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      between: "justify-between",
    };

    return (
      <div
        className={`${sizeConfig.footerPadding} border-t border-gray-200 bg-gray-50 flex ${alignmentClasses[alignment]} gap-3 flex-wrap ${className}`}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = "ModalFooter";

// Default footer buttons
const DefaultFooterButtons = memo(
  ({
    onClose,
    onConfirm,
    cancelText = "Cancel",
    confirmText = "Confirm",
    cancelVariant = "secondary",
    confirmVariant = "primary",
    isLoading = false,
  }) => {
    const buttonVariants = {
      primary:
        "text-white bg-blue-600 border-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "text-gray-600 bg-white border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
      success:
        "text-white bg-green-600 border-green-600 hover:bg-green-700 focus:ring-green-500",
      danger:
        "text-white bg-red-600 border-red-600 hover:bg-red-700 focus:ring-red-500",
      warning:
        "text-white bg-yellow-600 border-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    };

    return (
      <>
        <button
          onClick={onClose}
          className={`px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonVariants[cancelVariant]}`}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${buttonVariants[confirmVariant]} disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isLoading}
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          )}
          {confirmText}
        </button>
      </>
    );
  }
);

DefaultFooterButtons.displayName = "DefaultFooterButtons";

// Main Modal component
const Modal = memo(
  forwardRef(
    (
      {
        isOpen = false,
        onClose,
        title = "",
        children,
        size = "md",
        theme = "default",
        showHeader = true,
        showFooter = false,
        showCloseButton = true,
        footerContent = null,
        footerAlignment = "right",
        closeOnBackdrop = true,
        closeOnEscape = true,
        preventBodyScroll = true,
        maxHeight = "max-h-[60vh]",
        className = "",
        backdropClassName = "",
        overlayClassName = "",
        icon = null,
        isLoading = false,
        scrollable = true,
        onConfirm,
        cancelText = "Cancel",
        confirmText = "Confirm",
        cancelVariant = "secondary",
        confirmVariant = "primary",
        ariaLabel,
        ariaDescribedBy,
        testId,
        ...rest
      },
      ref
    ) => {
      const modalRef = useFocusTrap(isOpen);
      const combinedRef = useRef();

      // Combine refs
      useEffect(() => {
        if (ref) {
          if (typeof ref === "function") {
            ref(combinedRef.current);
          } else {
            ref.current = combinedRef.current;
          }
        }
      }, [ref]);

      // Memoized theme and size configurations
      const themeConfig = useMemo(
        () => THEME_CONFIG[theme] || THEME_CONFIG.default,
        [theme]
      );

      const sizeConfig = useMemo(
        () => SIZE_CONFIG[size] || SIZE_CONFIG.md,
        [size]
      );

      // Handle escape key press
      useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscapeKey = (event) => {
          if (event.key === "Escape") {
            onClose();
          }
        };

        document.addEventListener("keydown", handleEscapeKey);
        return () => {
          document.removeEventListener("keydown", handleEscapeKey);
        };
      }, [isOpen, closeOnEscape, onClose]);

      // Prevent body scroll when modal is open
      useEffect(() => {
        if (!isOpen || !preventBodyScroll) return;

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        return () => {
          document.body.style.overflow = originalStyle;
        };
      }, [isOpen, preventBodyScroll]);

      // Backdrop click handler
      const handleBackdropClick = useCallback(
        (e) => {
          if (e.target === e.currentTarget && closeOnBackdrop) {
            onClose();
          }
        },
        [closeOnBackdrop, onClose]
      );

      // Modal content click handler to prevent event bubbling
      const handleModalClick = useCallback((e) => {
        e.stopPropagation();
      }, []);

      // Don't render if not open
      if (!isOpen) return null;

      return (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${sizeConfig.padding} bg-black/60 backdrop-blur-sm transition-all duration-300 ${backdropClassName}`}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy}
          data-testid={testId}
          {...rest}
        >
          <div
            ref={(node) => {
              modalRef.current = node;
              combinedRef.current = node;
            }}
            className={`
          relative w-full ${sizeConfig.maxWidth} 
          bg-white rounded-xl shadow-2xl 
          transform transition-all duration-300 scale-100
          max-h-[95vh] overflow-hidden
          border ${themeConfig.border}
          ${className}
        `}
            onClick={handleModalClick}
          >
            {/* Header */}
            {showHeader && (
              <ModalHeader
                title={title}
                onClose={onClose}
                theme={theme}
                size={size}
                showCloseButton={showCloseButton}
                icon={icon}
              />
            )}

            {/* Body */}
            <ModalBody
              size={size}
              maxHeight={maxHeight}
              scrollable={scrollable}
            >
              {children}
            </ModalBody>

            {/* Footer */}
            {showFooter && (
              <ModalFooter size={size} alignment={footerAlignment}>
                {footerContent || (
                  <DefaultFooterButtons
                    onClose={onClose}
                    onConfirm={onConfirm}
                    cancelText={cancelText}
                    confirmText={confirmText}
                    cancelVariant={cancelVariant}
                    confirmVariant={confirmVariant}
                    isLoading={isLoading}
                  />
                )}
              </ModalFooter>
            )}
          </div>
        </div>
      );
    }
  )
);

Modal.displayName = "Modal";

// Pre-configured modal variants
export const ConfirmModal = memo((props) => (
  <Modal
    theme="danger"
    icon={AlertTriangle}
    showFooter={true}
    confirmVariant="danger"
    {...props}
  />
));

export const InfoModal = memo((props) => (
  <Modal theme="primary" icon={Info} showFooter={false} {...props} />
));

export const SuccessModal = memo((props) => (
  <Modal theme="success" icon={CheckCircle} showFooter={false} {...props} />
));

export const WarningModal = memo((props) => (
  <Modal
    theme="warning"
    icon={AlertCircle}
    showFooter={true}
    confirmVariant="warning"
    {...props}
  />
));

// Default props
Modal.defaultProps = {
  isOpen: false,
  size: "md",
  theme: "default",
  showHeader: true,
  showFooter: false,
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  preventBodyScroll: true,
  maxHeight: "max-h-[60vh]",
  footerAlignment: "right",
  scrollable: true,
  cancelText: "Cancel",
  confirmText: "Confirm",
  cancelVariant: "secondary",
  confirmVariant: "primary",
  isLoading: false,
};

// Display names for pre-configured variants
ConfirmModal.displayName = "ConfirmModal";
InfoModal.displayName = "InfoModal";
SuccessModal.displayName = "SuccessModal";
WarningModal.displayName = "WarningModal";

export default Modal;

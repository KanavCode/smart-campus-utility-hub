import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { modalBackdrop, modalContent } from "../../utils/animations";

/**
 * Modal Component
 * Accessible modal dialog with animations and backdrop blur
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string} props.size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} props.showCloseButton - Show X button in header
 * @param {boolean} props.closeOnBackdrop - Close when clicking backdrop
 * @param {boolean} props.closeOnEsc - Close when pressing Escape
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = "",
}) {
  // Size styles
  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            onClick={handleBackdropClick}
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          />

          {/* Modal Content */}
          <motion.div
            className={`
              relative z-50 w-full ${sizeStyles[size]}
              bg-white dark:bg-backgroundAlt-dark
              rounded-2xl shadow-2xl
              max-h-[90vh] overflow-hidden
              flex flex-col
              ${className}
            `}
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-border dark:border-border-dark">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-2xl font-display font-bold text-textPrimary dark:text-textPrimary-dark"
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark/50 transition-colors focus-ring"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Modal Body Component
 */
export function ModalBody({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

/**
 * Modal Footer Component
 */
export function ModalFooter({ children, className = "" }) {
  return (
    <div
      className={`p-6 border-t border-border dark:border-border-dark bg-backgroundAlt dark:bg-backgroundAlt-dark/50 ${className}`}
    >
      {children}
    </div>
  );
}

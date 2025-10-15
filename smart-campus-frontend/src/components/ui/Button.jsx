import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { buttonHoverTap } from "../../utils/animations";

/**
 * Button Component
 * A versatile, animated button with multiple variants
 *
 * @param {Object} props
 * @param {string} props.variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.isLoading - Shows loading spinner
 * @param {boolean} props.disabled - Disables the button
 * @param {ReactNode} props.leftIcon - Icon to display on the left
 * @param {ReactNode} props.rightIcon - Icon to display on the right
 * @param {boolean} props.fullWidth - Makes button full width
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  // Variant styles
  const variantStyles = {
    primary:
      "bg-primary hover:bg-primary-light text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-accent hover:bg-accent-light text-white shadow-lg hover:shadow-xl",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    ghost:
      "hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark text-textPrimary dark:text-textPrimary-dark",
    danger: "bg-error hover:bg-error/90 text-white shadow-lg hover:shadow-xl",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const baseStyles =
    "rounded-lg font-medium transition-all duration-200 focus-ring inline-flex items-center justify-center gap-2";
  const disabledStyles = "opacity-50 cursor-not-allowed";
  const widthStyle = fullWidth ? "w-full" : "";

  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyle}
    ${disabled || isLoading ? disabledStyles : ""}
    ${className}
  `.trim();

  const handleClick = (e) => {
    if (!disabled && !isLoading && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? buttonHoverTap.hover : {}}
      whileTap={!disabled && !isLoading ? buttonHoverTap.tap : {}}
      {...props}
    >
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-5 h-5" />
        </motion.div>
      )}

      {!isLoading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}

      <span>{children}</span>

      {!isLoading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </motion.button>
  );
}

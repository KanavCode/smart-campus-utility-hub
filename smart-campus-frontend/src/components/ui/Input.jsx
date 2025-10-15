import { forwardRef } from "react";

/**
 * Input Component
 * Styled input field with error state support
 *
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {ReactNode} props.leftIcon - Icon on the left
 * @param {ReactNode} props.rightIcon - Icon on the right
 * @param {string} props.helperText - Helper text below input
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-textPrimary dark:text-textPrimary-dark mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary dark:text-textSecondary-dark">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={`
            input-field
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${hasError ? "border-error focus:ring-error" : ""}
            ${className}
          `.trim()}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary dark:text-textSecondary-dark">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-error animate-shake">{error}</p>
        )}

        {!error && helperText && (
          <p className="mt-1 text-sm text-textSecondary dark:text-textSecondary-dark">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

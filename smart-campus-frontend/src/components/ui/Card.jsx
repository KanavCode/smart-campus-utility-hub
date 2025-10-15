import { motion } from "framer-motion";

/**
 * Card Component
 * A premium card with hover animations and glassmorphism support
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Card content
 * @param {boolean} props.glass - Apply glassmorphism effect
 * @param {boolean} props.hover - Enable hover animation
 * @param {string} props.className - Additional CSS classes
 */
export default function Card({
  children,
  glass = false,
  hover = true,
  className = "",
  onClick,
  ...props
}) {
  const baseStyles = "rounded-2xl transition-all duration-200";
  const glassStyles = glass
    ? "glass"
    : "bg-white dark:bg-backgroundAlt-dark border border-border dark:border-border-dark shadow-lg";

  const hoverAnimation = hover
    ? {
        whileHover: {
          y: -4,
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)",
        },
        transition: { duration: 0.2 },
      }
    : {};

  const cardClasses = `${baseStyles} ${glassStyles} ${className}`.trim();

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      {...hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * CardHeader Component
 */
export function CardHeader({ children, className = "" }) {
  return (
    <div
      className={`p-6 border-b border-border dark:border-border-dark ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * CardBody Component
 */
export function CardBody({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

/**
 * CardFooter Component
 */
export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`p-6 border-t border-border dark:border-border-dark ${className}`}
    >
      {children}
    </div>
  );
}

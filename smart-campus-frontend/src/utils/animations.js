/**
 * Animation variants and configurations for Framer Motion
 * These provide consistent, premium animations across the application
 */

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeInOut" }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
};

// Smooth fade in animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  },
};

// Fade in from direction variants
export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -40 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

// Scale animations
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  },
};

// Card hover effect
export const cardHover = {
  scale: 1.03,
  boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.3)",
  transition: { duration: 0.2 },
};

export const cardHoverSubtle = {
  y: -4,
  transition: { duration: 0.2, ease: "easeOut" },
};

// Staggered children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

// Button interactions
export const buttonHoverTap = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

export const buttonTap = {
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

// Modal animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  },
};

// Sidebar animations
export const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

// Float animation (for hero elements)
export const floatAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Pulse animation
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Rotate animation
export const rotateAnimation = {
  rotate: [0, 360],
  transition: {
    duration: 20,
    repeat: Infinity,
    ease: "linear",
  },
};

// Slide in from side
export const slideInLeft = {
  initial: { x: "-100%" },
  animate: { 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    x: "-100%",
    transition: { duration: 0.3 }
  },
};

export const slideInRight = {
  initial: { x: "100%" },
  animate: { 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    x: "100%",
    transition: { duration: 0.3 }
  },
};

// Loading spinner animation
export const spinnerAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

// Shake animation (for errors)
export const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: {
    duration: 0.5,
  },
};

// Success checkmark animation
export const checkmarkAnimation = {
  pathLength: [0, 1],
  transition: {
    duration: 0.5,
    ease: "easeInOut",
  },
};

/**
 * Helper function to create custom stagger animations
 * @param {number} staggerDelay - Delay between each child animation
 * @param {number} delayChildren - Initial delay before children start animating
 */
export const createStaggerContainer = (staggerDelay = 0.07, delayChildren = 0.2) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

/**
 * Helper function for creating delayed animations
 * @param {number} delay - Delay in seconds
 */
export const withDelay = (variant, delay) => ({
  ...variant,
  transition: {
    ...variant.transition,
    delay,
  },
});

/**
 * Animation DNA - Framer Motion Variants Library
 * UI/UX Architect 🎨: These are our building blocks for consistent, delightful motion
 * All animations follow easing principles for natural, fluid movement
 */

/**
 * Simple fade in - Basic opacity transition
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
};

/**
 * Slide in from top - For navbar/header animations
 */
export const slideInTop = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Page transition variants - Used for route transitions
 */
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.6, 0.05, 0.01, 0.9], // Custom cubic-bezier for smoothness
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Card hover effect - Premium feel for interactive cards
 */
export const cardHover = {
  scale: 1.03,
  boxShadow: "0 20px 40px -10px rgba(121, 80, 242, 0.3)",
  transition: { 
    duration: 0.2,
    ease: "easeOut"
  },
};

/**
 * Staggered container - Parent container for staggered children
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger item - Child items in staggered list
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Button hover and tap effects
 */
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

/**
 * Float animation - Gentle floating effect
 */
export const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Fade in from bottom
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Fade in from left
 */
export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Fade in from right
 */
export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Scale in animation - For modals and popups
 */
export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Modal backdrop animation
 */
export const backdropAnimation = {
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

/**
 * Slide in from bottom (for mobile menus, drawers)
 */
export const slideInBottom = {
  initial: { y: "100%" },
  animate: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
  exit: {
    y: "100%",
    transition: {
      duration: 0.2,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Slide in from left (for sidebars)
 */
export const slideInLeft = {
  initial: { x: "-100%" },
  animate: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
  exit: {
    x: "-100%",
    transition: {
      duration: 0.2,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Slide in from right (for filters panel)
 */
export const slideInRight = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
  exit: {
    x: "100%",
    transition: {
      duration: 0.2,
      ease: [0.6, 0.05, 0.01, 0.9],
    }
  },
};

/**
 * Pulse animation - For attention-grabbing elements
 */
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Shake animation - For error states
 */
export const shakeAnimation = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

/**
 * Rotate animation - For loading spinners
 */
export const rotateAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Progress bar fill animation
 */
export const progressFill = (value) => ({
  initial: { width: 0 },
  animate: {
    width: `${value}%`,
    transition: {
      duration: 1,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
});

/**
 * Count up animation for numbers (use with custom hook)
 */
export const countUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

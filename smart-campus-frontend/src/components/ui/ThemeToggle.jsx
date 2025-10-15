import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * ThemeToggle Component
 * Animated button to switch between light and dark themes
 */
export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative p-3 rounded-lg
        bg-backgroundAlt dark:bg-backgroundAlt-dark
        hover:bg-backgroundAlt/80 dark:hover:bg-backgroundAlt-dark/80
        transition-colors duration-200
        focus-ring
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <div className="relative w-6 h-6">
        {/* Sun icon (light mode) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            rotate: isDark ? 180 : 0,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Sun className="w-6 h-6 text-yellow-500" />
        </motion.div>

        {/* Moon icon (dark mode) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : -180,
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Moon className="w-6 h-6 text-primary" />
        </motion.div>
      </div>
    </motion.button>
  );
}

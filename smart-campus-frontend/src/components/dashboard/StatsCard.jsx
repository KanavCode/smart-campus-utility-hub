import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";

/**
 * StatsCard Component
 *
 * Displays a statistic with animated counter, icon, and trend indicator
 * Features glassmorphism design and smooth hover effects
 *
 * @param {string} title - Card title/label
 * @param {number} value - Numeric value to display
 * @param {React.Component} icon - Icon component
 * @param {string} iconColor - Tailwind color class for icon background
 * @param {number} change - Percentage change (e.g., 12 for +12%)
 * @param {boolean} isIncrease - Whether change is positive
 * @param {string} suffix - Optional suffix (e.g., '%', 'hrs')
 */
const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "bg-primary",
  change,
  isIncrease = true,
  suffix = "",
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glass-strong rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-text dark:text-text-dark mb-1">
            {displayValue.toLocaleString()}
            {suffix}
          </h3>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  isIncrease ? "text-success" : "text-error"
                }`}
              >
                {isIncrease ? "↑" : "↓"} {Math.abs(change)}%
              </span>
              <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                vs last month
              </span>
            </div>
          )}
        </div>

        <div
          className={`${iconColor} p-3 rounded-xl bg-opacity-20 dark:bg-opacity-30`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Sparkline or progress indicator (optional) */}
      <div className="mt-4 h-1 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (displayValue / value) * 100)}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${iconColor} bg-opacity-70`}
        />
      </div>
    </motion.div>
  );
};

export default memo(StatsCard);

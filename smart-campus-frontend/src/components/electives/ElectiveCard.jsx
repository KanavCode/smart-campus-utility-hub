import { motion } from "framer-motion";
import { memo } from "react";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

/**
 * ElectiveCard Component
 *
 * Displays an elective course with details, seat availability, and selection state
 * Can be used in drag-and-drop contexts
 *
 * @param {Object} elective - Elective course data
 * @param {boolean} isSelected - Whether this elective is selected
 * @param {Function} onSelect - Selection callback
 * @param {boolean} isDragging - Whether card is being dragged
 * @param {Object} dragHandleProps - Props for drag handle (from dnd-kit)
 */

const ElectiveCard = ({
  elective,
  isSelected = false,
  onSelect,
  isDragging = false,
  dragHandleProps,
  showActions = true,
}) => {
  // Calculate seat availability percentage
  const seatPercentage =
    (elective.seats_available / elective.total_seats) * 100;

  // Determine seat status color
  const getSeatColor = () => {
    if (seatPercentage > 50) return "text-success";
    if (seatPercentage > 20) return "text-warning";
    return "text-error";
  };

  const getSeatBgColor = () => {
    if (seatPercentage > 50) return "bg-success/20";
    if (seatPercentage > 20) return "bg-warning/20";
    return "bg-error/20";
  };

  // Difficulty level colors
  const getDifficultyColor = () => {
    switch (elective.difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isDragging ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`
        glass-strong rounded-2xl p-5 transition-all duration-300
        ${isSelected ? "ring-2 ring-primary shadow-xl" : "hover:shadow-lg"}
        ${isDragging ? "opacity-50 rotate-2 scale-95" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-text dark:text-text-dark line-clamp-1">
              {elective.course_code}
            </h3>
            {elective.difficulty && (
              <span
                className={`${getDifficultyColor()} px-2 py-0.5 rounded-full text-xs text-white font-semibold`}
              >
                {elective.difficulty}
              </span>
            )}
          </div>
          <h4 className="text-sm text-text-secondary dark:text-text-secondary-dark line-clamp-2 mb-1">
            {elective.course_name}
          </h4>
        </div>

        {/* Drag Handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Course Details */}
      <div className="space-y-2 mb-4">
        {/* Credits */}
        <div className="flex items-center gap-2 text-sm">
          <AcademicCapIcon className="w-4 h-4 text-primary" />
          <span className="text-text dark:text-text-dark">
            <span className="font-semibold">{elective.credits}</span> Credits
          </span>
        </div>

        {/* Instructor */}
        {elective.instructor && (
          <div className="flex items-center gap-2 text-sm">
            <UserGroupIcon className="w-4 h-4 text-accent" />
            <span className="text-text-secondary dark:text-text-secondary-dark">
              {elective.instructor}
            </span>
          </div>
        )}

        {/* Schedule */}
        {elective.schedule && (
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span className="text-text-secondary dark:text-text-secondary-dark">
              {elective.schedule}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {elective.description && (
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark line-clamp-2 mb-4">
          {elective.description}
        </p>
      )}

      {/* Prerequisites */}
      {elective.prerequisites && elective.prerequisites.length > 0 && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-warning mb-1">
                Prerequisites:
              </p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                {elective.prerequisites.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seat Availability */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary dark:text-text-secondary-dark">
            Seats Available
          </span>
          <span className={`font-semibold ${getSeatColor()}`}>
            {elective.seats_available} / {elective.total_seats}
          </span>
        </div>
        <div className="h-2 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${seatPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${getSeatBgColor()} ${getSeatColor().replace(
              "text-",
              "bg-"
            )}`}
          />
        </div>
      </div>

      {/* Action Button */}
      {showActions && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect?.(elective)}
          disabled={elective.seats_available === 0}
          className={`
            w-full py-2 rounded-lg font-medium transition-all
            ${
              isSelected
                ? "bg-primary text-white shadow-lg"
                : elective.seats_available === 0
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-backgroundAlt dark:bg-backgroundAlt-dark text-text dark:text-text-dark hover:bg-primary hover:text-white"
            }
          `}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Selected
            </span>
          ) : elective.seats_available === 0 ? (
            "Seats Full"
          ) : (
            "Select Elective"
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default memo(ElectiveCard);

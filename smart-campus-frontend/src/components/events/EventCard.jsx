import { motion } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  BookmarkIcon as BookmarkOutline,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useState, memo } from "react";

/**
 * EventCard Component
 *
 * Displays an event with glassmorphism design
 * Features: image, title, date, location, category badge, save button
 * Includes hover animations and click handlers
 *
 * @param {Object} event - Event data object
 * @param {Function} onSave - Save/unsave callback
 * @param {Function} onClick - Card click callback
 * @param {number} index - Index for stagger animation
 */

const EventCard = ({ event, onSave, onClick, index = 0 }) => {
  const [isSaved, setIsSaved] = useState(event.is_saved || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveClick = async (e) => {
    e.stopPropagation(); // Prevent card click
    setIsLoading(true);

    try {
      await onSave?.(event.event_id, !isSaved);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Category color mapping
  const categoryColors = {
    Technical: "bg-blue-500",
    Cultural: "bg-purple-500",
    Sports: "bg-green-500",
    Workshop: "bg-orange-500",
    Seminar: "bg-pink-500",
    Competition: "bg-red-500",
    Social: "bg-teal-500",
    default: "bg-gray-500",
  };

  const categoryColor =
    categoryColors[event.category] || categoryColors.default;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={() => onClick?.(event)}
      className="glass-strong rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full ${categoryColor} bg-opacity-20 flex items-center justify-center`}
          >
            <CalendarIcon className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`${categoryColor} px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg`}
          >
            {event.category}
          </span>
        </div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSaveClick}
          disabled={isLoading}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-backgroundAlt-dark/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-backgroundAlt-dark transition-colors"
        >
          {isSaved ? (
            <BookmarkSolid className="w-5 h-5 text-primary" />
          ) : (
            <BookmarkOutline className="w-5 h-5 text-text dark:text-text-dark" />
          )}
        </motion.button>
      </div>

      {/* Event Details */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-text dark:text-text-dark mb-3 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(event.event_date)}</span>
          </div>

          {/* Time */}
          {event.start_time && (
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
              <ClockIcon className="w-4 h-4" />
              <span>{formatTime(event.start_time)}</span>
              {event.end_time && <span> - {formatTime(event.end_time)}</span>}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            <MapPinIcon className="w-4 h-4" />
            <span className="line-clamp-1">{event.location || "TBA"}</span>
          </div>

          {/* Organizer */}
          {event.organizer && (
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
              <UsersIcon className="w-4 h-4" />
              <span className="line-clamp-1">{event.organizer}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {event.description && (
          <p className="mt-3 text-sm text-text-secondary dark:text-text-secondary-dark line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg font-medium transition-colors"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

export default memo(EventCard);

import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  LinkIcon,
  ShareIcon,
  BookmarkIcon as BookmarkOutline,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useState } from "react";

/**
 * EventDetailsModal Component
 *
 * Full-screen modal showing complete event details
 * Features: description, organizer, venue, registration link, save/share buttons
 */

const EventDetailsModal = ({
  event,
  isOpen,
  onClose,
  onSave,
  isSaved: initialSaved,
}) => {
  const [isSaved, setIsSaved] = useState(
    initialSaved || event?.is_saved || false
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!event) return null;

  const handleSave = async () => {
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <div className="glass-strong rounded-3xl h-full flex flex-col shadow-2xl">
              {/* Header */}
              <div className="relative">
                {/* Hero Image */}
                <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full ${categoryColor} bg-opacity-30 flex items-center justify-center`}
                    >
                      <CalendarIcon className="w-24 h-24 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`${categoryColor} px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg`}
                    >
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-backgroundAlt-dark/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-backgroundAlt-dark transition-colors shadow-lg"
                >
                  <XMarkIcon className="w-6 h-6 text-text dark:text-text-dark" />
                </button>

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="w-10 h-10 bg-white/90 dark:bg-backgroundAlt-dark/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-backgroundAlt-dark transition-colors shadow-lg"
                  >
                    <ShareIcon className="w-5 h-5 text-text dark:text-text-dark" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-10 h-10 bg-white/90 dark:bg-backgroundAlt-dark/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-backgroundAlt-dark transition-colors shadow-lg"
                  >
                    {isSaved ? (
                      <BookmarkSolid className="w-5 h-5 text-primary" />
                    ) : (
                      <BookmarkOutline className="w-5 h-5 text-text dark:text-text-dark" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-text dark:text-text-dark">
                  {event.title}
                </h1>

                {/* Quick Info Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        Date
                      </p>
                      <p className="font-semibold text-text dark:text-text-dark">
                        {formatDate(event.event_date)}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  {event.start_time && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                          Time
                        </p>
                        <p className="font-semibold text-text dark:text-text-dark">
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        Location
                      </p>
                      <p className="font-semibold text-text dark:text-text-dark">
                        {event.location || "To be announced"}
                      </p>
                    </div>
                  </div>

                  {/* Organizer */}
                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                          Organized by
                        </p>
                        <p className="font-semibold text-text dark:text-text-dark">
                          {event.organizer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-text dark:text-text-dark mb-3">
                    About This Event
                  </h2>
                  <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed whitespace-pre-line">
                    {event.description || "No description available."}
                  </p>
                </div>

                {/* Registration Link */}
                {event.registration_link && (
                  <div className="p-4 bg-backgroundAlt dark:bg-backgroundAlt-dark rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-text dark:text-text-dark">
                        Registration
                      </h3>
                    </div>
                    <a
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-light underline text-sm break-all"
                    >
                      {event.registration_link}
                    </a>
                  </div>
                )}

                {/* Register Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (event.registration_link) {
                      window.open(event.registration_link, "_blank");
                    }
                  }}
                  className="w-full py-4 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Register Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventDetailsModal;

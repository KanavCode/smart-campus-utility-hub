import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

/**
 * EventFilters Component
 *
 * Filtering sidebar for events page
 * Features: category checkboxes, date range, search, club filter
 * Responsive collapse on mobile
 */

const categories = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Competition",
  "Social",
];

const timeFilters = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Upcoming", value: "upcoming" },
];

const EventFilters = ({ filters, onFilterChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters?.search || "");

  const handleCategoryToggle = (category) => {
    const currentCategories = filters?.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onFilterChange?.({ ...filters, categories: newCategories });
  };

  const handleTimeFilterChange = (timeFilter) => {
    onFilterChange?.({ ...filters, timeFilter });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onFilterChange?.({ ...filters, search: value });
    }, 300);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    onClear?.();
  };

  const activeFiltersCount =
    (filters?.categories?.length || 0) +
    (filters?.timeFilter ? 1 : 0) +
    (filters?.search ? 1 : 0);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 glass-strong rounded-xl"
        >
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text dark:text-text-dark">
              Filters
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-strong rounded-2xl p-6 space-y-6 lg:sticky lg:top-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-text dark:text-text-dark">
                  Filters
                </h3>
              </div>
              <button
                onClick={handleClearAll}
                className="text-sm text-primary hover:text-primary-light transition-colors font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-semibold text-text dark:text-text-dark mb-2 block">
                Search Events
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-backgroundAlt-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Time Filter */}
            <div>
              <label className="text-sm font-semibold text-text dark:text-text-dark mb-3 block">
                When
              </label>
              <div className="space-y-2">
                {timeFilters.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => handleTimeFilterChange(time.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      filters?.timeFilter === time.value
                        ? "bg-primary text-white"
                        : "hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark text-text dark:text-text-dark"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-semibold text-text dark:text-text-dark mb-3 block">
                Category
              </label>
              <div className="space-y-2">
                {categories.map((category) => {
                  const isSelected = filters?.categories?.includes(category);
                  return (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 rounded border-border dark:border-border-dark text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-sm text-text dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                        {category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t border-border dark:border-border-dark">
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                  active
                </p>
              </div>
            )}

            {/* Close button for mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-primary hover:bg-primary-light text-white rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EventFilters;

/**
 * Utility Helper Functions
 * Engineer 💻: Clean, reusable utilities for common operations
 */

import { format, formatDistance, parseISO, isAfter, isBefore } from 'date-fns';

// ============================================
// DATE & TIME UTILITIES
// ============================================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format pattern (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy · hh:mm a');
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Relative time error:', error);
    return 'Unknown';
  }
};

/**
 * Check if event is upcoming
 * @param {string|Date} eventDate - Event date
 * @returns {boolean} True if event is in the future
 */
export const isUpcoming = (eventDate) => {
  try {
    const dateObj = typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
    return isAfter(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Check if event has passed
 * @param {string|Date} eventDate - Event date
 * @returns {boolean} True if event is in the past
 */
export const isPast = (eventDate) => {
  try {
    const dateObj = typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
    return isBefore(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated string with ellipsis
 */
export const truncate = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert to title case
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 letters)
 */
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ============================================
// NUMBER UTILITIES
// ============================================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Convert number to compact format (e.g., 1.2K, 3.4M)
 * @param {number} num - Number to format
 * @returns {string} Compact number
 */
export const compactNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Group array items by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array with potential duplicates
 * @param {string} key - Optional key for objects
 * @returns {Array} Array without duplicates
 */
export const unique = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, strength: string, message: string }
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteria = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
  const metCriteria = criteria.filter(Boolean).length;

  if (password.length < minLength) {
    return {
      isValid: false,
      strength: 'weak',
      message: `Password must be at least ${minLength} characters`,
    };
  }

  if (metCriteria < 2) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Password is too weak',
    };
  }

  if (metCriteria === 2) {
    return {
      isValid: true,
      strength: 'medium',
      message: 'Password strength: Medium',
    };
  }

  return {
    isValid: true,
    strength: 'strong',
    message: 'Password strength: Strong',
  };
};

// ============================================
// COLOR UTILITIES
// ============================================

/**
 * Generate random color
 * @returns {string} Hex color code
 */
export const randomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Get color based on category
 * @param {string} category - Category name
 * @returns {string} Tailwind color class
 */
export const getCategoryColor = (category) => {
  const colors = {
    technical: 'bg-blue-500',
    cultural: 'bg-purple-500',
    sports: 'bg-green-500',
    workshop: 'bg-orange-500',
    seminar: 'bg-pink-500',
    hackathon: 'bg-red-500',
    default: 'bg-gray-500',
  };
  
  return colors[category?.toLowerCase()] || colors.default;
};

// ============================================
// LOCAL STORAGE UTILITIES
// ============================================

/**
 * Safe localStorage getter with fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Storage get error:', error);
    return defaultValue;
  }
};

/**
 * Safe localStorage setter
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Storage remove error:', error);
  }
};

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - limits execution to once per time period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// CLASS NAME UTILITIES
// ============================================

/**
 * Conditionally join class names
 * @param  {...any} classes - Class names
 * @returns {string} Joined class string
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

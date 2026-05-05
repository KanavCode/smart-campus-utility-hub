/**
 * Parse a value to integer with proper error handling
 * @param {*} value - Value to parse
 * @param {Object} options - Options object
 * @param {number} options.min - Minimum allowed value (optional)
 * @param {number} options.max - Maximum allowed value (optional)
 * @param {boolean} options.throw - Whether to throw error on invalid value (default: false)
 * @returns {number|null} Parsed integer or null if invalid
 * @throws {Error} If throw option is true and value is invalid
 */
const parseInteger = (value, options = {}) => {
  const { min = null, max = null, throw: shouldThrow = false } = options;

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed)) {
    if (shouldThrow) {
      throw new Error(`Invalid integer value: ${value}`);
    }
    return null;
  }

  if (min !== null && parsed < min) {
    if (shouldThrow) {
      throw new Error(`Value must be at least ${min}, got ${parsed}`);
    }
    return null;
  }

  if (max !== null && parsed > max) {
    if (shouldThrow) {
      throw new Error(`Value must be at most ${max}, got ${parsed}`);
    }
    return null;
  }

  return parsed;
};

const parsePagination = (pageValue = 1, limitValue = 50) => {
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 50;
  const MAX_LIMIT = 100;

  let page = parseInteger(pageValue);
  let limit = parseInteger(limitValue);

  if (!Number.isInteger(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  if (!Number.isInteger(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

module.exports = {
  parseInteger,
  parsePagination,
};

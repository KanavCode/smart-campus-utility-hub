const parseInteger = (value) => Number.parseInt(value, 10);

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
    offset: (page - 1) * limit
  };
};

module.exports = {
  parseInteger,
  parsePagination
};
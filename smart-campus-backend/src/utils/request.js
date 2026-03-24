const parseInteger = (value) => Number.parseInt(value, 10);

const parsePagination = (pageValue = 1, limitValue = 50) => {
  const page = parseInteger(pageValue);
  const limit = parseInteger(limitValue);

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

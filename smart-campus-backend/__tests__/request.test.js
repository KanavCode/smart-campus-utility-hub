const { parsePagination } = require('../src/utils/request');

describe('parsePagination', () => {
  test('returns valid page and limit', () => {
    const result = parsePagination(2, 20);

    expect(result).toEqual({
      page: 2,
      limit: 20,
      offset: 20
    });
  });

  test('falls back to defaults for invalid values', () => {
    const result = parsePagination('abc', 'xyz');

    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  test('page cannot be less than 1', () => {
    const result = parsePagination(-5, 10);

    expect(result.page).toBe(1);
  });

  test('limit cannot be less than 1', () => {
    const result = parsePagination(1, 0);

    expect(result.limit).toBe(50);
  });

  test('limit cannot exceed max limit', () => {
    const result = parsePagination(1, 500);

    expect(result.limit).toBe(100);
  });
});
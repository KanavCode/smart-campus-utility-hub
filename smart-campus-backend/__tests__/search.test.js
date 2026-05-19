const globalSearch = require('../../src/components/search/search.controller');
const { query } = require('../../config/db');
const { sendSuccess } = require('../../src/utils/response');

jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

jest.mock('../../src/utils/response', () => ({
  sendSuccess: jest.fn()
}));

describe('Search Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { query: {} };
    res = {};
  });

  describe('globalSearch', () => {
    it('should return empty results when query is empty', async () => {
      req.query = { q: '' };

      await globalSearch.globalSearch(req, res);

      expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Search results', {
        results: [],
        query: ''
      });
    });

    it('should return empty results when query is whitespace only', async () => {
      req.query = { q: '   ' };

      await globalSearch.globalSearch(req, res);

      expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Search results', {
        results: [],
        query: '   '
      });
    });

    it('should search across multiple entities and combine results', async () => {
      const mockRows = {
        events: { rows: [{ id: 1, name: 'Event 1', description: 'desc', type: 'event' }] },
        clubs: { rows: [{ id: 2, name: 'Club 1', description: 'desc', type: 'club' }] },
        electives: { rows: [{ id: 3, name: 'Elective 1', description: 'desc', type: 'elective' }] },
        subjects: { rows: [{ id: 4, name: 'Subject 1', code: 'SUB101', type: 'subject' }] },
        teachers: { rows: [{ id: 5, name: 'Teacher 1', description: 'CS Dept', type: 'teacher' }] }
      };

      query
        .mockResolvedValueOnce(mockRows.events)
        .mockResolvedValueOnce(mockRows.clubs)
        .mockResolvedValueOnce(mockRows.electives)
        .mockResolvedValueOnce(mockRows.subjects)
        .mockResolvedValueOnce(mockRows.teachers);

      req.query = { q: 'test' };

      await globalSearch.globalSearch(req, res);

      expect(query).toHaveBeenCalledTimes(5);
      expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Search results fetched successfully', {
        results: [
          ...mockRows.events.rows,
          ...mockRows.clubs.rows,
          ...mockRows.electives.rows,
          ...mockRows.subjects.rows,
          ...mockRows.teachers.rows
        ],
        query: 'test',
        count: 5
      });
    });

    it('should use parameterized queries with ILIKE for SQL sanitization', async () => {
      query.mockResolvedValue({ rows: [] });
      req.query = { q: "test'; DROP TABLE users;--" };

      await globalSearch.globalSearch(req, res);

      const expectedSearchTerm = "%test'; DROP TABLE users;--%";

      expect(query).toHaveBeenCalledWith(
        "SELECT id, title as name, description, 'event' as type FROM events WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 5",
        [expectedSearchTerm]
      );
      expect(query).toHaveBeenCalledWith(
        "SELECT id, name, description, 'club' as type FROM clubs WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5",
        [expectedSearchTerm]
      );
      expect(query).toHaveBeenCalledWith(
        "SELECT id, name, description, 'elective' as type FROM electives WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5",
        [expectedSearchTerm]
      );
      expect(query).toHaveBeenCalledWith(
        "SELECT id, name, code as description, 'subject' as type FROM subjects WHERE name ILIKE $1 OR code ILIKE $1 LIMIT 5",
        [expectedSearchTerm]
      );
      expect(query).toHaveBeenCalledWith(
        "SELECT id, name, department as description, 'teacher' as type FROM teachers WHERE name ILIKE $1 OR department ILIKE $1 LIMIT 5",
        [expectedSearchTerm]
      );
    });

    it('should handle database errors gracefully', async () => {
      query.mockRejectedValue(new Error('Database error'));

      req.query = { q: 'test' };

      await expect(globalSearch.globalSearch(req, res)).rejects.toThrow('Database error');
    });
  });
});
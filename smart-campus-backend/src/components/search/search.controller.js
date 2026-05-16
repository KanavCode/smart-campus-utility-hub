const { sendSuccess } = require('../../utils/response');
const { query } = require('../../config/db');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Global Search Controller
 */

/**
 * Perform a global search across multiple entities
 * GET /api/search?q=query
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return sendSuccess(res, 200, 'Search results', {
      results: [],
      query: q
    });
  }

  const searchTerm = `%${q}%`;
  
  // Search Events
  const eventsPromise = query(
    'SELECT id, title as name, description, \'event\' as type FROM events WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 5',
    [searchTerm]
  );

  // Search Clubs
  const clubsPromise = query(
    'SELECT id, name, description, \'club\' as type FROM clubs WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5',
    [searchTerm]
  );

  // Search Electives
  const electivesPromise = query(
    'SELECT id, name, description, \'elective\' as type FROM electives WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5',
    [searchTerm]
  );

  // Search Subjects
  const subjectsPromise = query(
    'SELECT id, name, code as description, \'subject\' as type FROM subjects WHERE name ILIKE $1 OR code ILIKE $1 LIMIT 5',
    [searchTerm]
  );

  // Search Teachers
  const teachersPromise = query(
    'SELECT id, name, department as description, \'teacher\' as type FROM teachers WHERE name ILIKE $1 OR department ILIKE $1 LIMIT 5',
    [searchTerm]
  );

  const [events, clubs, electives, subjects, teachers] = await Promise.all([
    eventsPromise,
    clubsPromise,
    electivesPromise,
    subjectsPromise,
    teachersPromise
  ]);

  const allResults = [
    ...events.rows,
    ...clubs.rows,
    ...electives.rows,
    ...subjects.rows,
    ...teachers.rows
  ];

  sendSuccess(res, 200, 'Search results fetched successfully', {
    results: allResults,
    query: q,
    count: allResults.length
  });
});

module.exports = {
  globalSearch
};

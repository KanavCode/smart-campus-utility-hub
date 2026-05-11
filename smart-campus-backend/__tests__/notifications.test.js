const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  transaction: jest.fn((callback) => callback({ query: jest.fn() })),
  testConnection: jest.fn().mockResolvedValue(true),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const { query } = require('../src/config/db');
const { generateToken } = require('../src/middleware/auth.middleware');

describe('Notifications API Tests', () => {
  let studentToken;

  beforeAll(() => {
    studentToken = generateToken({ id: 1, email: 'student@example.com', role: 'student' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  test('GET /api/notifications should return notifications list', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ id: 1, event_type: 'EVENT_CREATED', title: 'New Event', message: 'New event available', is_read: false }],
      })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notifications).toHaveLength(1);
    expect(response.body.data.unreadCount).toBe(1);
  });

  test('PATCH /api/notifications/:id/read should mark notification read', async () => {
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, is_read: true }],
    });

    const response = await request(app)
      .patch('/api/notifications/1/read')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('PATCH /api/notifications/read-all should mark all notifications read', async () => {
    query.mockResolvedValueOnce({ rowCount: 3, rows: [{ id: 1 }, { id: 2 }, { id: 3 }] });

    const response = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.updated).toBe(3);
  });
});

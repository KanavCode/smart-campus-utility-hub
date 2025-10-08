/**
 * Middleware Test File
 * Tests authentication and validation middleware
 */

const jwt = require('jsonwebtoken');
const { verifyToken, generateToken } = require('../src/middleware/auth.middleware');
const { validate, validationSchemas } = require('../src/middleware/validation');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

describe('Middleware Tests', () => {
  describe('Authentication Middleware', () => {
    test('should generate a valid JWT token', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'student' };
      const token = generateToken(payload, '1h');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify the token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    test('should verify valid token in request', (done) => {
      const payload = { id: 1, email: 'test@example.com', role: 'student' };
      const token = generateToken(payload, '1h');
      
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {};
      const next = (err) => {
        if (err) return done(err);
        
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(payload.id);
        expect(req.user.email).toBe(payload.email);
        done();
      };
      
      verifyToken(req, res, next);
    });

    test('should reject request without token', (done) => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      verifyToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('No token provided')
        })
      );
      expect(next).not.toHaveBeenCalled();
      done();
    });
  });

  describe('Validation Middleware', () => {
    test('should validate correct login data', (done) => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {};
      const next = (err) => {
        if (err) return done(err);
        expect(req.body.email).toBe('test@example.com');
        done();
      };
      
      const middleware = validate(validationSchemas.login);
      middleware(req, res, next);
    });

    test('should reject invalid email format', (done) => {
      const req = {
        body: {
          email: 'invalid-email',
          password: 'password123'
        }
      };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain('email');
        done();
      };
      
      const middleware = validate(validationSchemas.login);
      middleware(req, res, next);
    });
  });
});

// Tests will run automatically with Jest

/**
 * Email Service Tests
 * Tests for password reset and confirmation emails
 */

process.env.NODE_ENV = 'test';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

const nodemailer = require('nodemailer');
const { logger } = require('../src/config/db');
const { sendPasswordResetEmail, sendPasswordResetConfirmation, escapeHtml } = require('../src/utils/emailService');

describe('Email Service Tests', () => {
  let mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter = nodemailer.createTransport();
  });

  describe('sendPasswordResetEmail', () => {
    test('should call transporter with correct mailOptions including sanitized resetLink', async () => {
      const email = 'test@example.com';
      const resetToken = 'test-reset-token-123';
      const resetLink = 'https://smartcampus.edu/reset-password?token=<script>alert(1)</script>';

      await sendPasswordResetEmail(email, resetToken, resetLink);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      const mailOptions = mockTransporter.sendMail.mock.calls[0][0];

      expect(mailOptions.from).toBe('noreply@smartcampus.edu');
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toBe('Password Reset Request - Smart Campus');
      expect(mailOptions.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(mailOptions.html).not.toContain('<script>alert(1)</script>');
    });

    test('should log successful email sending', async () => {
      const email = 'test@example.com';
      const resetToken = 'test-reset-token';
      const resetLink = 'https://smartcampus.edu/reset-password?token=abc123';

      await sendPasswordResetEmail(email, resetToken, resetLink);

      expect(logger.info).toHaveBeenCalledWith('Password reset email sent', {
        email,
        messageId: 'test-message-id'
      });
    });

    test('should throw error and log failure when sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

      const email = 'test@example.com';
      const resetToken = 'test-reset-token';
      const resetLink = 'https://smartcampus.edu/reset-password?token=abc123';

      await expect(sendPasswordResetEmail(email, resetToken, resetLink))
        .rejects.toThrow('Failed to send password reset email');

      expect(logger.error).toHaveBeenCalledWith('Failed to send password reset email', {
        email,
        error: 'SMTP error'
      });
    });
  });

  describe('sendPasswordResetConfirmation', () => {
    test('should send confirmation email with user name', async () => {
      const email = 'test@example.com';
      const fullName = 'John Doe';

      await sendPasswordResetConfirmation(email, fullName);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      const mailOptions = mockTransporter.sendMail.mock.calls[0][0];

      expect(mailOptions.from).toBe('noreply@smartcampus.edu');
      expect(mailOptions.to).toBe(email);
      expect(mailOptions.subject).toBe('Password Reset Successful - Smart Campus');
      expect(mailOptions.html).toContain(`Hi ${fullName}`);
      expect(mailOptions.html).toContain('Password Reset Successful');
      expect(mailOptions.text).toContain(`Hi ${fullName}`);
    });

    test('should log successful confirmation email sending', async () => {
      const email = 'test@example.com';
      const fullName = 'Jane Doe';

      await sendPasswordResetConfirmation(email, fullName);

      expect(logger.info).toHaveBeenCalledWith('Password reset confirmation email sent', {
        email,
        messageId: 'test-message-id'
      });
    });

    test('should throw error and log failure when confirmation sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Connection timeout'));

      const email = 'test@example.com';
      const fullName = 'Test User';

      await expect(sendPasswordResetConfirmation(email, fullName))
        .rejects.toThrow('Failed to send confirmation email');

      expect(logger.error).toHaveBeenCalledWith('Failed to send password reset confirmation email', {
        email,
        error: 'Connection timeout'
      });
    });
  });

  describe('escapeHtml', () => {
    test('should escape ampersand character', () => {
      expect(escapeHtml('Test & Value')).toBe('Test &amp; Value');
    });

    test('should escape less than character', () => {
      expect(escapeHtml('<html>')).toBe('&lt;html&gt;');
    });

    test('should escape greater than character', () => {
      expect(escapeHtml('5 > 3')).toBe('5 &gt; 3');
    });

    test('should escape double quotes', () => {
      expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;');
    });

    test('should escape single quotes', () => {
      expect(escapeHtml("User's email")).toBe('User&#039;s email');
    });

    test('should escape multiple special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('should return empty string for null input', () => {
      expect(escapeHtml(null)).toBe('');
    });

    test('should return empty string for undefined input', () => {
      expect(escapeHtml(undefined)).toBe('');
    });

    test('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    test('should return text unchanged if no special characters', () => {
      expect(escapeHtml('Plain text without special chars')).toBe('Plain text without special chars');
    });
  });
});
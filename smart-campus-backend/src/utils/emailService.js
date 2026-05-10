const nodemailer = require('nodemailer');
const { logger } = require('../config/db');

/**
 * Email Service
 * Handles sending emails using Mailtrap for development/testing
 */

// Initialize transporter
let transporter = null;

const initializeTransporter = () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'production') {
    // Production: Use your actual email service
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development: Use Mailtrap
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || 'live.smtp.mailtrap.io',
      port: process.env.MAILTRAP_PORT || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  return transporter;
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Reset token
 * @param {string} resetLink - Full reset link URL
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  try {
    const emailTransporter = initializeTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartcampus.edu',
      to: email,
      subject: 'Password Reset Request - Smart Campus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Smart Campus Utility Hub</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset the password for your Smart Campus account. 
              If you didn't make this request, you can ignore this email.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              To reset your password, click the button below. This link will expire in 15 minutes.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
              Or copy and paste this link in your browser: <br/>
              <code style="color: #666; word-break: break-all;">${resetLink}</code>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              For security reasons, do not share this link with anyone. 
              If you have any questions, contact our support team.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request

        We received a request to reset the password for your Smart Campus account.
        
        To reset your password, visit this link (expires in 15 minutes):
        ${resetLink}
        
        If you didn't request this, you can ignore this email.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info('Password reset email sent', { email, messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Failed to send password reset email', {
      email,
      error: error.message,
    });
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send password reset confirmation email
 * @param {string} email - Recipient email
 * @param {string} fullName - User's full name
 * @returns {Promise<void>}
 */
const sendPasswordResetConfirmation = async (email, fullName) => {
  try {
    const emailTransporter = initializeTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartcampus.edu',
      to: email,
      subject: 'Password Reset Successful - Smart Campus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Smart Campus Utility Hub</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px;">
            <h2 style="color: #333;">Password Reset Successful</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hi ${fullName},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Your password has been successfully reset. You can now log in to your Smart Campus account 
              with your new password.
            </p>
            
            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32; font-weight: bold;">✓ Your account is secure</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't reset your password, please secure your account immediately by 
              <a href="mailto:support@smartcampus.edu" style="color: #667eea;">contacting our support team</a>.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              For security questions, contact our support team at support@smartcampus.edu
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Successful

        Hi ${fullName},

        Your password has been successfully reset. You can now log in to your Smart Campus account 
        with your new password.

        If you didn't reset your password, please secure your account immediately by 
        contacting our support team at support@smartcampus.edu
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info('Password reset confirmation email sent', { email, messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Failed to send password reset confirmation email', {
      email,
      error: error.message,
    });
    throw new Error('Failed to send confirmation email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  initializeTransporter,
};

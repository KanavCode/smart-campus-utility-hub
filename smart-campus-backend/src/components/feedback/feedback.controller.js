const { sendSuccess, sendError } = require('../../utils/response');
const { logger } = require('../../config/db');

const submitFeedback = async (req, res) => {
  const { description, page } = req.body;
  const { email, role } = req.user;

  if (!description || !description.trim()) {
    return sendError(res, 400, 'Bug description is required');
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.warn('DISCORD_WEBHOOK_URL is not configured');
    return sendError(res, 503, 'Feedback service is not configured');
  }

  const embed = {
    title: '🐛 New Bug Report',
    color: 0xe74c3c,
    fields: [
      { name: '👤 Reported By', value: email, inline: true },
      { name: '🎭 Role', value: role, inline: true },
      { name: '📄 Page', value: page || 'Unknown', inline: true },
      { name: '📝 Description', value: description.trim() },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'Smart Campus Utility Hub' },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      logger.error('Discord webhook failed', { status: response.status });
      return sendError(res, 502, 'Failed to send feedback to Discord');
    }

    return sendSuccess(res, 200, 'Bug report submitted successfully');
  } catch (error) {
    logger.error('Discord webhook error:', error);
    return sendError(res, 500, 'Failed to submit bug report');
  }
};

module.exports = { submitFeedback };

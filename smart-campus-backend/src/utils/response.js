const sendSuccess = (res, statusCode = 200, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, statusCode = 500, message, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error
  });
};

module.exports = { sendSuccess, sendError };
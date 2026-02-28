export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorType = err.errorType || "UNKNOWN_ERROR";

  res.status(status).json({
    success: false,
    message,
    errorType
  });
};

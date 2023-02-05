const errorHandler = (err, req, res, next) => {
  if (res.headersSent) { // if headers already sent, pass error to next middleware
    return next(err);
  }

  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = errorHandler;
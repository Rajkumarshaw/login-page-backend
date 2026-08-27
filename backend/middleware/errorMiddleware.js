const errorMiddleware = (err, req, res, next) => {
  console.error('API Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // Handle Mongoose CastError (invalid ObjectID format)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Resource not found. Invalid ID format.' });
  }

  // Handle duplicate key error (MongoDB)
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `A record with this ${key} already exists.` });
  }

  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal server error occurred.'
      : message,
  });
};

export default errorMiddleware;
